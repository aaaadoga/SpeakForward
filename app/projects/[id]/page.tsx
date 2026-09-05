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
            Published{" "}
            {new Date(project.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}{" "}
            · Creator&apos;s age and identity are unverified — please judge for
            yourself
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* §2.4: mandatory AI disclosure — the player carries the badge;
              when audio is missing it degrades to the "temporary voice engine" */}
          <AudioPlayer audioUrl={audioUrl} visionText={project.vision_text} />

          <div>
            <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
              Full transcript (what the voice reads)
            </h3>
            <p className="whitespace-pre-wrap leading-7">{project.vision_text}</p>
          </div>

          <Separator />

          {/* §2.4: public health statement — a feature, not a privacy breach;
              it is the foundation of community trust */}
          <div className="rounded-md border border-purple-200 bg-purple-50/60 p-4">
            <h3 className="mb-1 text-sm font-semibold text-purple-800">
              Creator&apos;s health statement (public)
            </h3>
            <p className="text-sm leading-6 text-purple-900">
              {project.health_reason}
            </p>
            <p className="mt-2 text-xs text-purple-700/70">
              No medical proof was requested. The judgment of trust belongs to
              you and the community (§2.1).
            </p>
          </div>

          <Separator />

          {/* §2.3: on-chain anchor — content hash + Memo transaction, publicly verifiable */}
          <div>
            <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
              Content anchor (Solana Devnet)
            </h3>
            {project.anchor_tx_signature ? (
              <div className="space-y-1 text-sm">
                <p>
                  Memo transaction:{" "}
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
                    Content hash: sha256:{project.anchor_hash}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                This project was not anchored on-chain (anchoring is optional).
              </p>
            )}
          </div>

          <Separator />

          {/* §2.2: peer-to-peer direct donation + no-wallet pledge */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Donate directly (SOL · Devnet)</h3>
              {project.creator_wallet ? (
                <DonateButton
                  projectId={project.id}
                  creatorWallet={project.creator_wallet}
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  The creator hasn&apos;t set a receiving wallet yet, so
                  on-chain donations are unavailable. You can still express
                  support with a pledge.
                </p>
              )}
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">No wallet?</h3>
              <PledgeButton projectId={project.id} />
            </div>
          </div>

          {/* Public donation ledger */}
          <div>
            <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
              On-chain donations (public & transparent — the platform never
              touches these funds)
            </h3>
            {!pledges || pledges.length === 0 ? (
              <p className="text-sm text-muted-foreground">No donations yet.</p>
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
          ← Back home
        </Button>
      </div>
    </div>
  );
}
