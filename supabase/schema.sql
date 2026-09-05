-- ============================================================
-- SpeakForward 数据库初始化脚本
-- 执行位置：Supabase Dashboard → SQL Editor → 粘贴全部 → Run
-- 只需执行一次
-- ============================================================

-- ---------- 表结构 ----------

-- 用户扩展表：年龄自我声明（§2.1 邮箱+年龄自我声明，无医学证明）
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  age_declared boolean not null default false,
  created_at timestamptz not null default now()
);

-- 项目表：发声项目（§2.3 媒体在 Storage，链上只锚定哈希）
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  vision_text text not null,
  health_reason text not null,            -- 公开展示的健康原因声明（§2.4）
  persona text not null check (persona in ('advocate','storyteller','mobilizer')),
  audio_path text,                        -- Storage 内的对象路径
  creator_wallet text,                    -- 创作者收款钱包地址（公开）
  anchor_tx_signature text,               -- §2.3 Memo 锚定交易签名
  anchor_hash text,                       -- 内容元数据哈希
  created_at timestamptz not null default now()
);

-- 链上捐赠记录表：仅记录 Devnet 交易签名用于公开透明（§2.2 平台不经手资金）
create table if not exists public.pledges (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  tx_signature text not null,
  donor_wallet text not null,
  amount_sol numeric not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- 行级安全 (RLS) ----------

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.pledges enable row level security;

-- profiles：本人可读写，其他人不可见（邮箱不公开）
create policy "profiles_self_select" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_self_update" on public.profiles
  for update using (auth.uid() = id);
create policy "profiles_self_insert" on public.profiles
  for insert with check (auth.uid() = id);

-- projects：所有人可读（公开项目页），本人可增改
create policy "projects_public_read" on public.projects
  for select using (true);
create policy "projects_owner_insert" on public.projects
  for insert with check (auth.uid() = user_id);
create policy "projects_owner_update" on public.projects
  for update using (auth.uid() = user_id);

-- pledges：所有人可读（社区信任的基础），登录用户可记录
create policy "pledges_public_read" on public.pledges
  for select using (true);
create policy "pledges_auth_insert" on public.pledges
  for insert with check (auth.uid() is not null);

-- 自动为新用户创建 profile
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
