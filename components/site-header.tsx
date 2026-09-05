"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
      setReady(true);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <header className="flex items-center justify-between px-6 py-4">
      <Link href="/" className="text-lg font-bold tracking-tight">
        Speak<span className="text-purple-600">Forward</span>
      </Link>
      <nav className="flex items-center gap-2">
        <Button variant="ghost" render={<Link href="/ethics" />}>
          Ethics
        </Button>
        {ready && (email ? (
          <>
            <Button variant="ghost" render={<Link href="/create" />}>
              Create project
            </Button>
            <span className="hidden max-w-40 truncate text-sm text-muted-foreground sm:inline">
              {email}
            </span>
            <Button variant="outline" size="sm" onClick={signOut}>
              Sign out
            </Button>
          </>
        ) : (
          <Button size="sm" render={<Link href="/login" />}>
            Sign in
          </Button>
        ))}
      </nav>
    </header>
  );
}
