import { NextResponse } from "next/server";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// §2.2: 点对点直接捐赠 —— 平台绝不持有、路由或托管资金。
// 本接口仅做两件事：验证交易确实发生在链上、记录签名供公开查阅。
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  // 登录用户才能记录（防滥用）；捐赠本身不要求登录
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ error: "记录捐赠需要先登录" }, { status: 401 });
  }

  const body = (await request.json()) as {
    tx_signature?: string;
    donor_wallet?: string;
    amount_sol?: number;
  };
  const txSignature = (body.tx_signature ?? "").trim();
  const donorWallet = (body.donor_wallet ?? "").trim();
  const amountSol = Number(body.amount_sol ?? 0);
  if (!txSignature || !donorWallet || !(amountSol > 0)) {
    return NextResponse.json({ error: "参数不完整" }, { status: 400 });
  }

  // 查项目与创作者收款地址
  const admin = createAdminClient();
  const { data: project } = await admin
    .from("projects")
    .select("id, creator_wallet")
    .eq("id", id)
    .single();
  if (!project?.creator_wallet) {
    return NextResponse.json(
      { error: "项目不存在或未设置收款钱包" },
      { status: 404 },
    );
  }

  // §2.2 信任基础：验证链上交易真实存在且涉及创作者钱包
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  const tx = await connection.getParsedTransaction(txSignature, "confirmed");
  if (!tx) {
    return NextResponse.json({ error: "链上未找到该交易" }, { status: 400 });
  }
  const creatorKey = new PublicKey(project.creator_wallet);
  const accountKeys = tx.transaction.message.accountKeys.map((k) => k.pubkey);
  const paidToCreator = accountKeys.some((key) => key.equals(creatorKey));
  if (!paidToCreator) {
    return NextResponse.json(
      { error: "交易未涉及创作者钱包地址" },
      { status: 400 },
    );
  }

  const { error } = await admin.from("pledges").insert({
    project_id: id,
    tx_signature: txSignature,
    donor_wallet: donorWallet,
    amount_sol: amountSol,
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true }, { status: 201 });
}
