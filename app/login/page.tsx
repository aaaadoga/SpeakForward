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
      setError("请输入有效的邮箱地址");
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
      setError(`发送失败: ${otpError.message}`);
      return;
    }
    setSent(true);
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 items-center px-6 py-16">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>登录 / 注册</CardTitle>
          <CardDescription>
            仅需邮箱，无需密码。首次登录将自动创建账号。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sent ? (
            <div className="space-y-3">
              <p className="text-sm">
                ✉️ 魔法链接已发送至 <b>{email}</b>
                ，请查收邮件并点击链接完成登录。
              </p>
              <p className="text-xs text-muted-foreground">
                若几分钟内未收到，请检查垃圾邮件文件夹。免费版邮件服务有每小时发送限制，
                高峰期可能稍有延迟。
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
                {busy ? "发送中…" : "发送魔法链接"}
              </Button>
            </>
          )}
          <p className="text-xs text-muted-foreground">
            注册即表示你已知悉：{IDENTITY_DISCLAIMER_TEXT}
            平台仅要求邮箱与年龄自我声明，不验证身份（§2.1）。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
