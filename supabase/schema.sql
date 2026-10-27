-- D2 bootstrap SQL (apply to a NEW dedicated Supabase project only).
-- Not an applied migration until the project's environment and owner have been approved.
-- Follow: https://supabase.com/docs/guides/database/postgres/row-level-security

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.admin_users enable row level security;
grant select on public.admin_users to authenticated;
create policy "read own admin membership" on public.admin_users
 for select to authenticated using ((select auth.uid()) = user_id);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('chupitos','cocteles','cervezas','cubatas','refrescos','vinos')),
  name text not null check (length(trim(name)) between 1 and 120),
  price numeric(8,2) not null check (price >= 0),
  visible boolean not null default true,
  position integer not null default 0,
  rating_sum integer not null default 0 check(rating_sum >= 0),
  rating_count integer not null default 0 check(rating_count >= 0),
  created_at timestamptz not null default now()
);
alter table public.products enable row level security;
grant select on public.products to anon,authenticated;
grant insert,delete on public.products to authenticated;
grant update (category,name,price,visible,position) on public.products to authenticated;
create policy "products visible to public" on public.products
 for select to anon,authenticated using (visible);
create policy "admins can read hidden products" on public.products
 for select to authenticated using (
  exists(select 1 from public.admin_users a where a.user_id=(select auth.uid()))
 );
create policy "admins can add products" on public.products
 for insert to authenticated with check (
  exists(select 1 from public.admin_users a where a.user_id=(select auth.uid()))
 );
create policy "admins can edit products" on public.products
 for update to authenticated
 using (exists(select 1 from public.admin_users a where a.user_id=(select auth.uid())))
 with check (exists(select 1 from public.admin_users a where a.user_id=(select auth.uid())));
create policy "admins can remove products" on public.products
 for delete to authenticated using (
  exists(select 1 from public.admin_users a where a.user_id=(select auth.uid()))
 );

create table if not exists public.weekly_schedule (
  weekday smallint primary key check (weekday between 0 and 6),
  open boolean not null default false,
  opens text check (opens ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  closes text check (closes ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  check (not open or (opens is not null and closes is not null and opens <> closes))
);
alter table public.weekly_schedule enable row level security;
grant select on public.weekly_schedule to anon,authenticated;
grant insert,update,delete on public.weekly_schedule to authenticated;
create policy "public can view weekly hours" on public.weekly_schedule for select to anon,authenticated using(true);
create policy "admins manage weekly hours" on public.weekly_schedule for all to authenticated
 using (exists(select 1 from public.admin_users a where a.user_id=(select auth.uid())))
 with check (exists(select 1 from public.admin_users a where a.user_id=(select auth.uid())));

insert into public.weekly_schedule (weekday,open,opens,closes) values
 (0,true,'21:30','03:00'),(1,false,null,null),(2,false,null,null),(3,false,null,null),
 (4,true,'21:30','03:00'),(5,true,'21:30','04:00'),(6,true,'21:30','04:00')
on conflict (weekday) do nothing;

create table if not exists public.schedule_exceptions (
  date date primary key,
  kind text not null check(kind in ('closed','special')),
  opens text check(opens ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  closes text check(closes ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  note text check (length(note)<=200),
  check(kind='closed' or (opens is not null and closes is not null and opens<>closes))
);
alter table public.schedule_exceptions enable row level security;
grant select on public.schedule_exceptions to anon,authenticated;
grant insert,update,delete on public.schedule_exceptions to authenticated;
create policy "public can see schedule exceptions" on public.schedule_exceptions
 for select to anon,authenticated using (true);
create policy "admins manage exceptions" on public.schedule_exceptions for all to authenticated
 using (exists(select 1 from public.admin_users a where a.user_id=(select auth.uid())))
 with check (exists(select 1 from public.admin_users a where a.user_id=(select auth.uid())));

create table if not exists public.ratings (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  visitor_hash text not null,
  stars smallint not null check (stars between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(product_id,visitor_hash)
);
alter table public.ratings enable row level security;
-- No select/insert/update/delete grant or policies for visitors/admins.
-- Votes are handled by one server route using the service role, never exposed to browsers.

create schema if not exists internal;
revoke all on schema internal from public;
create or replace function internal.update_product_rating_totals()
returns trigger language plpgsql security definer set search_path=''
as $function$
declare chosen_id uuid;
begin
 if TG_OP='DELETE' then chosen_id=old.product_id;
 else chosen_id=new.product_id;
 end if;
 update public.products
 set rating_sum=(select coalesce(sum(r.stars),0)::integer from public.ratings r where r.product_id=chosen_id),
     rating_count=(select count(*)::integer from public.ratings r where r.product_id=chosen_id)
 where id=chosen_id;
 if TG_OP='DELETE' then return old; end if;
 return new;
end
$function$;
revoke all on function internal.update_product_rating_totals() from public;
create trigger recalculate_ratings after insert or update or delete on public.ratings
for each row execute function internal.update_product_rating_totals();

-- IMPORTANT: To authorize the owner, create user manually in Supabase Auth
-- and then insert into public.admin_users(user_id) values ('<auth.users UUID>');
-- Never use user_metadata as an access-control decision.
