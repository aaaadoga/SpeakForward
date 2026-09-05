# SpeakForward

> Where young leaders turn words into action, funded by trust.
> 青年领袖以言促行，信任铸就支持。

SpeakForward 是一个**表达权公平基础设施**：让因健康状况限制（声带损伤、严重焦虑症、渐冻症、中风康复期、慢性疲劳综合征等）而无法自然发声或录音的青年领袖（18-25岁），通过 AI 生成语音分享愿景，并获得透明、无平台托管的 Solana 链上支持。

**目标赛事**：DEV.to 周末挑战赛（国际慈善日）— ElevenLabs 最佳应用奖 & Solana 最佳应用奖。

## 核心设计决策（不可妥协）

详见 [docs/ETHICS.md](docs/ETHICS.md)。要点：

- **资格自我声明**：无医学证明、无 KYC。*"本平台不验证身份，请您自行判断。"*
- **强制 AI 披露**：所有语音由 ElevenLabs 生成（请求嵌入 `ai_disclosure: true`），页面常驻可见标识。
- **健康原因公开**：创作者的健康说明公开展示 —— 这是社区信任的基础，不是隐私缺陷。
- **平台绝不碰钱**：SOL 由捐赠者钱包直接进入创作者钱包（Phantom 签名），平台不持有、不路由、不托管任何资金。无钱包用户使用"捐赠承诺"（仅存本地 localStorage，标注为模拟功能）。
- **链上只锚定哈希**：媒体存 S3 兼容存储，Solana Memo 指令锚定内容哈希；**不部署任何自定义程序**。

## 技术栈

| 层 | 选型 |
|---|---|
| 全栈 | Next.js 16 (App Router) + TypeScript + Turbopack |
| UI | Tailwind CSS v4 + shadcn/ui (Base UI) |
| 数据库 / 认证 / 存储 | Supabase（Postgres + RLS / Magic Link / Storage） |
| TTS | ElevenLabs `eleven_flash_v2_5`，3 个自建预设人格 |
| 区块链 | `@solana/web3.js` + wallet-adapter，纯客户端 Phantom 签名，Devnet |
| 部署 | Vercel |

## 快速开始

```bash
npm install
cp .env.example .env.local   # 填入你的密钥（见下表）
# 把 supabase/schema.sql 全文粘贴到 Supabase Dashboard → SQL Editor 执行一次
npm run dev
```

### 环境变量

| 变量 | 用途 | 暴露面 |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目地址 | 公开 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 前端匿名 key（RLS 保护数据） | 公开 |
| `SUPABASE_SERVICE_ROLE_KEY` | 服务端管理操作（上传音频、公开查询） | 仅服务端 |
| `ELEVENLABS_API_KEY` | 语音生成 | 仅服务端 |

## 降级预案（已实现）

| 触发条件 | 降级路径 |
|---|---|
| ElevenLabs API 失败/限流 | 项目仍发布成功，项目页自动回退浏览器 Web Speech API 并显示"临时语音引擎"标识 |
| R2/存储不可用 | 项目发布不中断，音频字段留空走降级引擎 |
| 锚定交易失败 | 弹出提示但**不阻塞**发布，项目可无锚定上线 |

## 提交前检查清单

- [ ] Demo 视频 ≤3 分钟，含字幕，小林叙事完整
- [ ] Live Demo 可访问，Phantom 连接无误
- [ ] 至少一笔 Solana Memo 交易可在 Devnet 浏览器验证
- [ ] ElevenLabs 音频含 AI Disclosure 元数据
- [ ] 免责声明、AI 标识、公开健康原因展示均可见
- [ ] `/docs/ETHICS.md` 完整

## License

MIT
