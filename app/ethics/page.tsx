import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AI_DISCLOSURE_TEXT, IDENTITY_DISCLAIMER_TEXT } from "@/lib/personas";

// 伦理设计说明页 —— §3 范围内交付物："伦理文档记录所有信任/委托设计决策"
export default function EthicsPage() {
  const decisions = [
    {
      title: "表达权优先，资格自我声明",
      body: "平台面向任何因健康原因限制而无法自然说话/录音的 18-25 岁青年领袖：声带损伤、严重焦虑症、渐冻症、中风康复期、慢性疲劳综合征等。我们不要求医学证明 —— 医学证明本身就是特权，会把最需要发声的人挡在门外。资格通过简短公开声明自我确认，信任判断权下放给社区与捐赠者。",
      ref: "§2.1",
    },
    {
      title: "身份不验证，判断还给你",
      body: `平台仅要求邮箱与年龄自我声明，拒绝 KYC、手机验证与 OAuth。 "${IDENTITY_DISCLAIMER_TEXT}" 这句话常驻全站。我们选择把欺诈风险透明化，而不是用审查把真实的人筛选掉。`,
      ref: "§2.3",
    },
    {
      title: "AI 披露不可妥协",
      body: `每一段语音都由 ElevenLabs 生成，请求嵌入原生 AI 披露元数据，页面永久显示可见标识："${AI_DISCLOSURE_TEXT}"。我们从不伪装成真人发声 —— 披露本身就是对听众的尊重。`,
      ref: "§2.4",
    },
    {
      title: "健康原因公开：特性而非侵犯",
      body: "创作者提交的健康原因说明公开展示在项目页。这不是隐私侵犯，而是社区信任的基础：捐赠者看到的是一个真实的、有名字有处境的人，而不是一个匿名的请求。",
      ref: "§2.4",
    },
    {
      title: "平台绝不碰钱",
      body: "纯点对点直接捐赠：SOL 从捐赠者钱包直接进入创作者钱包，由捐赠者自己的 Phantom 签名。平台不持有、不路由、不托管任何资金。没有钱包的捐赠者可以使用'捐赠承诺'（仅存于其浏览器本地，明确标注为模拟功能）。",
      ref: "§2.2",
    },
    {
      title: "公开的信任账本",
      body: "每笔链上捐赠的交易签名与创作者的 Memo 锚定交易都可以在 Solana Devnet 浏览器中独立验证。信任不依赖平台承诺，依赖公开可复核的链上事实。",
      ref: "§2.3",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <h1 className="text-3xl font-bold">我们的信任设计</h1>
      <p className="mt-3 text-muted-foreground">
        SpeakForward 的每一个伦理决策都不是合规负担，而是产品本身。以下决策已在开发前定案，
        不因赶工而妥协。
      </p>
      <div className="mt-8 space-y-4">
        {decisions.map((d) => (
          <Card key={d.title}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">{d.title}</CardTitle>
                <Badge2 text={d.ref} />
              </div>
              <CardDescription />
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6 text-muted-foreground">{d.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-8 text-center">
        <Button variant="outline" render={<Link href="/" />}>
          ← 返回首页
        </Button>
      </div>
    </div>
  );
}

function Badge2({ text }: { text: string }) {
  return (
    <span className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
      规范 {text}
    </span>
  );
}
