# SpeakForward 验收测试集

> 用法：开浏览器无痕窗口，打开 https://speakforward.vercel.app，逐条执行。
> 【自动】= 我已用脚本验证过；【手动】= 需要你点一遍（涉及浏览器/钱包/邮件）。
> 发现任何一条不符合，把"编号 + 实际现象"发给我。

## A. 功能异常（能不能用）

| # | 测试项 | 步骤 | 预期结果 | 类型 |
|---|---|---|---|---|
| A01 | 首页加载 | 打开首页 | 英文使命宣言 + 免责声明横幅 + 小林项目卡片出现 | 【自动】✅ |
| A02 | 小林项目页 | 点首页卡片 | 页面打开，音频播放器存在 | 【自动】✅ |
| A03 | 音频可播 | 点播放键 | 小林的中文语音正常播放（约 1 分钟） | 【手动】 |
| A04 | 音频公开地址 | 直接新标签打开项目页 audio 的 src | 返回音频（可下载播放） | 【自动】✅ |
| A05 | 未登录创建拦截 | 未登录直接访问 /create | 显示 "Please sign in to create a project" | 【自动】✅ |
| A06 | 未登录 API 拦截 | （开发者）curl POST /api/projects | 401 "Please sign in first" | 【自动】✅ |
| A07 | 魔法链接登录 | Sign in → 输入邮箱 → 打开邮件点链接 | 跳回首页，右上角显示你的邮箱 | 【手动】 |
| A08 | 年龄声明门 | 登录后进 /create | 弹窗不可关闭（无 X、点外面不消失），不打勾时按钮禁用 | 【手动】 |
| A09 | 声明持久化 | 声明后刷新页面再进 /create | 不再弹窗 | 【手动】 |
| A10 | 表单校验-必填 | 只填标题就尝试提交 | "Generate AI voice & publish" 按钮保持禁用 | 【手动】 |
| A11 | 表单校验-超限 | 粘贴 1300 字文本 | 字符计数变红，按钮禁用 | 【手动】 |
| A12 | 免费预览 | 填入文本点 "Free preview" | 浏览器合成语音朗读，不产生任何 AI 消耗 | 【手动】 |
| A13 | 完整发布流 | 填全表单（不锚定）→ 提交 | 约 5-10 秒后跳转到新项目页，音频可播 | 【手动】 |
| A14 | 链上锚定 | 连 Phantom → Anchor on Devnet → Phantom 确认 | 按钮变绿色 "Anchored ✓"，Explorer 链接可打开 | 【手动】 |
| A15 | 锚定失败不阻塞 | （难模拟，可跳过）断网点锚定 | 弹警告但项目仍可发布 | 【手动】 |
| A16 | 链上捐赠 | 项目页 → Connect Phantom & Donate → 0.01 SOL → Phantom 确认 | toast 成功 + "View transaction" 打开 Explorer；页面捐赠记录出现一行 | 【手动】 |
| A17 | 捐赠记录服务端验证 | （开发者）伪造签名 POST /api/projects/{id}/pledge | 400 "Transaction not found on-chain" | 【自动】✅（逻辑审查） |
| A18 | 承诺按钮 | 项目页 → Pledge (simulated) | toast 确认；刷新页面仍显示已承诺 | 【手动】 |
| A19 | 承诺是本地的 | 换无痕窗口打开同一项目页 | 承诺状态不存在（只存在你浏览器） | 【手动】 |
| A20 | 伦理页 | 点页脚 "Our trust design" | 6 条设计决策，含规范条款号 | 【手动】 |

## B. 使用异常（会不会让人卡住/误会）

| # | 测试项 | 步骤 | 预期结果 |
|---|---|---|---|
| B01 | 邮箱限流提示 | 登录页发一封魔法链接 | 页面有提示"每小时发送限制"的文案，用户知道要等 |
| B02 | 邮件未收到 | 等 5 分钟没收到 | 有"检查垃圾邮件"提示（B01 同页） |
| B03 | Phantom 未装点捐赠 | 未装钱包点 "Connect Phantom & donate" | 弹出钱包选择/安装引导，不白屏 |
| B04 | 捐赠取消 | Phantom 弹窗里点拒绝 | 回到页面无崩溃，无假成功 |
| B05 | 锚定取消 | Phantom 弹窗里点拒绝 | 警告 toast，仍可发布 |
| B06 | 小林收款 | 向小林钱包捐 0.01 SOL 后 Explorer 查收款地址 | 到账的是小林钱包，不是任何平台地址 |

## C. 显示异常（长得对不对）

