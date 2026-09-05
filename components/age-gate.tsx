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

// §2.1: age self-declaration — prominent, non-dismissable, no medical proof required
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
          <DialogTitle>Before you begin: age self-declaration</DialogTitle>
          <DialogDescription>
            This platform is intended for users <b>18 years and older</b>{" "}
            (minors aged 13–17 are outside the scope of this MVP).
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
            I declare that I am 18 years of age or older. If a health condition
            prevents me from speaking or recording naturally, I may provide a
            brief public statement. This platform <b>does not verify
            identities and does not require medical proof</b>.
          </span>
        </label>
        <DialogFooter>
          <Button disabled={!checked || submitting} onClick={confirm}>
            {submitting ? "Submitting…" : "I declare and continue"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
