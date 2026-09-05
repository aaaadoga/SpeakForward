import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// 临时诊断路由（M6）：定位生产首页空状态问题，验收后删除。
export const dynamic = "force-dynamic";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "(unset)";
  const hasServiceKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

  const result: Record<string, unknown> = { urlHost: safeHost(url), hasServiceKey };

  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("projects")
      .select("id, title")
      .order("created_at", { ascending: false })
      .limit(5);
    result.admin = error ? `ERR: ${error.message}` : `OK ${data?.length ?? 0} rows`;
  } catch (e) {
    result.admin = `THROW: ${e instanceof Error ? e.message : String(e)}`;
  }

  return NextResponse.json(result);
}

function safeHost(u: string) {
  try {
    return new URL(u).host;
  } catch {
    return `MALFORMED(${u.slice(0, 12)}…)`;
  }
}
