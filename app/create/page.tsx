"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import {
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { createClient } from "@/lib/supabase/client";
import { PERSONAS, MAX_VISION_CHARS, IDENTITY_DISCLAIMER_TEXT } from "@/lib/personas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AgeGate } from "@/components/age-gate";
import { toast } from "sonner";

const MEMO_PROGRAM_ID = new PublicKey(
  "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr",
);

async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const buf = new ArrayBuffer(bytes.length);
  new Uint8Array(buf).set(bytes);
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export default function CreatePage() {
  const router = useRouter();
  const { publicKey, connected, signTransaction } = useWallet();
  const { setVisible } = useWalletModal();
  const { connection } = useConnection();

  const [ready, setReady] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [ageDeclared, setAgeDeclared] = useState(false);
  const [title, setTitle] = useState("");
  const [visionText, setVisionText] = useState("");
  const [healthReason, setHealthReason] = useState("");
  const [personaId, setPersonaId] = useState("advocate");
  const [anchorSig, setAnchorSig] = useState("");
  const [anchoring, setAnchoring] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      setLoggedIn(!!data.user);
      if (data.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("age_declared")
          .eq("id", data.user.id)
          .single();
        setAgeDeclared(!!profile?.age_declared);
      }
      setReady(true);
    });
  }, []);

  const charsLeft = MAX_VISION_CHARS - visionText.length;
  const overLimit = charsLeft < 0;
  const formValid =
    title.trim() &&
    visionText.trim() &&
    !overLimit &&
    healthReason.trim() &&
    personaId;

  // §5: free preview via Web Speech API — zero ElevenLabs credits while writing
  const [previewing, setPreviewing] = useState(false);
  const previewWithWebSpeech = () => {
    if (previewing) {
      window.speechSynthesis.cancel();
      setPreviewing(false);
      return;
    }
    const utter = new SpeechSynthesisUtterance(visionText);
    utter.lang = "zh-CN";
    utter.onend = () => setPreviewing(false);
    window.speechSynthesis.speak(utter);
    setPreviewing(true);
  };

  // §2.3: on-chain anchor — a Memo instruction carries the content hash +
  // creator wallet + timestamp; self-transfer of 0 SOL pays only the fee.
  // Deploying custom programs is forbidden (§2.3).
  const anchorToChain = async () => {
    if (!connected || !publicKey || !signTransaction) {
      setVisible(true);
      return;
    }
    setAnchoring(true);
    try {
      const hash = await sha256Hex(
        JSON.stringify({
          title: title.trim(),
          vision: visionText.trim(),
          health: healthReason.trim(),
          persona: personaId,
          creator: publicKey.toBase58(),
          ts: new Date().toISOString(),
        }),
      );
      const memo = `SpeakForward|v1|${hash}|${publicKey.toBase58().slice(0, 8)}|${new Date().toISOString()}`;
      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: publicKey,
          lamports: 0,
        }),
        new TransactionInstruction({
          keys: [{ pubkey: publicKey, isSigner: true, isWritable: true }],
          programId: MEMO_PROGRAM_ID,
          data: Buffer.from(memo, "utf8"),
        }),
      );
      tx.feePayer = publicKey;
      tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
      const signed = await signTransaction(tx);
      const signature = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction(signature, "confirmed");
      setAnchorSig(signature);
      toast.success("Anchored on-chain", {
        description: "The Memo transaction is live — verify it on the Devnet explorer.",
        action: {
          label: "View",
          onClick: () =>
            window.open(
              `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
              "_blank",
            ),
        },
      });
    } catch (err) {
      // §5: anchoring failure must not block publishing — the project can
      // still go live without an anchor
      toast.warning(`Anchoring failed — you can publish without it: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setAnchoring(false);
    }
  };

  const submit = async () => {
    setSubmitting(true);
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        vision_text: visionText,
        health_reason: healthReason,
        persona: personaId,
        creator_wallet: publicKey?.toBase58() ?? "",
        anchor_tx_signature: anchorSig,
        anchor_hash: "",
      }),
    });
    setSubmitting(false);
    const data = await res.json();
    if (!res.ok) {
      toast.error(`Publishing failed: ${data.error ?? res.statusText}`);
      return;
    }
    if (data.tts_degraded) {
      // §5: if ElevenLabs failed, the project is still live in
      // "temporary voice engine" mode
      toast.warning("Voice engine temporarily unavailable — published in temporary voice engine mode");
    } else {
      toast.success("Project published");
    }
    router.push(`/projects/${data.id}`);
  };

  if (!ready) {
    return (
      <div className="flex flex-1 items-center justify-center py-20 text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!loggedIn) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-20">
        <p className="text-muted-foreground">Please sign in to create a project.</p>
        <Button render={<a href="/login" />}>
          Go to sign in
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-10">
      <AgeGate open={!ageDeclared} onDeclared={() => setAgeDeclared(true)} />

      <Card>
        <CardHeader>
          <CardTitle>Share your vision</CardTitle>
          <CardDescription>
            Write what you want to say — an AI voice will speak it for you.
            Your health statement is <b>publicly displayed</b> on the project
            page: that is what makes community-based trust possible (§2.4).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">Project title</Label>
            <Input
              id="title"
              placeholder="e.g. Speaking up for my city, for our sky"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={80}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="vision">What you want to say (read aloud by AI)</Label>
              <span
                className={
                  "text-xs " + (overLimit ? "font-bold text-red-600" : "text-muted-foreground")
                }
              >
                {visionText.length} / {MAX_VISION_CHARS}
              </span>
            </div>
            <Textarea
              id="vision"
              rows={7}
              placeholder="Write your vision, why you are speaking up, and how you hope the world will change…"
              value={visionText}
              onChange={(e) => setVisionText(e.target.value)}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={!visionText.trim()}
              onClick={previewWithWebSpeech}
            >
              {previewing ? "⏹ Stop preview" : "🔊 Free preview (browser synthesis, no AI credits used)"}
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="health">Health statement (required, publicly shown)</Label>
            <Textarea
              id="health"
              rows={3}
              placeholder="e.g. Vocal cord injury — cannot sustain more than a minute of continuous speech / chronic fatigue syndrome / early-stage ALS…"
              value={healthReason}
              onChange={(e) => setHealthReason(e.target.value)}
              maxLength={300}
            />
            <p className="text-xs text-muted-foreground">
              {IDENTITY_DISCLAIMER_TEXT} A short statement is enough — it
              becomes the foundation of your community&apos;s trust.
            </p>
          </div>

          <div className="space-y-2">
            <Label>AI voice persona (§2.4 — preset personas, no voice cloning)</Label>
            <Select value={personaId} onValueChange={(v) => v && setPersonaId(v)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PERSONAS.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} — {p.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 rounded-md border p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">Anchor on Solana (recommended, optional)</p>
                <p className="text-xs text-muted-foreground">
                  A Memo transaction writes a hash of your content to Solana
                  Devnet as public, timestamped proof of existence.
                </p>
              </div>
              {anchorSig ? (
                <Badge className="bg-green-600">Anchored ✓</Badge>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!formValid || anchoring}
                  onClick={anchorToChain}
                >
                  {anchoring ? "Anchoring…" : connected ? "Anchor on Devnet" : "Connect Phantom"}
                </Button>
              )}
            </div>
          </div>

          <Button
            className="w-full"
            size="lg"
            disabled={!formValid || submitting}
            onClick={submit}
          >
            {submitting ? "Generating voice & publishing… (a few seconds)" : "Generate AI voice & publish"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
