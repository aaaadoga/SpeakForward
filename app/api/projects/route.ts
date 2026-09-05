import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPersona, MAX_VISION_CHARS } from "@/lib/personas";

export const dynamic = "force-dynamic";

interface CreateProjectBody {
  title: string;
  vision_text: string;
  health_reason: string;
  persona: string;
  creator_wallet: string;
  anchor_tx_signature: string;
  anchor_hash: string;
}

// §2.3: 媒体绝不存链上；链上仅 Memo 锚定哈希（anchor_hash 由客户端钱包签名交易）
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  // §2.1: 年龄自我声明必须已完成
  const { data: profile } = await supabase
    .from("profiles")
    .select("age_declared")
    .eq("id", userData.user.id)
    .single();
  if (!profile?.age_declared) {
    return NextResponse.json({ error: "请先完成年龄自我声明" }, { status: 403 });
  }

  const body = (await request.json()) as CreateProjectBody;
  const title = (body.title ?? "").trim();
  const visionText = (body.vision_text ?? "").trim();
  const healthReason = (body.health_reason ?? "").trim();
  const persona = getPersona(body.persona ?? "");
  const creatorWallet = (body.creator_wallet ?? "").trim();
  const anchorTx = (body.anchor_tx_signature ?? "").trim();
  const anchorHash = (body.anchor_hash ?? "").trim();

  // §2.4: 健康原因声明为必填 —— 公开展示是产品特性而非隐私侵犯
  if (!title || !visionText || !healthReason || !persona) {
    return NextResponse.json(
      { error: "标题、愿景文本、健康原因声明与人格选择均为必填" },
      { status: 400 },
    );
  }
  if (visionText.length > MAX_VISION_CHARS) {
    return NextResponse.json(
      { error: `愿景文本超过 ${MAX_VISION_CHARS} 字符上限` },
      { status: 400 },
    );
  }

  // 调用 ElevenLabs 同步生成整段 mp3（§技术决议 M3；§2.4 强制 AI 披露元数据）
  const ttsResponse = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${persona.voiceId}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: {
        "xi-api-key": process.env.ELEVENLABS_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: visionText,
        model_id: "eleven_flash_v2_5",
        // §2.4: 嵌入 ElevenLabs 原生 AI 披露参数
        ai_disclosure: true,
      }),
    },
  );

  if (!ttsResponse.ok) {
    // §5 降级预案：ElevenLabs 失败/限流 → 前端回退 Web Speech API。
    // 服务端仍先落库（无 audio），项目页自动进入"临时语音引擎"模式。
    const admin = createAdminClient();
    const { data: project, error: dbError } = await admin
      .from("projects")
      .insert({
        user_id: userData.user.id,
        title,
        vision_text: visionText,
        health_reason: healthReason,
        persona: persona.id,
        creator_wallet: creatorWallet || null,
        anchor_tx_signature: anchorTx || null,
        anchor_hash: anchorHash || null,
      })
      .select()
      .single();
    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }
    return NextResponse.json(
      { ...project, tts_degraded: true },
      { status: 201 },
    );
  }

  const audioBuffer = Buffer.from(await ttsResponse.arrayBuffer());

  // 上传至 Supabase Storage（S3 兼容，§2.3 媒体绝不存链上）
  const audioPath = `projects/${userData.user.id}/${Date.now()}.mp3`;
  const admin = createAdminClient();
  const { error: uploadError } = await admin.storage
    .from("audio")
    .upload(audioPath, audioBuffer, {
      contentType: "audio/mpeg",
      upsert: false,
    });
  if (uploadError) {
    return NextResponse.json({ error: `音频上传失败: ${uploadError.message}` }, { status: 500 });
  }

  const { data: project, error: dbError } = await admin
    .from("projects")
    .insert({
      user_id: userData.user.id,
      title,
      vision_text: visionText,
      health_reason: healthReason,
      persona: persona.id,
      audio_path: audioPath,
      creator_wallet: creatorWallet || null,
      anchor_tx_signature: anchorTx || null,
      anchor_hash: anchorHash || null,
    })
    .select()
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }
  return NextResponse.json(project, { status: 201 });
}
