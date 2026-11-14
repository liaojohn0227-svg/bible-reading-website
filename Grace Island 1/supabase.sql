-- Execute in your Supabase project's SQL Editor for setup or updates.
begin;
create table if not exists public.grace_islands (
  owner_id uuid not null references auth.users(id) on delete cascade,
  room text not null check (char_length(room) between 1 and 80),
  name text not null check (char_length(name) between 1 and 40),
  snapshot jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (owner_id, room)
);
create or replace function public.validate_grace_island()
returns trigger language plpgsql set search_path = '' as $$
declare animal jsonb;
begin
  if jsonb_typeof(new.snapshot) <> 'object'
    or (new.snapshot - 'total' - 'animals') <> '{}'::jsonb
    or jsonb_typeof(new.snapshot->'total') is distinct from 'number'
    or (new.snapshot->>'total') !~ '^[0-9]+$'
    or (new.snapshot->>'total')::numeric > 9007199254740991
    or jsonb_typeof(new.snapshot->'animals') is distinct from 'array'
  then raise exception 'Invalid island snapshot'; end if;
  -- 4 penguin variants × 6 outfits + 7 other species = 31 groups at most
  if jsonb_array_length(new.snapshot->'animals') > 31 then
    raise exception 'Invalid animal groups';
  end if;
  for animal in select value from jsonb_array_elements(new.snapshot->'animals') loop
    if jsonb_typeof(animal) <> 'object'
      or (animal - 'species' - 'variant' - 'count' - 'outfit') <> '{}'::jsonb
      or coalesce(animal->>'species','') not in ('penguin','seal','bear','dolphin','whale','orca','beluga','narwhal')
      or coalesce(animal->>'count','') !~ '^[1-9][0-9]*$'
      or (animal->>'count')::numeric > 9007199254740991
      or (animal->>'species' = 'penguin' and coalesce(animal->>'variant','') not in ('adelie','emperor','rockhopper','chick','magellanic'))
      or (animal->>'species' <> 'penguin' and (animal->>'variant') is distinct from '')
      or (animal ? 'outfit' and (
        animal->>'species' <> 'penguin'
        or coalesce(animal->>'outfit','') not in ('pastor','warrior','angel','gardener','dress','prayer','priest','shepherd','evangelist')
      ))
    then raise exception 'Invalid animal'; end if;
  end loop;
  new.updated_at=now();
  return new;
end $$;
drop trigger if exists validate_grace_island on public.grace_islands;
create trigger validate_grace_island before insert or update on public.grace_islands
for each row execute function public.validate_grace_island();
alter table public.grace_islands enable row level security;
revoke all on public.grace_islands from anon, authenticated;
grant select, insert, update, delete on public.grace_islands to authenticated;
drop policy if exists grace_read on public.grace_islands;
create policy grace_read on public.grace_islands for select to authenticated using (true);
drop policy if exists grace_insert on public.grace_islands;
create policy grace_insert on public.grace_islands for insert to authenticated with check ((select auth.uid())=owner_id);
drop policy if exists grace_update on public.grace_islands;
create policy grace_update on public.grace_islands for update to authenticated using ((select auth.uid())=owner_id) with check ((select auth.uid())=owner_id);
drop policy if exists grace_delete on public.grace_islands;
create policy grace_delete on public.grace_islands for delete to authenticated using ((select auth.uid())=owner_id);
commit;
