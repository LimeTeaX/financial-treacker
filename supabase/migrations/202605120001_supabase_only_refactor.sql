begin;

alter table public.transactions add column if not exists user_id uuid;
alter table public.recurring_transactions add column if not exists user_id uuid;
alter table public.bills add column if not exists user_id uuid;
alter table public.login_history add column if not exists user_id uuid;
alter table public.user_profiles add column if not exists user_id uuid;
alter table public.user_roles add column if not exists user_id uuid;
alter table public.user_settings add column if not exists user_id uuid;

alter table public.bills add column if not exists method text;
alter table public.bills add column if not exists paid_at timestamptz;

do $$
declare
  target_table text;
begin
  foreach target_table in array array[
    'transactions',
    'recurring_transactions',
    'bills',
    'login_history',
    'user_profiles',
    'user_roles'
  ]
  loop
    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = target_table
        and column_name = 'id'
        and data_type in ('smallint', 'integer', 'bigint')
        and column_default is null
        and is_identity = 'NO'
    ) then
      execute format('create sequence if not exists public.%I', target_table || '_id_seq');
      execute format(
        'select setval(%L::regclass, coalesce((select max(id) from public.%I), 0) + 1, false)',
        'public.' || target_table || '_id_seq',
        target_table
      );
      execute format('alter sequence public.%I owned by public.%I.id', target_table || '_id_seq', target_table);
      execute format(
        'alter table public.%I alter column id set default nextval(%L::regclass)',
        target_table,
        'public.' || target_table || '_id_seq'
      );
    end if;
  end loop;
end $$;

update public.user_profiles profile
set user_id = auth_user.id
from auth.users auth_user
where profile.user_id is null
  and profile.email is not null
  and lower(profile.email) = lower(auth_user.email);

delete from public.user_profiles a
using public.user_profiles b
where a.user_id is not null
  and a.user_id = b.user_id
  and a.ctid < b.ctid;

delete from public.user_roles a
using public.user_roles b
where a.user_id is not null
  and a.user_id = b.user_id
  and a.ctid < b.ctid;

delete from public.user_settings a
using public.user_settings b
where a.user_id is not null
  and a.user_id = b.user_id
  and a.ctid < b.ctid;

create unique index if not exists user_profiles_user_id_key on public.user_profiles (user_id);
create unique index if not exists user_roles_user_id_key on public.user_roles (user_id);
create unique index if not exists user_settings_user_id_key on public.user_settings (user_id);

insert into public.user_profiles (
  user_id,
  name,
  email,
  avatar_url,
  title,
  location,
  member_since,
  program,
  semester,
  nim,
  faculty
)
select
  auth_user.id,
  coalesce(
    nullif(auth_user.raw_user_meta_data->>'full_name', ''),
    nullif(auth_user.raw_user_meta_data->>'name', ''),
    split_part(auth_user.email, '@', 1),
    'User'
  ),
  auth_user.email,
  coalesce(
    nullif(auth_user.raw_user_meta_data->>'avatar_url', ''),
    nullif(auth_user.raw_user_meta_data->>'picture', ''),
    ''
  ),
  'Dashboard user',
  '',
  auth_user.created_at::date,
  '',
  '',
  '',
  ''
from auth.users auth_user
on conflict (user_id) do update set
  email = excluded.email,
  name = coalesce(public.user_profiles.name, excluded.name),
  avatar_url = coalesce(public.user_profiles.avatar_url, excluded.avatar_url),
  member_since = coalesce(public.user_profiles.member_since, excluded.member_since);

insert into public.user_roles (user_id, role)
select auth_user.id, 'user'
from auth.users auth_user
on conflict (user_id) do nothing;

