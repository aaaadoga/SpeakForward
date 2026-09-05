import { createClient as createSupabaseClient, SupabaseClient } from "@supabase/supabase-js";

// 服务端专用：service role 密钥，绕过 RLS。
// 绝不能 import 进任何客户端组件（本文件仅被 route handlers 引用）。
// 密钥来自环境变量，绝不硬编码（§7.1）。
let cached: SupabaseClient | null = null;

export function createAdminClient() {
  if (cached) return cached;
  cached = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  return cached;
}
