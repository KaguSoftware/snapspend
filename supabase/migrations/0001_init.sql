-- SnapSpend initial schema. Not yet applied: the Supabase account hit its
-- free-project limit during development (see BACKEND_NOTES.md). Apply with
-- `supabase db push` or the Supabase MCP apply_migration tool once a project exists.

create type public.receipt_category as enum (
  'groceries', 'dining', 'transport', 'shopping',
  'utilities', 'health', 'entertainment', 'other'
);

create type public.receipt_status as enum ('processing', 'done', 'failed');
create type public.receipt_source as enum ('scan', 'manual');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  currency text not null default 'USD',
  created_at timestamptz not null default now()
);

create table public.receipts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  image_path text,
  merchant text,
  total numeric(12, 2),
  currency text not null default 'USD',
  purchased_at timestamptz,
  category public.receipt_category not null default 'other',
  status public.receipt_status not null default 'processing',
  source public.receipt_source not null default 'scan',
  raw_extraction jsonb,
  created_at timestamptz not null default now()
);

create index receipts_user_purchased_idx on public.receipts (user_id, purchased_at desc);

create table public.line_items (
  id uuid primary key default gen_random_uuid(),
  receipt_id uuid not null references public.receipts (id) on delete cascade,
  name text not null,
  quantity numeric(10, 2) not null default 1,
  unit_price numeric(12, 2) not null default 0
);

create index line_items_receipt_idx on public.line_items (receipt_id);

-- Auto-create a profile on signup.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data ->> 'display_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Row Level Security: owner-only access on every table.
alter table public.profiles enable row level security;
alter table public.receipts enable row level security;
alter table public.line_items enable row level security;

create policy "profiles: own row" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "receipts: own rows" on public.receipts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "line_items: own via receipt" on public.line_items
  for all using (
    exists (
      select 1 from public.receipts r
      where r.id = line_items.receipt_id and r.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.receipts r
      where r.id = line_items.receipt_id and r.user_id = auth.uid()
    )
  );

-- Private storage bucket for receipt images; per-user folder paths ({uid}/...).
insert into storage.buckets (id, name, public) values ('receipts', 'receipts', false);

create policy "receipt images: own folder read" on storage.objects
  for select using (
    bucket_id = 'receipts' and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "receipt images: own folder insert" on storage.objects
  for insert with check (
    bucket_id = 'receipts' and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "receipt images: own folder delete" on storage.objects
  for delete using (
    bucket_id = 'receipts' and (storage.foldername(name))[1] = auth.uid()::text
  );