with legacy_settings as (
  select
    theme,
    currency,
    date_format,
    language,
    email_alerts,
    monthly_reports,
    font_size,
    biometric_login,
    transaction_pin
  from public.user_settings
  where user_id is null
  limit 1
)
insert into public.user_settings (
  user_id,
  theme,
  currency,
  date_format,
  language,
  email_alerts,
  monthly_reports,
  font_size,
  biometric_login,
  transaction_pin
)
select
  auth_user.id,
  coalesce((select theme from legacy_settings), 'light'),
  coalesce((select currency from legacy_settings), 'IDR'),
  coalesce((select date_format from legacy_settings), 'DD/MM/YYYY'),
  coalesce((select language from legacy_settings), 'Indonesian'),
  coalesce((select email_alerts from legacy_settings), true),
  coalesce((select monthly_reports from legacy_settings), false),
  coalesce((select font_size from legacy_settings), 'normal'),
  coalesce((select biometric_login from legacy_settings), false),
  coalesce((select transaction_pin from legacy_settings), '')
from auth.users auth_user
on conflict (user_id) do nothing;

delete from public.user_profiles where user_id is null;
delete from public.user_roles where user_id is null;
delete from public.user_settings where user_id is null;
delete from public.transactions where user_id is null;
delete from public.recurring_transactions where user_id is null;
delete from public.bills where user_id is null;
delete from public.login_history where user_id is null;

alter table public.user_profiles alter column user_id set not null;
alter table public.user_roles alter column user_id set not null;
alter table public.user_settings alter column user_id set not null;
alter table public.transactions alter column user_id set not null;
alter table public.recurring_transactions alter column user_id set not null;
alter table public.bills alter column user_id set not null;
alter table public.login_history alter column user_id set not null;

alter table public.user_settings drop constraint if exists user_settings_pkey;
alter table public.user_settings drop column if exists id;
alter table public.user_settings add constraint user_settings_pkey primary key (user_id);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'transactions_user_id_fkey') then
    alter table public.transactions
      add constraint transactions_user_id_fkey
      foreign key (user_id) references auth.users(id) on delete cascade;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'recurring_transactions_user_id_fkey') then
    alter table public.recurring_transactions
      add constraint recurring_transactions_user_id_fkey
      foreign key (user_id) references auth.users(id) on delete cascade;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'bills_user_id_fkey') then
    alter table public.bills
      add constraint bills_user_id_fkey
      foreign key (user_id) references auth.users(id) on delete cascade;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'login_history_user_id_fkey') then
    alter table public.login_history
      add constraint login_history_user_id_fkey
      foreign key (user_id) references auth.users(id) on delete cascade;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'user_profiles_user_id_fkey') then
    alter table public.user_profiles
      add constraint user_profiles_user_id_fkey
      foreign key (user_id) references auth.users(id) on delete cascade;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'user_roles_user_id_fkey') then
    alter table public.user_roles
      add constraint user_roles_user_id_fkey
      foreign key (user_id) references auth.users(id) on delete cascade;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'user_settings_user_id_fkey') then
    alter table public.user_settings
      add constraint user_settings_user_id_fkey
      foreign key (user_id) references auth.users(id) on delete cascade;
  end if;
