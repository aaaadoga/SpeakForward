"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IDENTITY_DISCLAIMER_TEXT } from "@/lib/personas";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMagicLink = async () => {
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        shouldCreateUser: true,
      },
    });
    setBusy(false);
    if (otpError) {
      setError(`Failed to send: ${otpError.message}`);
      return;
    }
    setSent(true);
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 items-center px-6 py-16">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Sign in / Sign up</CardTitle>
          <CardDescription>
            Email only — no password. Your account is created automatically on
            first sign-in.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sent ? (
            <div className="space-y-3">
              <p className="text-sm">
                ✉️ A magic link was sent to <b>{email}</b>. Open it to finish
                signing in.
              </p>
              <p className="text-xs text-muted-foreground">
                Didn&apos;t get it within a few minutes? Check your spam folder.
                The free email service has an hourly sending limit, so it may
                take a moment.
              </p>
            </div>
          ) : (
            <>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMagicLink()}
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button className="w-full" disabled={busy} onClick={sendMagicLink}>
                {busy ? "Sending…" : "Send magic link"}
              </Button>
            </>
          )}
          <p className="text-xs text-muted-foreground">
            By signing up you acknowledge: {IDENTITY_DISCLAIMER_TEXT} The
            platform only asks for an email and an age self-declaration (§2.1).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
