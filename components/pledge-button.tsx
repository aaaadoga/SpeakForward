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

// §2.2 用户体验兜底：没有 Solana 钱包的捐赠者使用"捐赠承诺"，
// 仅记录在本地 localStorage，不执行链上交易，需清晰标注为模拟功能。
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
      // 忽略损坏的本地数据
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
    toast.success("已记录捐赠承诺（模拟）", {
      description:
        "承诺仅保存在你的浏览器本地。安装 Phantom 钱包后可完成真正的链上捐赠。",
    });
  };

  if (pledged) {
    return (
      <div className="rounded-md border bg-muted px-3 py-2 text-sm text-muted-foreground">
        ✅ 你已承诺支持本项目（本地记录，模拟功能）
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
          捐赠承诺（模拟）
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        没有钱包？承诺仅记录在你的浏览器 localStorage，不产生任何链上交易。
      </p>
    </div>
  );
}