end $$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  insert into public.user_profiles (
    user_id,
    name,
    email,
    avatar_url,
    title,
    location,
    member_since,
    program,
    semester,
    nim,
    faculty
  )
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data->>'full_name', ''),
      nullif(new.raw_user_meta_data->>'name', ''),
      split_part(new.email, '@', 1),
      'User'
    ),
    new.email,
    coalesce(
      nullif(new.raw_user_meta_data->>'avatar_url', ''),
      nullif(new.raw_user_meta_data->>'picture', ''),
      ''
    ),
    'Dashboard user',
    '',
    new.created_at::date,
    '',
    '',
    '',
    ''
  )
  on conflict (user_id) do update set
    email = excluded.email,
    name = coalesce(public.user_profiles.name, excluded.name),
    avatar_url = coalesce(public.user_profiles.avatar_url, excluded.avatar_url);

  insert into public.user_roles (user_id, role)
  values (new.id, 'user')
  on conflict (user_id) do nothing;

  insert into public.user_settings (
    user_id,
    theme,
    currency,
    date_format,
    language,
    email_alerts,
    monthly_reports,
    font_size,
    biometric_login,
    transaction_pin
  )
  values (
    new.id,
    'light',
    'IDR',
    'DD/MM/YYYY',
    'Indonesian',
    true,
    false,
    'normal',
    false,
    ''
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.transactions enable row level security;
alter table public.recurring_transactions enable row level security;
alter table public.bills enable row level security;
alter table public.login_history enable row level security;
alter table public.user_profiles enable row level security;
alter table public.user_settings enable row level security;
alter table public.user_roles enable row level security;

drop policy if exists "transactions_select_own" on public.transactions;
drop policy if exists "transactions_insert_own" on public.transactions;
drop policy if exists "transactions_update_own" on public.transactions;
drop policy if exists "transactions_delete_own" on public.transactions;
create policy "transactions_select_own" on public.transactions
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "transactions_insert_own" on public.transactions
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "transactions_update_own" on public.transactions
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "transactions_delete_own" on public.transactions
  for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "recurring_transactions_select_own" on public.recurring_transactions;
drop policy if exists "recurring_transactions_insert_own" on public.recurring_transactions;
drop policy if exists "recurring_transactions_update_own" on public.recurring_transactions;
drop policy if exists "recurring_transactions_delete_own" on public.recurring_transactions;
create policy "recurring_transactions_select_own" on public.recurring_transactions
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "recurring_transactions_insert_own" on public.recurring_transactions
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "recurring_transactions_update_own" on public.recurring_transactions
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "recurring_transactions_delete_own" on public.recurring_transactions
  for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "bills_select_own" on public.bills;
drop policy if exists "bills_insert_own" on public.bills;
drop policy if exists "bills_update_own" on public.bills;
drop policy if exists "bills_delete_own" on public.bills;
create policy "bills_select_own" on public.bills
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "bills_insert_own" on public.bills
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "bills_update_own" on public.bills
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "bills_delete_own" on public.bills
  for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "login_history_select_own" on public.login_history;
drop policy if exists "login_history_insert_own" on public.login_history;
drop policy if exists "login_history_update_own" on public.login_history;
drop policy if exists "login_history_delete_own" on public.login_history;
create policy "login_history_select_own" on public.login_history
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "login_history_insert_own" on public.login_history
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "login_history_update_own" on public.login_history
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "login_history_delete_own" on public.login_history
  for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "user_profiles_select_own" on public.user_profiles;
drop policy if exists "user_profiles_insert_own" on public.user_profiles;
drop policy if exists "user_profiles_update_own" on public.user_profiles;
drop policy if exists "user_profiles_delete_own" on public.user_profiles;
create policy "user_profiles_select_own" on public.user_profiles
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "user_profiles_insert_own" on public.user_profiles
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "user_profiles_update_own" on public.user_profiles
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "user_profiles_delete_own" on public.user_profiles
  for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "user_settings_select_own" on public.user_settings;
drop policy if exists "user_settings_insert_own" on public.user_settings;
drop policy if exists "user_settings_update_own" on public.user_settings;
drop policy if exists "user_settings_delete_own" on public.user_settings;
create policy "user_settings_select_own" on public.user_settings
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "user_settings_insert_own" on public.user_settings
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "user_settings_update_own" on public.user_settings
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "user_settings_delete_own" on public.user_settings
  for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "user_roles_select_own" on public.user_roles;
drop policy if exists "user_roles_insert_own" on public.user_roles;
drop policy if exists "user_roles_update_own" on public.user_roles;
drop policy if exists "user_roles_delete_own" on public.user_roles;
create policy "user_roles_select_own" on public.user_roles
  for select to authenticated using ((select auth.uid()) = user_id);

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'transactions',
    'recurring_transactions',
    'bills',
    'login_history',
    'user_profiles',
    'user_settings',
    'user_roles'
  ]
  loop
    begin
      execute format('alter publication supabase_realtime add table public.%I', table_name);
    exception
      when duplicate_object then null;
      when undefined_object then null;
    end;
  end loop;
end $$;

commit;
