// 开发辅助：预置小林的账号、语音与项目（含真实 Memo 锚定交易）
// 用法：先 export 各环境变量，再 node scripts/seed-xiaolin.mjs
// 密钥从环境变量读取，本脚本不含任何秘密，可安全提交
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, TransactionInstruction, clusterApiUrl } from "@solana/web3.js";
import { createHash } from "node:crypto";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const EK = process.env.ELEVENLABS_API_KEY;
if (!URL || !SERVICE || !EK) throw new Error("缺少环境变量");

const HDRS = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json" };

// §2.5: 小林 —— 19岁气候倡导者，因健康原因言语受限
const XIAOLIN = {
  email: "xiaolin.lin@example.com",
  title: "Speaking up for my city, for our sky",
  vision: `Hi everyone, I'm Xiao Lin, and I'm 19 years old.

Three years ago, an illness took away my ability to deliver a single complete speech. The doctors say it may recover — or it may not. But the climate work I want to do cannot wait for my voice.

In my city, I have seen classmates who keep cycling to school through the smog, and a volunteer team that spent an entire summer picking up trash along the river. These young people don't need anyone to act for them — but they do need someone to speak for them. And today, AI is lending me that voice.

I believe the right to express yourself should never be taken away by your health condition. Thank you for hearing me. If you care about the same sky over your head as I do, please support the community climate action we are building.

This is not my voice, but it is my heart.`,
  health: "Organic vocal cord injury: I cannot sustain more than a minute of continuous speech, so long speeches are not possible. This statement is voluntary and comes with no medical proof — please judge for yourself.",
  persona: "advocate",
};

