-- For Keeps cloud schema (Supabase / Postgres 15+).
-- Mirrors src/data/sqlite/migrations.ts so local rows sync 1:1, plus multi-user vault
-- membership and row-level security. Apply with: supabase db push

create extension if not exists "pgcrypto";

-- ---------- Vaults & membership ----------
create table public.vaults (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create type public.vault_role as enum ('owner', 'editor', 'viewer');

create table public.vault_members (
  vault_id uuid not null references public.vaults(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.vault_role not null default 'viewer',
  created_at timestamptz not null default now(),
  primary key (vault_id, user_id)
);

create or replace function public.is_vault_member(v uuid, min_role public.vault_role default 'viewer')
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from vault_members m
    where m.vault_id = v and m.user_id = auth.uid()
      and (min_role = 'viewer'
        or (min_role = 'editor' and m.role in ('editor', 'owner'))
        or (min_role = 'owner' and m.role = 'owner'))
  );
$$;

-- Owner automatically becomes a member.
create or replace function public.add_owner_membership() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into vault_members (vault_id, user_id, role) values (new.id, new.owner_id, 'owner');
  return new;
end $$;
create trigger vaults_owner_membership after insert on public.vaults
  for each row execute function public.add_owner_membership();

-- ---------- Content ----------
create table public.people (
  id uuid primary key,
  vault_id uuid not null references public.vaults(id) on delete cascade,
  display_name text not null,
  relation text,
  birth_date date,
  created_at timestamptz not null, updated_at timestamptz not null, deleted_at timestamptz
);

create table public.memories (
  id uuid primary key,
  vault_id uuid not null references public.vaults(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  story text not null default '',
  occurred_on date,
  location text,
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null, updated_at timestamptz not null, deleted_at timestamptz
);
create index memories_timeline on public.memories (vault_id, occurred_on desc, created_at desc);
create index memories_updated on public.memories (vault_id, updated_at);

create table public.media_assets (
  id uuid primary key,
  memory_id uuid not null references public.memories(id) on delete cascade,
  remote_path text, -- storage key: vault-media/{vault_id}/{id}.{ext}
  width int, height int, mime_type text,
  position int not null default 0,
  created_at timestamptz not null, updated_at timestamptz not null, deleted_at timestamptz
);
create index media_by_memory on public.media_assets (memory_id, position);

create table public.memory_people (
  memory_id uuid not null references public.memories(id) on delete cascade,
  person_id uuid not null references public.people(id) on delete cascade,
  primary key (memory_id, person_id)
);

create table public.albums (
  id uuid primary key,
  vault_id uuid not null references public.vaults(id) on delete cascade,
  title text not null,
  description text,
  kind text not null default 'manual' check (kind in ('manual', 'year', 'person')),
  cover_asset_id uuid references public.media_assets(id) on delete set null,
  created_at timestamptz not null, updated_at timestamptz not null, deleted_at timestamptz
);

create table public.album_memories (
  album_id uuid not null references public.albums(id) on delete cascade,
  memory_id uuid not null references public.memories(id) on delete cascade,
  position int not null default 0,
  primary key (album_id, memory_id)
);

create table public.books (
  id uuid primary key,
  vault_id uuid not null references public.vaults(id) on delete cascade,
  album_id uuid references public.albums(id) on delete set null,
  title text not null,
  subtitle text,
  trim_size text not null check (trim_size in ('square_8', 'letter_portrait', 'a4_portrait', 'landscape_11x8_5')),
  status text not null default 'draft' check (status in ('draft', 'exported', 'ordered')),
  created_at timestamptz not null, updated_at timestamptz not null, deleted_at timestamptz
);

create table public.book_pages (
  id uuid primary key,
  book_id uuid not null references public.books(id) on delete cascade,
  position int not null,
  layout text not null,
  asset_ids uuid[] not null default '{}',
  heading text,
  body text,
  created_at timestamptz not null, updated_at timestamptz not null, deleted_at timestamptz
);
create index pages_by_book on public.book_pages (book_id, position);

-- Print orders (physical goods: external payment processor, not IAP).
create table public.print_orders (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books(id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  provider text not null,
  provider_order_id text,
  status text not null default 'pending' check (status in ('pending', 'paid', 'printing', 'shipped', 'delivered', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- The Keep referral bridge ----------
-- Only anonymous install refs; linking to a Keep account happens on The Keep side after the
-- user signs up there and explicitly chooses to connect For Keeps.
create table public.keep_referrals (
  install_ref uuid primary key,
  user_id uuid references auth.users(id) on delete set null,
  first_opened_at timestamptz not null default now(),
  surface text not null,
  keep_account_linked_at timestamptz -- set by The Keep backend via service role
);

-- ---------- Row-level security ----------
alter table public.vaults enable row level security;
alter table public.vault_members enable row level security;
alter table public.people enable row level security;
alter table public.memories enable row level security;
alter table public.media_assets enable row level security;
alter table public.memory_people enable row level security;
alter table public.albums enable row level security;
alter table public.album_memories enable row level security;
alter table public.books enable row level security;
alter table public.book_pages enable row level security;
alter table public.print_orders enable row level security;
alter table public.keep_referrals enable row level security;

create policy vaults_read on public.vaults for select using (is_vault_member(id));
create policy vaults_insert on public.vaults for insert with check (owner_id = auth.uid());
create policy vaults_update on public.vaults for update using (is_vault_member(id, 'owner'));
create policy vaults_delete on public.vaults for delete using (is_vault_member(id, 'owner'));

create policy members_read on public.vault_members for select using (is_vault_member(vault_id));
create policy members_manage on public.vault_members for all
  using (is_vault_member(vault_id, 'owner')) with check (is_vault_member(vault_id, 'owner'));

-- Tables keyed directly by vault_id
do $$
declare t text;
begin
  foreach t in array array['people', 'memories', 'albums', 'books'] loop
    execute format('create policy %1$s_read on public.%1$s for select using (is_vault_member(vault_id))', t);
    execute format('create policy %1$s_write on public.%1$s for all using (is_vault_member(vault_id, ''editor'')) with check (is_vault_member(vault_id, ''editor''))', t);
  end loop;
end $$;

create policy media_read on public.media_assets for select
  using (exists (select 1 from memories m where m.id = memory_id and is_vault_member(m.vault_id)));
create policy media_write on public.media_assets for all
  using (exists (select 1 from memories m where m.id = memory_id and is_vault_member(m.vault_id, 'editor')))
  with check (exists (select 1 from memories m where m.id = memory_id and is_vault_member(m.vault_id, 'editor')));

create policy memory_people_rw on public.memory_people for all
  using (exists (select 1 from memories m where m.id = memory_id and is_vault_member(m.vault_id, 'editor')))
  with check (exists (select 1 from memories m where m.id = memory_id and is_vault_member(m.vault_id, 'editor')));

create policy album_memories_read on public.album_memories for select
  using (exists (select 1 from albums a where a.id = album_id and is_vault_member(a.vault_id)));
create policy album_memories_write on public.album_memories for all
  using (exists (select 1 from albums a where a.id = album_id and is_vault_member(a.vault_id, 'editor')))
  with check (exists (select 1 from albums a where a.id = album_id and is_vault_member(a.vault_id, 'editor')));

create policy pages_read on public.book_pages for select
  using (exists (select 1 from books b where b.id = book_id and is_vault_member(b.vault_id)));
create policy pages_write on public.book_pages for all
  using (exists (select 1 from books b where b.id = book_id and is_vault_member(b.vault_id, 'editor')))
  with check (exists (select 1 from books b where b.id = book_id and is_vault_member(b.vault_id, 'editor')));

create policy orders_own on public.print_orders for select using (user_id = auth.uid());
create policy orders_insert on public.print_orders for insert with check (user_id = auth.uid());

create policy referrals_insert on public.keep_referrals for insert with check (user_id is null or user_id = auth.uid());
create policy referrals_own on public.keep_referrals for select using (user_id = auth.uid());

-- ---------- Storage ----------
insert into storage.buckets (id, name, public) values ('vault-media', 'vault-media', false)
  on conflict (id) do nothing;

create policy "vault media read" on storage.objects for select
  using (bucket_id = 'vault-media' and is_vault_member(((storage.foldername(name))[1])::uuid));
create policy "vault media write" on storage.objects for insert
  with check (bucket_id = 'vault-media' and is_vault_member(((storage.foldername(name))[1])::uuid, 'editor'));
create policy "vault media delete" on storage.objects for delete
  using (bucket_id = 'vault-media' and is_vault_member(((storage.foldername(name))[1])::uuid, 'editor'));

-- ---------- Housekeeping ----------
create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
create trigger vaults_touch before update on public.vaults for each row execute function public.touch_updated_at();
create trigger orders_touch before update on public.print_orders for each row execute function public.touch_updated_at();
