"use client";

import { useEffect, useMemo, useState } from "react";
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

  // §5: Web Speech API 免费预览 —— 调试与写作时零 ElevenLabs 额度消耗
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

  // §2.3: 链上锚定 —— Memo 指令携带内容元数据哈希 + 创作者钱包 + 时间戳，
  // 自转 0 SOL，仅支付标准交易费。禁止部署自定义程序（§2.3）。
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
      toast.success("锚定成功", {
        description: "Memo 交易已上链，可在 Devnet 浏览器验证。",
        action: {
          label: "查看",
          onClick: () =>
            window.open(
              `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
              "_blank",
            ),
        },
      });
    } catch (err) {
      // §5: 锚定失败不阻塞核心流程 —— 项目仍可发布（anchor 留空）
      toast.warning(`锚定失败，可跳过直接发布: ${err instanceof Error ? err.message : String(err)}`);
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
      toast.error(`发布失败: ${data.error ?? res.statusText}`);
      return;
    }
    if (data.tts_degraded) {
      // §5: ElevenLabs 失败时项目已落库，项目页将以"临时语音引擎"呈现
      toast.warning("语音引擎暂时不可用，项目已发布为'临时语音引擎'模式");
    } else {
      toast.success("项目已发布");
    }
    router.push(`/projects/${data.id}`);
  };

  if (!ready) {
    return (
      <div className="flex flex-1 items-center justify-center py-20 text-muted-foreground">
        加载中…
      </div>
    );
  }

  if (!loggedIn) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-20">
        <p className="text-muted-foreground">请先登录后再创建项目。</p>
        <Button render={<a href="/login" />}>
          前往登录
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-10">
      <AgeGate open={!ageDeclared} onDeclared={() => setAgeDeclared(true)} />

      <Card>
        <CardHeader>
          <CardTitle>分享你的愿景</CardTitle>
          <CardDescription>
            写下你想说的话，AI 语音将替你发声。
            你提交的健康原因说明将<b>公开展示</b>在项目页 —— 这使基于社区的信任成为可能（§2.4）。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">项目标题</Label>
            <Input
              id="title"
              placeholder="例如：为气候行动发声"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={80}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="vision">你想说的话（将由 AI 语音朗读）</Label>
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
              placeholder="写下你的愿景、你为什么发声、你希望世界如何改变…"
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
              {previewing ? "⏹ 停止预览" : "🔊 免费预览（浏览器合成，不消耗AI额度）"}
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="health">健康原因公开说明（必填，将公开展示）</Label>
            <Textarea
              id="health"
              rows={3}
              placeholder="例如：声带损伤导致无法长时间说话 / 慢性疲劳综合征 / 渐冻症早期…"
              value={healthReason}
              onChange={(e) => setHealthReason(e.target.value)}
              maxLength={300}
            />
            <p className="text-xs text-muted-foreground">
              {IDENTITY_DISCLAIMER_TEXT} 简短说明即可，这将成为社区信任你的基础。
            </p>
          </div>

          <div className="space-y-2">
            <Label>AI 语音人格（§2.4 预设人格，不做声音克隆）</Label>
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
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Solana 链上锚定（推荐，可选）</p>
                <p className="text-xs text-muted-foreground">
                  用 Memo 交易把内容哈希写入 Solana Devnet，作为内容存在与时间戳的公开证明。
                </p>
              </div>
              {anchorSig ? (
                <Badge className="bg-green-600">已锚定 ✓</Badge>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!formValid || anchoring}
                  onClick={anchorToChain}
                >
                  {anchoring ? "锚定中…" : connected ? "锚定到 Devnet" : "连接 Phantom"}
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
            {submitting ? "生成语音并发布中…（约几秒）" : "生成 AI 语音并发布"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
