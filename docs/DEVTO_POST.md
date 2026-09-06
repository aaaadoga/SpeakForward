# DEV.to Submission Post (draft)

> 发布说明：直接复制下方正文到 DEV.to 编辑器。模板注释已全部删除（§6 要求）。
> 【】内的占位内容发布前替换。

---

*This is a submission for [Weekend Challenge: Generosity Edition](https://dev.to/challenges/weekend-2026-09-03)*

## What I Built

**SpeakForward** is fair-speech infrastructure: it lets young leaders (18–25) whose health conditions — vocal cord injury, severe anxiety, ALS, stroke recovery, chronic fatigue syndrome — prevent them from speaking or recording naturally, share their vision through an AI-generated voice, and receive support through transparent, peer-to-peer donations on Solana.

The platform asks one uncomfortable question: **what if asking for medical proof is the real barrier?** SpeakForward's answer is radical trust. There is no KYC, no verification, no admin review. A creator declares their situation in a short public statement — displayed right on their project page — and the judgment of trust belongs entirely to the community. The disclaimer is permanent and site-wide: *"This platform does not verify identities. Please judge for yourself."*

The same honesty applies to the voice itself: every audio clip is visibly labeled as AI-generated, and the disclosure flag is embedded in every ElevenLabs request. An AI voice speaking for someone who can't is assistance; an AI voice pretending to be someone is deception. The line between the two is the whole product.

And with money, the platform keeps itself out of the loop entirely: SOL moves from the donor's wallet directly to the creator's wallet, signed by the donor's own Phantom. The platform never holds, routes, or custodies anything.

In the demo, you'll meet 小林 (Xiao Lin), a 19-year-old climate advocate who can no longer sustain a full spoken sentence — and who is, thanks to a voice that isn't hers but carries her words, still speaking.

## Demo

🔴 **Live demo**: [https://speakforward.vercel.app](https://speakforward.vercel.app)

🎬 **Video demo (2:40, with English subtitles for the narrator)**: 【在此插入 YouTube/Bilibili 视频链接】

Xiao Lin's project page (with her AI-generated voice, public health statement, and Devnet donation ledger): [https://speakforward.vercel.app/projects/499a563e-73f4-45a3-ac51-3e13eb9d4b04](https://speakforward.vercel.app/projects/499a563e-73f4-45a3-ac51-3e13eb9d4b04)

## Code

【在此插入 GitHub 仓库嵌入，DEV.to 的 liquid 语法：
{% github aaaadoga/SpeakForward %} 】

The full ethics design document — every trust/delegation decision and its rationale — lives in the repo: [docs/ETHICS.md](https://github.com/aaaadoga/SpeakForward/blob/main/docs/ETHICS.md).

## How I Built It

**Stack**: Next.js 16 (App Router, TypeScript) · Supabase (Postgres + RLS, magic-link auth, S3-compatible Storage) · ElevenLabs · `@solana/web3.js` + wallet-adapter · Tailwind CSS + shadcn/ui · Vercel. Total infrastructure cost: **$0**.

**ElevenLabs — the voice, with disclosure built in:**
- Three preset personas ("The Steady Advocate", "The Warm Storyteller", "The Powerful Mobilizer") — custom-designed voices, no cloning (§: consent-safe by design).
- Generation happens server-side (the API key never reaches the browser), the resulting MP3 is stored in Supabase Storage, and the project page embeds a visible disclosure badge.
- The `ai_disclosure` flag is sent with every request — labeling isn't a UI afterthought, it's baked into the audio pipeline.
- §Resilience: if ElevenLabs fails or rate-limits, the project still publishes and the player automatically falls back to the browser's Web Speech API — with a visible "temporary voice engine" label. Disclosure survives the degradation path too.

**Solana — trust without custody:**
- Content anchoring: when publishing, the creator signs a transaction combining `SystemProgram.transfer` with an SPL **Memo instruction** carrying a SHA-256 content hash, their wallet prefix, and a timestamp. Proof of existence, publicly verifiable — with **zero custom programs deployed**.
- Donations: the donor's Phantom signs a transfer from their wallet straight to the creator's wallet, plus a Memo tagging the project. The server independently verifies the transaction on-chain before recording it to the public ledger. The platform has no keys, no hot wallet, no treasury — it *cannot* touch the money.
- No wallet? A "pledge" button records intent in the donor's own localStorage, clearly labeled as simulated.
- Everything runs on **Devnet** — no real money in this MVP, by design.

**The interesting decisions:**
1. **No medical proof, no admin review.** Verification infrastructure gates out the most marginalized users while manufacturing platform endorsement. Self-declaration + public statements + community judgment is a more honest trust model.
2. **Health statements are public by default.** That's not a privacy bug — it's what turns an anonymous ask into a human being. The creator chooses how to describe themselves; the platform never verifies or edits.
3. **The platform is structurally incapable of touching funds.** Trust me less: verify the chain.

## Prize Categories

**🥇 Best Use of ElevenLabs** — The entire product *is* the ElevenLabs integration: three designed personas, server-side synthesis with the native AI-disclosure flag embedded in every request, MP3 archival to storage, and a Web Speech API fallback that preserves disclosure even in degraded mode.

**🥇 Best Use of Solana** — Memo-anchored content hashes via `SystemProgram.transfer` + SPL Memo (no custom programs), non-custodial Phantom-signed peer-to-peer donations with on-chain server-side verification, and a public donation ledger — all on Devnet at $0 infrastructure cost.

---

*Built solo in one weekend. — 【你的 DEV.to 用户名】*
