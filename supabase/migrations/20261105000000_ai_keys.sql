-- Each person's own AI key, stored encrypted (AES-256-GCM, see src/lib/ai-key-crypto.ts).
-- Run this in the Supabase SQL editor on an existing project. A new project gets it from this file too.

create table if not exists public.ai_keys (
  user_id uuid primary key references auth.users (id) on delete cascade,
  provider text not null default 'gemini',
  encrypted_key text not null,
  key_hint text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ai_keys enable row level security;

-- Only the owner can see or change their row (the stored value is ciphertext either way)
drop policy if exists "ai_keys_select_own" on public.ai_keys;
drop policy if exists "ai_keys_insert_own" on public.ai_keys;
drop policy if exists "ai_keys_update_own" on public.ai_keys;
drop policy if exists "ai_keys_delete_own" on public.ai_keys;

create policy "ai_keys_select_own" on public.ai_keys for select using (auth.uid() = user_id);
create policy "ai_keys_insert_own" on public.ai_keys for insert with check (auth.uid() = user_id);
create policy "ai_keys_update_own" on public.ai_keys for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "ai_keys_delete_own" on public.ai_keys for delete using (auth.uid() = user_id);