async function main() {
  // 1. 创建已确认的小林账号（幂等：先查再建）
  let uid;
  const q = await fetch(`${URL}/auth/v1/admin/users?page=1&per_page=100`, { headers: HDRS });
  const existing = (await q.json()).users?.find((u) => u.email === XIAOLIN.email);
  if (existing) {
    uid = existing.id;
    console.log("小林账号已存在:", uid);
  } else {
    const r = await fetch(`${URL}/auth/v1/admin/users`, {
      method: "POST",
      headers: HDRS,
      body: JSON.stringify({ email: XIAOLIN.email, email_confirm: true, password: crypto.randomUUID() }),
    });
    const u = await r.json();
    if (!r.ok) throw new Error("创建用户失败: " + JSON.stringify(u));
    uid = u.id;
    // §2.1: 年龄自我声明置为已声明
    await fetch(`${URL}/rest/v1/profiles?id=eq.${uid}`, {
      method: "PATCH", headers: HDRS, body: JSON.stringify({ age_declared: true }),
    });
    console.log("小林账号已创建:", uid);
  }

  // 2. ElevenLabs 生成她的语音（advocate 人格，§2.4 强制披露参数）
  // 保护免费层额度：音频已存在则跳过生成
  const audioPath0 = `projects/${uid}/xiaolin-vision.mp3`;
  const head = await fetch(`${URL}/storage/v1/object/audio/${audioPath0}`, {
    method: "HEAD", headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` },
  });
  let audio;
  if (head.ok) {
    console.log("音频已存在，跳过 TTS（保护额度）");
    audio = null;
  } else {
    console.log("生成 ElevenLabs 语音中…（约", XIAOLIN.vision.length, "字符）");
    const tts = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/Fl6SiqWjBJzoqMQHWHaa?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: { "xi-api-key": EK, "Content-Type": "application/json" },
        body: JSON.stringify({ text: XIAOLIN.vision, model_id: "eleven_flash_v2_5", ai_disclosure: true }),
      },
    );
    if (!tts.ok) throw new Error("TTS 失败: " + (await tts.text()));
    audio = Buffer.from(await tts.arrayBuffer());
    console.log("语音生成完成:", audio.length, "bytes");
  }

  // 3. 服务端密钥对：为小林生成收款钱包并完成真实 Memo 锚定交易
  // 钱包种子持久化到本地（已 gitignore），避免每次重跑更换钱包
  const fs = await import("node:fs");
  const walletFile = "scripts/.xiaolin-wallet.json";
  let kp;
  if (fs.existsSync(walletFile)) {
    const saved = JSON.parse(fs.readFileSync(walletFile, "utf8"));
    kp = Keypair.fromSeed(Buffer.from(saved.seed, "hex"));
    console.log("使用已保存的钱包");
  } else {
    const seed = new Uint8Array(32);
    crypto.getRandomValues(seed);
    kp = Keypair.fromSeed(seed);
    fs.writeFileSync(walletFile, JSON.stringify({ seed: Buffer.from(seed).toString("hex"), pubkey: kp.publicKey.toBase58() }));
  }
  const wallet = kp.publicKey.toBase58();
  console.log("小林收款钱包:", wallet);

  // 上传音频到 Storage（先于链上步骤，重跑时不重复消耗 ElevenLabs 额度）
  const audioPath = audioPath0;
  if (audio) {
    const up = await fetch(`${URL}/storage/v1/object/audio/${audioPath}`, {
      method: "POST",
      headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "audio/mpeg", "x-upsert": "true" },
      body: audio,
    });
    if (!up.ok) throw new Error("上传失败: " + (await up.text()));
    console.log("音频已上传:", audioPath);
  }

  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  let balance = await connection.getBalance(kp.publicKey);
  if (balance < 10000) {
    console.log("通过 RPC requestAirdrop 领取 Devnet SOL…");
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const sig = await connection.requestAirdrop(kp.publicKey, 1 * LAMPORTS_PER_SOL);
        await connection.confirmTransaction(sig, "confirmed");
        break;
      } catch (e) {
        console.log(`  第${attempt}次领取失败: ${e.message.slice(0, 80)}`);
        if (attempt === 3) console.log("⚠️ 领取失败（代理IP今日限额），本次跳过链上锚定，项目仍将发布");
        await new Promise((r) => setTimeout(r, 5000));
      }
    }
    for (let i = 0; i < 10; i++) {
      await new Promise((r) => setTimeout(r, 2000));
      balance = await connection.getBalance(kp.publicKey);
      if (balance > 0) break;
    }
  }
  console.log("钱包余额:", balance / LAMPORTS_PER_SOL, "SOL");
  if (balance < 10000) {
    console.log("⚠️ 无余额，跳过锚定");
  }
  const anchorHash = createHash("sha256").update(XIAOLIN.title + XIAOLIN.vision + XIAOLIN.health).digest("hex");
  let sig = null;
  if (balance >= 10000) {
    const memo = `SpeakForward|v1|${anchorHash}|${wallet.slice(0, 8)}|${new Date().toISOString()}`;
    const tx = new Transaction().add(
      SystemProgram.transfer({ fromPubkey: kp.publicKey, toPubkey: kp.publicKey, lamports: 0 }),
      new TransactionInstruction({
        keys: [{ pubkey: kp.publicKey, isSigner: true, isWritable: true }],
        programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
        data: Buffer.from(memo, "utf8"),
      }),
    );
    tx.feePayer = kp.publicKey;
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    tx.sign(kp);
    sig = await connection.sendRawTransaction(tx.serialize());
    await connection.confirmTransaction(sig, "confirmed");
    console.log("✅ Memo 锚定交易:", `https://explorer.solana.com/tx/${sig}?cluster=devnet`);
  }

  // 5. 插入项目（幂等：已有同名项目则跳过）
  const check = await fetch(`${URL}/rest/v1/projects?title=eq.${encodeURIComponent(XIAOLIN.title)}&select=id`, { headers: HDRS });
  const dup = await check.json();
  if (dup.length > 0) {
    console.log("项目已存在，跳过插入:", dup[0].id);
    console.log("种子完成。项目页: /projects/" + dup[0].id);
    return;
  }
  const pr = await fetch(`${URL}/rest/v1/projects`, {
    method: "POST",
    headers: { ...HDRS, Prefer: "return=representation" },
    body: JSON.stringify({
      user_id: uid,
      title: XIAOLIN.title,
      vision_text: XIAOLIN.vision,
      health_reason: XIAOLIN.health,
      persona: XIAOLIN.persona,
      audio_path: audioPath,
      creator_wallet: wallet,
      anchor_tx_signature: sig,
      anchor_hash: anchorHash,
    }),
  });
  const proj = await pr.json();
  if (!pr.ok) throw new Error("插入项目失败: " + JSON.stringify(proj));
  console.log("✅ 项目已创建:", proj[0]?.id ?? proj.id);
  console.log("若用新生成的钱包，请保存私钥用于录制期收款展示:");
  console.log("SEED(hex):", Buffer.from(kp.secretKey.slice(32)).toString("hex"));
}

main().catch((e) => { console.error("FAILED:", e.message); process.exit(1); });
