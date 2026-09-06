// 开发辅助：将小林的项目内容更新为英文（重生成语音、替换音频、更新数据行）
// 用法：export 环境变量后 node scripts/update-xiaolin-english.mjs（临时脚本，一次性）
import { createHash } from "node:crypto";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const EK = process.env.ELEVENLABS_API_KEY;
if (!URL || !SERVICE || !EK) throw new Error("缺少环境变量");

const HDRS = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json" };

const PROJECT_ID = "499a563e-73f4-45a3-ac51-3e13eb9d4b04";
const UID = "cf2a2798-2b4b-4206-ba3b-2cbb79632658";
const OLD_PATH = "projects/cf2a2798-2b4b-4206-ba3b-2cbb79632658/xiaolin-vision.mp3";
const NEW_PATH = "projects/cf2a2798-2b4b-4206-ba3b-2cbb79632658/xiaolin-vision-en.mp3";
const VOICE = "Fl6SiqWjBJzoqMQHWHaa"; // The Steady Advocate

const EN = {
  title: "Speaking up for my city, for our sky",
  vision: `Hi everyone, I'm Xiao Lin, and I'm 19 years old.

Three years ago, an illness took away my ability to deliver a single complete speech. The doctors say it may recover — or it may not. But the climate work I want to do cannot wait for my voice.

In my city, I have seen classmates who keep cycling to school through the smog, and a volunteer team that spent an entire summer picking up trash along the river. These young people don't need anyone to act for them — but they do need someone to speak for them. And today, AI is lending me that voice.

I believe the right to express yourself should never be taken away by your health condition. Thank you for hearing me. If you care about the same sky over your head as I do, please support the community climate action we are building.

This is not my voice, but it is my heart.`,
  health: "Organic vocal cord injury: I cannot sustain more than a minute of continuous speech, so long speeches are not possible. This statement is voluntary and comes with no medical proof — please judge for yourself.",
};

async function main() {
  // 1. ElevenLabs 生成英文语音（§2.4 强制披露参数）
  console.log("生成英文语音…（约", EN.vision.length, "字符）");
  const tts = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: { "xi-api-key": EK, "Content-Type": "application/json" },
      body: JSON.stringify({ text: EN.vision, model_id: "eleven_flash_v2_5", ai_disclosure: true }),
    },
  );
  if (!tts.ok) throw new Error("TTS 失败: " + (await tts.text()));
  const audio = Buffer.from(await tts.arrayBuffer());
  console.log("语音生成完成:", audio.length, "bytes");

  // 2. 上传新音频（新路径，避免 CDN 缓存旧文件）
  const up = await fetch(`${URL}/storage/v1/object/audio/${NEW_PATH}`, {
    method: "POST",
    headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "audio/mpeg" },
    body: audio,
  });
  if (!up.ok) throw new Error("上传失败: " + (await up.text()));
  console.log("新音频已上传:", NEW_PATH);

  // 3. 更新项目行
  const anchorHash = createHash("sha256").update(EN.title + EN.vision + EN.health).digest("hex");
  const pr = await fetch(`${URL}/rest/v1/projects?id=eq.${PROJECT_ID}`, {
    method: "PATCH",
    headers: HDRS,
    body: JSON.stringify({
      title: EN.title,
      vision_text: EN.vision,
      health_reason: EN.health,
      audio_path: NEW_PATH,
      anchor_hash: anchorHash,
    }),
  });
  if (!pr.ok) throw new Error("更新失败: " + (await pr.text()));
  console.log("✅ 项目内容已更新为英文");

  // 4. 删除旧中文音频
  const del = await fetch(`${URL}/storage/v1/object/audio/${OLD_PATH}`, {
    method: "DELETE",
    headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` },
  });
  console.log("旧音频删除:", del.ok ? "成功" : await del.text());
}

main().catch((e) => { console.error("FAILED:", e.message); process.exit(1); });