| # | 测试项 | 步骤 | 预期结果 |
|---|---|---|---|
| C01 | 无中文残留 | 遍历 4 个页面（小林的陈述/语音除外） | UI 全英文；小林内容为中文属预期 | 
| C02 | AI 披露可见 | 首页 + 项目页 | 紫色徽章 "This content is AI-generated…" 出现两次场景都在 |
| C03 | 免责声明常驻 | 滚动任意页面顶部 | 黄色横幅 "This platform does not verify identities…" 永远在最上方 |
| C04 | 健康声明展示 | 小林项目页 | 紫色区块显示她的中文陈述 + "No medical proof was requested" |
| C05 | 移动端 | 手机宽度（F12 设备模拟 375px） | 横幅、卡片、按钮无横向滚动/重叠 |
| C06 | 浏览器标签 | 看标签页标题 | "SpeakForward — Turn words into action, funded by trust" |
| C07 | 音频缺失降级 | （难模拟）若 ElevenLabs 挂 | 播放器位置出现 "⚡ Temporary voice engine" 标识 |
| C08 | 未锚定项目 | 小林项目页锚定区 | 显示 "not anchored on-chain (anchoring is optional)"，不是报错 |
| C09 | 暗色模式 | 系统暗色下浏览 | 文字可读、无黑底黑字（Tailwind 变量已配，允许样式一般但不破版） |
| C10 | 页脚署名 | 任意页页脚 | "Powered by ElevenLabs · Solana Devnet" 存在 |

## D. 我已自动验证过的后端事实（不必重测）

- 构建通过（Next.js 16 严格类型检查）
- 4 个页面 + 项目页 HTTP 200
- 未登录 POST /api/projects → 401；未登录 declare → 401
- ElevenLabs：key 有效、自建音色可调用、`ai_disclosure:true` 被接受、返回有效 mp3
- Supabase：表已建、RLS 策略生效、storage 桶公开可读、小林音频 200/843KB
- 生产部署 Ready 且英文版内容经外部抓取确认


---

# 🔎 自动化验收结果（2026-09-06，由 AI 浏览器自动化执行）

## 通过（15 条）

| 编号 | 结果 | 备注 |
|---|---|---|
| A03 | ✅ | 真实点击后音频正常播放（52.7s，进度递增）。注意：自动化环境的"无手势自动播放"被浏览器策略拦截属预期，真人点击无碍 |
| A08 | ✅ | 弹窗无关闭按钮、点外部不消失、未勾选时确认键禁用 |
| A09 | ✅ | 刷新后不再弹窗（声明已持久化） |
| A10 | ✅ | 空表单发布键禁用 |
| A11 | ✅ | 1300/1200 计数变红、发布键禁用；改回正常文本即恢复 |
| A12 | ✅ | 免费预览按钮切换为 "Stop preview"，speechSynthesis 实际发声 |
| A13 | ✅ | 完整发布流成功：真实 ElevenLabs 生成 8.9s 英文语音并入库，项目页完整渲染 |
| A18 | ✅ | 承诺写入 localStorage、徽章显示（自动化环境的坐标点击派发有怪癖，页面内触发验证） |
| A19 | ✅ | 刷新后保持；清空 localStorage 后消失（证明仅存本地） |
| A20 | ✅ | 6 条设计决策全部渲染 |
| B01 | ✅ | 发送成功提示 + 垃圾箱提示 + 每小时限额提示均在 |
| B02 | ✅* | 经一次性邮箱(mail.tm)实测，Supabase 邮件数秒内真实送达（*非你常用邮箱服务商） |
| B03 | ✅ | 未连接钱包点捐赠 → 正确弹出 "Connect a wallet on Solana to continue" 弹窗 |
| C05 | ✅ | 375px 视口无横向滚动 |
| C06/C01/C02/C03/C04/C08/C10 | ✅ | 见前文快照与截图 |

## 🔴 发现并已报告的 BUG（1 个，P0）

**A07 魔法链接重定向错误**：真实邮件中的验证链接 `redirect_to=http://localhost:3000`（Supabase 项目 Site URL 仍是建项目默认值，且生产域名不在 Redirect URLs 允许列表）。真实用户点邮件链接会落到 localhost，登录无法完成。
**修复**：Supabase Dashboard → Authentication → URL Configuration → Site URL 改为 `https://speakforward.vercel.app`，Redirect URLs 添加 `https://speakforward.vercel.app/**`。修复后 A07/A08/A09 的真实邮件路径即可闭环。

## 无法自动化（需真人/钱包，共 6 条）

A14 锚定（需 Phantom 签名）、A15 锚定失败模拟、A16 链上捐赠（需 Phantom + 测试 SOL）、B04/B05 Phantom 弹窗内取消、B06 收款地址核对、C07 ElevenLabs 故障降级、C09 暗色模式（自动化环境无法模拟系统主题）。

## 清理确认

QA 用户（2个）、测试项目 "A voice for our sky"、其音频对象、浏览器会话 cookie 已全部删除；线上仅剩小林的演示项目。
