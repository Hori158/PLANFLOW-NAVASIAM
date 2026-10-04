create table if not exists public.plan_items (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

grant select on table public.plan_items to anon, authenticated;
grant insert, update, delete on table public.plan_items to authenticated;

alter table public.plan_items enable row level security;

drop policy if exists "Anyone can read plans" on public.plan_items;
create policy "Anyone can read plans"
  on public.plan_items for select
  to anon, authenticated
  using (true);

drop policy if exists "Signed-in users can insert plans" on public.plan_items;
create policy "Signed-in users can insert plans"
  on public.plan_items for insert
  to authenticated
  with check (auth.uid() is not null);

drop policy if exists "Signed-in users can update plans" on public.plan_items;
create policy "Signed-in users can update plans"
  on public.plan_items for update
  to authenticated
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

drop policy if exists "Signed-in users can delete plans" on public.plan_items;
create policy "Signed-in users can delete plans"
  on public.plan_items for delete
  to authenticated
  using (auth.uid() is not null);

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'plan_items'
  ) then
    alter publication supabase_realtime add table public.plan_items;
  end if;
end;
$$;
