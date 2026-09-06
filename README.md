<div align="center">

# 🎙️ SpeakForward

### Where young leaders turn words into action, funded by trust.

**Fair-speech infrastructure for young leaders whose voices need a helping hand.**

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-speakforward.vercel.app-8b5cf6?style=for-the-badge)](https://speakforward.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com)
[![ElevenLabs](https://img.shields.io/badge/ElevenLabs-000000?style=flat-square)](https://elevenlabs.io)
[![Solana](https://img.shields.io/badge/Solana_Devnet-9945FF?style=flat-square&logo=solana&logoColor=white)](https://solana.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

</div>

---

## 🌤️ The Problem

Every community has young leaders with a vision — and some of them **cannot physically deliver a speech**. Vocal cord injuries, severe anxiety, ALS, stroke recovery, chronic fatigue syndrome.

Most platforms respond by asking for medical proof. But proof is a privilege: the people who most need to be heard are often exactly the people who cannot navigate that paperwork.

**SpeakForward takes a different deal.** You declare your situation in a short, public statement. An AI voice — chosen from three designed personas — speaks your words. Supporters judge your sincerity for themselves, and support you directly, wallet to wallet, on Solana.

> ⚠️ *This platform does not verify identities. Please judge for yourself.*

## ✨ What's Inside

| | |
|---|---|
| 🗣️ **AI voices, honestly labeled** | Three designed personas ("Steady Advocate", "Warm Storyteller", "Powerful Mobilizer"). Every request embeds ElevenLabs' AI-disclosure flag, and every page shows it. |
| 📜 **Public health statements** | Written by the creator, shown on the project page. Not a privacy breach — the foundation of community trust. |
| ⚓ **On-chain proof of existence** | Publishing anchors a SHA-256 content hash on Solana Devnet via a Memo instruction. No custom programs. |
| 💸 **Non-custodial donations** | SOL moves from the donor's Phantom straight to the creator's wallet. The platform holds, routes, and custodies… nothing. |
| 🤝 **Pledges for the wallet-less** | A clearly-labeled, localStorage-only promise for people without crypto. |
| 🛡️ **Graceful degradation** | If ElevenLabs goes down, projects still publish and a "temporary voice engine" (Web Speech API) takes over — disclosure intact. |

## 📸 See It

<div align="center">
  <img src="docs/assets/preview-home.png" alt="SpeakForward landing page" width="720"/>
  <p><em>Landing page — mission, disclosure, and the latest voices</em></p>
  <img src="docs/assets/preview-project.png" alt="A SpeakForward project page" width="720"/>
  <p><em>A project page — AI-generated audio, public health statement, Devnet donation ledger</em></p>
</div>

## 🚀 Run It Locally

```bash
git clone https://github.com/aaaadoga/SpeakForward.git
cd SpeakForward
npm install
cp .env.example .env.local    # fill in your keys
npm run dev
```

Then run the SQL in [`supabase/schema.sql`](supabase/schema.sql) once in your Supabase project's SQL Editor.

<details>
<summary><b>Environment variables</b></summary>

| Variable | Purpose | Exposure |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL | public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser client (RLS-protected) | public |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side admin ops | server only |
| `ELEVENLABS_API_KEY` | Voice generation | server only |

</details>

<details>
<summary><b>Tech stack</b></summary>

| Layer | Choice |
|---|---|
| Full-stack | Next.js 16 (App Router) · TypeScript · Turbopack |
| UI | Tailwind CSS v4 · shadcn/ui (Base UI) |
| Backend | Supabase — Postgres + RLS, magic-link auth, S3-compatible Storage |
| Voice | ElevenLabs `eleven_flash_v2_5`, three designed personas |
| Chain | `@solana/web3.js` + wallet-adapter · client-side Phantom signing · Devnet |
| Hosting | Vercel |

</details>

## 🛡️ Our Trust Design

Every ethical decision in SpeakForward was **finalized before development started** — they are the product, not a compliance layer. The full rationale lives in [`docs/ETHICS.md`](docs/ETHICS.md), including why we refuse KYC, why health statements are public, and why the platform is *structurally incapable* of touching donations.

## 📄 License

[MIT](LICENSE) — built in the open for the [DEV Weekend Challenge: Generosity Edition](https://dev.to/challenges/weekend-2026-09-03).

<div align="center">
  <sub>Powered by ElevenLabs · Solana Devnet · Zero human recordings were harmed in the making of this demo — none were used at all.</sub>
</div>
