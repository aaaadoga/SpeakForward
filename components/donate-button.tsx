"use client";

import { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

// Memo 程序（SPL Memo v2）：与 SystemProgram.transfer 同交易提交（§2.3 链上锚定方式）
const MEMO_PROGRAM_ID = new PublicKey(
  "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr",
);

const PRESET_AMOUNTS = [0.01, 0.05, 0.1];

// §2.2: 点对点直接捐赠 —— SOL 从捐赠者钱包直接到创作者钱包，
// 平台全程不碰资金；交易由捐赠者自己的 Phantom 签名。
export function DonateButton({
  projectId,
  creatorWallet,
}: {
  projectId: string;
  creatorWallet: string;
}) {
  const { publicKey, connected, signTransaction, sendTransaction } = useWallet();
  const { setVisible } = useWalletModal();
  const { connection } = useConnection();
  const [amount, setAmount] = useState("0.01");
  const [busy, setBusy] = useState(false);

  const donate = async () => {
    const amountSol = Number(amount);
    if (!(amountSol > 0) || !creatorWallet) return;
    if (!connected || !publicKey || !signTransaction) {
      setVisible(true);
      return;
    }
    setBusy(true);
    try {
      const memo = `SpeakForward|donation|${projectId}|${new Date().toISOString()}`;
      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(creatorWallet),
          lamports: Math.round(amountSol * LAMPORTS_PER_SOL),
        }),
        new TransactionInstruction({
          keys: [{ pubkey: publicKey, isSigner: true, isWritable: true }],
          programId: MEMO_PROGRAM_ID,
          data: Buffer.from(memo, "utf8"),
        }),
      );
      tx.feePayer = publicKey;
      tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
      const signature = await sendTransaction(tx, connection);
      await connection.confirmTransaction(signature, "confirmed");

      // 链上验证后记录到公开账本（失败不阻断：资金转移本身已完成）
      await fetch(`/api/projects/${projectId}/pledge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tx_signature: signature,
          donor_wallet: publicKey.toBase58(),
          amount_sol: amountSol,
        }),
      });

      toast.success("捐赠已完成", {
        description: "SOL 已直接到达创作者钱包，平台未经手任何资金。",
        action: {
          label: "查看交易",
          onClick: () =>
            window.open(
              `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
              "_blank",
            ),
        },
      });
    } catch (err) {
      toast.error(`捐赠失败: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        {PRESET_AMOUNTS.map((a) => (
          <Button
            key={a}
            size="sm"
            variant={amount === String(a) ? "default" : "outline"}
            onClick={() => setAmount(String(a))}
          >
            {a} SOL
          </Button>
        ))}
        <Input
          type="number"
          min="0.001"
          step="0.001"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="h-9 w-28"
        />
      </div>
      <Button className="w-full" disabled={busy} onClick={donate}>
        {busy
          ? "交易处理中…"
          : connected
            ? `直接捐赠 ${amount} SOL（Devnet）`
            : "连接 Phantom 并捐赠"}
      </Button>
      <p className="text-xs text-muted-foreground">
        Devnet 测试币，无真实价值。SOL 由你的钱包直接转入创作者钱包，
        本平台不持有、不路由、不托管任何资金。
      </p>
    </div>
  );
}
