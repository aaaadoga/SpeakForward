# SpeakForward Demo 录制方案（全免费 · 旁白为英文 TTS）

> 目标：≤3 分钟（建议 2:30–2:50）、含字幕、小林叙事主线的 demo 视频。
> **你全程不需要说话**——旁白已用 ElevenLabs 预生成为 6 段英文音频。
> 全部工具 ¥0。

## 一、工具清单

| 用途 | 工具 | 费用 |
|---|---|---|
| 录屏 | **OBS Studio**（obsproject.com） | ¥0 |
| 剪辑 + 字幕 | **剪映**（capcut.cn） | ¥0 |
| **旁白** | **ElevenLabs 预生成**（见 `demo-narration/` 文件夹，6 段 MP3） | ¥0（消耗免费额度） |
| 背景音乐 | YouTube Audio Library 或剪映曲库 | ¥0 |

**帖子里可以强调**：连这条视频的旁白都是 ElevenLabs 生成的——全片没有一处真人录音。

## 二、录制前准备（约 20 分钟）

1. **装 OBS**：输出分辨率 1920×1080、30fps
2. **浏览器**：无痕窗口、100% 缩放、隐藏书签栏；提前用魔法链接登录好你的账号
3. **装 Phantom** → 切 Devnet → 领测试 SOL（429 就换手机热点）
4. **预加载页面**：首页、小林项目页、explorer.solana.com（提前搜好你的钱包）
5. **提前写好你要创建的项目英文文案**（录制时粘贴，避免打字；可直接用测试时那段 "A voice for our sky" 的文本思路，但发布后记得删掉测试项目）
6. **把 `demo-narration/` 里 6 段 MP3 拖进剪映音频轨**，按分镜对齐

## 三、分镜脚本（总计约 2:40 · 旁白见下方原文）

| 时间 | 画面 | 旁白段 |
|---|---|---|
| 0:00–0:20 | 开场卡 + 小林项目页播放她的 AI 语音 3 秒 | 01 |
| 0:20–0:40 | 项目页滑动：AI 披露徽章、健康声明、免责声明横幅 | 02 |
| 0:40–1:10 | Sign in → 魔法链接 → 年龄自我声明弹窗打勾 | 03 |
| 1:10–1:55 | Create project → 粘贴文本 → Anchor on Devnet → Explorer 展示 Memo 交易 | 04 |
| 1:55–2:25 | Connect Phantom & Donate 0.01 SOL → Explorer 确认 → Pledge 按钮 | 05 |
| 2:25–2:40 | 结尾卡：标语 + GitHub 链接 | 06 |

## 四、旁白原文（= 字幕文稿，逐段对应 demo-narration/01–06.mp3）

**01** — This is Xiao Lin. She's nineteen, and a climate advocate. An illness took away her ability to speak for more than a minute. It did not take away her right to be heard.

**02** — On SpeakForward, every AI voice carries a visible disclosure. Her health statement is public, written by herself. And the platform never verifies identities — the judgment of trust belongs to you.

**03** — Signing up takes only an email and a magic link, plus one age self-declaration. No KYC. No medical proof. Asking people to prove that they are sick is, itself, a privilege barrier.

**04** — She writes her vision, picks an AI voice, and then anchors a hash of her content on Solana — a Memo transaction. Public proof of existence, timestamped on-chain. No custom smart contracts. No complexity to audit.

**05** — Donations are peer-to-peer: SOL moves from the donor's wallet directly to the creator's, signed by the donor's own Phantom. The platform never holds, routes, or custodies money. And for people without a wallet, a pledge stays in their own browser.

**06** — The right to speak should not depend on your body. SpeakForward — where young leaders turn words into action, funded by trust.

> 字幕做法：把以上 6 段文字按段贴进剪映文本轨即可（旁白本身就是英文，无需翻译字幕；保留字幕是为了满足 §6"含字幕"的硬性要求，同时利于无声观看）。

## 五、录制技巧

- **分段录**：每个分镜单独录，错了只重录那一段
- **生成语音等待 5–10 秒**：旁白 04 里"…and then anchors…"正好覆盖，或剪掉等待段
- **Explorer 加载慢**：提前打开好，录制时只切换
- **魔法链接**：提前登录好，录制只演示点邮件链接那一下
- 导出 1080p MP4

## 六、发布前核验

- [ ] 视频 ≤3:00，字幕完整（旁白文稿），小林叙事完整
- [ ] Live Demo 无痕窗口可打开
- [ ] 录到至少一笔 Memo 交易在 Explorer 可见
- [ ] DEV 帖三个【占位符】已替换
- [ ] 提交后每天访问一次线上站（防 Supabase 休眠）
