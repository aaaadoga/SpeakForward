import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// §2.1: 年龄自我声明 —— 无医学证明、无管理员审核，
// 信任判断权下放给社区/捐赠者（§2.1 资格验证方式）
export async function POST() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { error } = await supabase
    .from("profiles")
    .update({ age_declared: true })
    .eq("id", userData.user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
