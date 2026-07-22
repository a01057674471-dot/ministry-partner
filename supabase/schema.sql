create table if not exists public.user_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  document_key text not null,
  content jsonb not null,
  updated_at timestamptz not null default now(),
  unique(user_id, document_key)
);

alter table public.user_documents enable row level security;

create policy "Users can read their own documents"
on public.user_documents for select
using (auth.uid() = user_id);

create policy "Users can insert their own documents"
on public.user_documents for insert
with check (auth.uid() = user_id);

create policy "Users can update their own documents"
on public.user_documents for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own documents"
on public.user_documents for delete
using (auth.uid() = user_id);

create index if not exists user_documents_user_id_idx
on public.user_documents(user_id);
