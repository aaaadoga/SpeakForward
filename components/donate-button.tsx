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

// SPL Memo program: submitted in the same transaction as SystemProgram.transfer (§2.3)
const MEMO_PROGRAM_ID = new PublicKey(
  "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr",
);

const PRESET_AMOUNTS = [0.01, 0.05, 0.1];

// §2.2: peer-to-peer direct donation — SOL goes from the donor's wallet
// straight to the creator's wallet; the platform never touches funds.
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

      // Record to the public ledger after on-chain verification
      await fetch(`/api/projects/${projectId}/pledge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tx_signature: signature,
          donor_wallet: publicKey.toBase58(),
          amount_sol: amountSol,
        }),
      });

      toast.success("Donation complete", {
        description:
          "SOL was sent directly to the creator's wallet. The platform never touched it.",
        action: {
          label: "View transaction",
          onClick: () =>
            window.open(
              `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
              "_blank",
            ),
        },
      });
    } catch (err) {
      toast.error(`Donation failed: ${err instanceof Error ? err.message : String(err)}`);
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
          ? "Processing transaction…"
          : connected
            ? `Donate ${amount} SOL directly (Devnet)`
            : "Connect Phantom & donate"}
      </Button>
      <p className="text-xs text-muted-foreground">
        Devnet test SOL — no real value. SOL is sent from your wallet directly
        to the creator. This platform never holds, routes, or custodies funds.
      </p>
    </div>
  );
}
