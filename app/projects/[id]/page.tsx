import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPersona, AI_DISCLOSURE_TEXT } from "@/lib/personas";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AudioPlayer } from "@/components/audio-player";
import { DonateButton } from "@/components/donate-button";
import { PledgeButton } from "@/components/pledge-button";

export const dynamic = "force-dynamic";

interface PledgeRow {
  tx_signature: string;
  donor_wallet: string;
  amount_sol: number;
  created_at: string;
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();
  if (!project) notFound();

  const { data: pledges } = await supabase
    .from("pledges")
    .select("tx_signature, donor_wallet, amount_sol, created_at")
    .eq("project_id", id)
    .order("created_at", { ascending: false })
    .limit(20);

  const persona = getPersona(project.persona);
  const audioUrl = project.audio_path
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/audio/${project.audio_path}`
    : null;

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{persona?.name ?? project.persona}</Badge>
            <Badge
              variant="outline"
              className="border-purple-400/60 bg-purple-50 text-purple-700"
            >
              ✦ {AI_DISCLOSURE_TEXT}
            </Badge>
          </div>
          <CardTitle className="mt-2 text-3xl">{project.title}</CardTitle>
          <CardDescription>
            发布于 {new Date(project.created_at).toLocaleDateString("zh-CN")} ·
            创作者年龄与身份未经验证（请您自行判断）
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* §2.4: 强制 AI 披露 —— 播放器内置标识，音频缺失时自动降级为"临时语音引擎" */}
          <AudioPlayer audioUrl={audioUrl} visionText={project.vision_text} />

          <div>
            <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
              愿景全文（即朗读内容）
            </h3>
            <p className="whitespace-pre-wrap leading-7">{project.vision_text}</p>
          </div>

          <Separator />

          {/* §2.4: 健康原因公开展示 —— 产品特性而非隐私侵犯，社区信任的基础 */}
          <div className="rounded-md border border-purple-200 bg-purple-50/60 p-4">
            <h3 className="mb-1 text-sm font-semibold text-purple-800">
              创作者的健康原因说明（公开）
            </h3>
            <p className="text-sm leading-6 text-purple-900">
              {project.health_reason}
            </p>
            <p className="mt-2 text-xs text-purple-700/70">
              平台未要求医学证明，信任判断权在于你和社区（§2.1）。
            </p>
          </div>

          <Separator />

          {/* §2.3: 链上锚定信息 —— 内容哈希 + Memo 交易公开可验证 */}
          <div>
            <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
              内容锚定（Solana Devnet）
            </h3>
            {project.anchor_tx_signature ? (
              <div className="space-y-1 text-sm">
                <p>
                  Memo 交易：
                  <a
                    className="ml-1 break-all text-purple-600 underline"
                    href={`https://explorer.solana.com/tx/${project.anchor_tx_signature}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {project.anchor_tx_signature}
                  </a>
                </p>
                {project.anchor_hash && (
                  <p className="break-all text-xs text-muted-foreground">
                    内容哈希: sha256:{project.anchor_hash}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                本项目未进行链上锚定（锚定为可选步骤）。
              </p>
            )}
          </div>

          <Separator />

          {/* §2.2: 点对点直接捐赠 + 无钱包承诺按钮 */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">直接捐赠（SOL · Devnet）</h3>
              {project.creator_wallet ? (
                <DonateButton
                  projectId={project.id}
                  creatorWallet={project.creator_wallet}
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  创作者未设置收款钱包，暂无法接受链上捐赠。你可以使用右侧承诺按钮表达支持。
                </p>
              )}
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">没有钱包？</h3>
              <PledgeButton projectId={project.id} />
            </div>
          </div>

          {/* 公开捐赠账本 */}
          <div>
            <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
              链上捐赠记录（公开透明，平台不经手资金）
            </h3>
            {!pledges || pledges.length === 0 ? (
              <p className="text-sm text-muted-foreground">还没有链上捐赠。</p>
            ) : (
              <ul className="space-y-1 text-sm">
                {(pledges as PledgeRow[]).map((p) => (
                  <li key={p.tx_signature} className="flex items-center justify-between gap-2">
                    <a
                      className="truncate text-purple-600 underline"
                      href={`https://explorer.solana.com/tx/${p.tx_signature}?cluster=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {p.donor_wallet.slice(0, 6)}…{p.donor_wallet.slice(-4)}
                    </a>
                    <span className="shrink-0">{p.amount_sol} SOL</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 text-center">
        <Button variant="ghost" render={<Link href="/" />}>
          ← 返回首页
        </Button>
      </div>
    </div>
  );
}
