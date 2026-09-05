"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { IDENTITY_DISCLAIMER_TEXT } from "@/lib/personas";

// §2.1: 年龄自我声明 —— 醒目、不可跳过；无需医学证明（§2.1 资格验证方式）
export function AgeGate({
  open,
  onDeclared,
}: {
  open: boolean;
  onDeclared: () => void;
}) {
  const [checked, setChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const confirm = async () => {
    setSubmitting(true);
    const res = await fetch("/api/profile/declare", { method: "POST" });
    setSubmitting(false);
    if (res.ok) onDeclared();
  };

  return (
    <Dialog open={open} disablePointerDismissal>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>开始之前：年龄自我声明</DialogTitle>
          <DialogDescription>
            本平台面向 <b>18 周岁及以上</b> 用户（13-17 岁未成年人不在本平台范围内）。
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          ⚠️ {IDENTITY_DISCLAIMER_TEXT}
        </div>
        <label className="flex items-start gap-2 text-sm">
          <Checkbox
            checked={checked}
            onCheckedChange={(v) => setChecked(v === true)}
            className="mt-0.5"
          />
          <span>
            我声明我已年满 18 周岁；若因健康原因限制无法自然发声或录音，我可进行简短公开说明，
            平台<b>不验证身份、不要求医学证明</b>。
          </span>
        </label>
        <DialogFooter>
          <Button disabled={!checked || submitting} onClick={confirm}>
            {submitting ? "提交中…" : "确认声明，继续"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
