"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface PromiseRecord {
  projectId: string;
  amountSol: number;
  createdAt: string;
}

// §2.2 fallback UX: donors without a Solana wallet use a "pledge",
// stored only in localStorage — clearly labeled as a simulated feature.
export function PledgeButton({ projectId }: { projectId: string }) {
  const [amount, setAmount] = useState("0.05");
  const [pledged, setPledged] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem("speakforward_pledges");
    if (!raw) return;
    try {
      const list = JSON.parse(raw) as PromiseRecord[];
      setPledged(list.some((p) => p.projectId === projectId));
    } catch {
      // ignore corrupted local data
    }
  }, [projectId]);

  const pledge = () => {
    const amountSol = Number(amount);
    if (!(amountSol > 0)) return;
    const raw = window.localStorage.getItem("speakforward_pledges");
    const list: PromiseRecord[] = raw ? JSON.parse(raw) : [];
    list.push({ projectId, amountSol, createdAt: new Date().toISOString() });
    window.localStorage.setItem("speakforward_pledges", JSON.stringify(list));
    setPledged(true);
    toast.success("Pledge recorded (simulated)", {
      description:
        "Your pledge is stored only in this browser. Install a Phantom wallet to complete a real on-chain donation.",
    });
  };

  if (pledged) {
    return (
      <div className="rounded-md border bg-muted px-3 py-2 text-sm text-muted-foreground">
        ✅ You have pledged to support this project (local record · simulated)
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          type="number"
          min="0.001"
          step="0.001"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="h-9 w-28"
        />
        <Button variant="secondary" className="flex-1" onClick={pledge}>
          Pledge (simulated)
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        No wallet? A pledge is stored only in your browser&apos;s localStorage —
        no on-chain transaction is made.
      </p>
    </div>
  );
}
