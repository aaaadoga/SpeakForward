// 开发辅助：用 ElevenLabs"温暖讲述者"音色预生成 6 段英文 demo 旁白
// 输出到 demo-narration/（该文件夹已 gitignore，属本地交付资产）
import { mkdirSync, writeFileSync } from "node:fs";

const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL; // 未使用，仅为环境变量一致性
const EK = process.env.ELEVENLABS_API_KEY;
const VOICE = "ayqrSRCRL1uGdlFUT9vC"; // The Warm Storyteller
if (!EK) throw new Error("缺少 ELEVENLABS_API_KEY");

const SEGMENTS = [
  `This is Xiao Lin. She's nineteen, and a climate advocate. An illness took away her ability to speak for more than a minute. It did not take away her right to be heard.`,
  `On SpeakForward, every AI voice carries a visible disclosure. Her health statement is public, written by herself. And the platform never verifies identities — the judgment of trust belongs to you.`,
  `Signing up takes only an email and a magic link, plus one age self-declaration. No KYC. No medical proof. Asking people to prove that they are sick is, itself, a privilege barrier.`,
  `She writes her vision, picks an AI voice, and then anchors a hash of her content on Solana — a Memo transaction. Public proof of existence, timestamped on-chain. No custom smart contracts. No complexity to audit.`,
  `Donations are peer-to-peer: SOL moves from the donor's wallet directly to the creator's, signed by the donor's own Phantom. The platform never holds, routes, or custodies money. And for people without a wallet, a pledge stays in their own browser.`,
  `The right to speak should not depend on your body. SpeakForward — where young leaders turn words into action, funded by trust.`,
];

mkdirSync("demo-narration", { recursive: true });

let total = 0;
for (let i = 0; i < SEGMENTS.length; i++) {
  const text = SEGMENTS[i];
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: { "xi-api-key": EK, "Content-Type": "application/json" },
      body: JSON.stringify({ text, model_id: "eleven_flash_v2_5", ai_disclosure: true }),
    },
  );
  if (!res.ok) throw new Error(`第${i + 1}段 TTS 失败: ` + (await res.text()));
  const buf = Buffer.from(await res.arrayBuffer());
  total += text.length;
  writeFileSync(`demo-narration/narration-0${i + 1}.mp3`, buf);
  console.log(`narration-0${i + 1}.mp3  ${text.length} 字符  ${buf.length} bytes`);
}
console.log(`完成：6 段，共 ${total} 字符`);
