-- QAT user mapping seed
-- Run this in Supabase Dashboard > SQL Editor after creating test users in
-- Supabase Authentication. Do not run this from the browser app or as an
-- `authenticated` user, because it reads auth.users and writes setup data.
-- It mirrors auth.users into the app authorization tables and infers department,
-- display name, and additive starting roles from each email address.

do $$
begin
  if current_role = 'authenticated' then
    raise exception 'Run this seed from Supabase SQL Editor as the database owner, not as the authenticated app role.';
  end if;
end $$;

insert into public.departments (name)
values
  ('Product Development'),
  ('Finance'),
  ('HR'),
  ('Admin'),
  ('IT Helpdesk')
on conflict (name) do nothing;

insert into public.roles (code, display_name)
values
  ('employee', 'Employee'),
  ('admin', 'Admin')
on conflict (code) do update set display_name = excluded.display_name;

with auth_source as (
  select
    au.id::text as auth_subject,
    lower(au.email) as email,
    lower(split_part(au.email, '@', 1)) as email_name
  from auth.users au
  where au.email is not null
),
mapped_users as (
  select
    auth_subject,
    email,
    case
      when email = 'financeguy@test123.com' then 'Finance Guy'
      when email = 'hrguy@test123.com' then 'HR Guy'
      when email = 'nurseguy@test123.com' then 'Nurse Guy'
      when email = 'itguy@test123.com' then 'IT Guy'
      when email = 'linemanagerguy@test123.com' then 'Line Manager Guy'
      else initcap(
        regexp_replace(
          regexp_replace(email_name, '[._+-]+', ' ', 'g'),
          '([a-z])([0-9])',
          '\1 \2',
          'g'
        )
      )
    end as display_name,
    case
      when email = 'edward.sal365@gmail.com' then 'Product Development'
      when email_name ~ '(product|prod|dev|developer|engineer|software|qa|quality)' then 'Product Development'
      when email_name ~ '(finance|accounting|accountant|payroll|billing)' then 'Finance'
      when email_name ~ '(^hr$|hr[._+-]|[._+-]hr|human|people|talent)' then 'HR'
      when email_name ~ '(it|helpdesk|support|tech|systems|infra)' then 'IT Helpdesk'
      when email_name ~ '(admin|operations|ops)' then 'Admin'
      else 'Admin'
    end as department_name,
    email_name ~ '(manager|lead|supervisor|approver)' as is_line_manager
  from auth_source
),
upserted_users as (
  insert into public.users (email, display_name, status)
  select email, display_name, 'active'
  from mapped_users
  on conflict (email) do update
    set display_name = excluded.display_name,
        status = 'active',
        updated_at = now()
  returning user_id, email
),
linked_identities as (
  insert into public.user_identity_links (
    user_id,
    identity_provider,
    external_subject,
    external_email,
    external_username,
    last_seen_at
  )
  select
    uu.user_id,
    'supabase',
    mu.auth_subject,
    mu.email,
    mu.email,
    now()
  from mapped_users mu
  join upserted_users uu on uu.email = mu.email
  on conflict (identity_provider, external_subject) do update
    set user_id = excluded.user_id,
        external_email = excluded.external_email,
        external_username = excluded.external_username,
        last_seen_at = now(),
        updated_at = now()
  returning user_id
),
upserted_profiles as (
  insert into public.employee_profiles (
    user_id,
    employee_number,
    full_name,
    designation,
    department_id,
    is_line_manager,
    employment_status
  )
  select
    uu.user_id,
    'QAT-' || upper(substr(md5(mu.email), 1, 8)),
    mu.display_name,
    case
      when mu.is_line_manager then 'Line Manager'
      when mu.department_name = 'Finance' then 'Finance Associate'
      when mu.department_name = 'HR' then 'HR Associate'
      when mu.department_name = 'Admin' then 'System Administrator'
      when mu.department_name = 'IT Helpdesk' then 'IT Helpdesk Associate'
      when mu.department_name = 'Product Development' then 'Product Development Associate'
      else 'Employee'
    end,
    d.department_id,
    mu.is_line_manager,
    'active'
  from mapped_users mu
  join upserted_users uu on uu.email = mu.email
  join public.departments d on d.name = mu.department_name
  on conflict (user_id) do update
    set full_name = excluded.full_name,
        designation = excluded.designation,
        department_id = excluded.department_id,
        is_line_manager = excluded.is_line_manager,
        employment_status = 'active',
        updated_at = now()
  returning employee_profile_id
),
role_assignments as (
  select email, 'employee'::public.system_role as role_code
  from mapped_users

  union

  select email, 'admin'::public.system_role as role_code
  from mapped_users
  where department_name in ('Finance', 'HR', 'Admin')
)
insert into public.user_roles (user_id, role_id)
select uu.user_id, r.role_id
from role_assignments ra
join upserted_users uu on uu.email = ra.email
join public.roles r on r.code = ra.role_code
on conflict do nothing;

insert into public.employee_benefit_enrollments (
  employee_profile_id,
  benefit_plan_id,
  plan_year
)
select
  ep.employee_profile_id,
  bp.benefit_plan_id,
  extract(year from current_date)::integer
from public.employee_profiles ep
cross join public.benefit_plans bp
where bp.is_active = true
  and not exists (
    select 1
    from public.employee_benefit_enrollments existing
    where existing.employee_profile_id = ep.employee_profile_id
      and existing.benefit_plan_id = bp.benefit_plan_id
      and existing.plan_year = extract(year from current_date)::integer
  );

select
  u.email,
  u.display_name,
  d.name as department,
  ep.is_line_manager,
  r.code as role
from public.users u
join public.employee_profiles ep on ep.user_id = u.user_id
join public.departments d on d.department_id = ep.department_id
left join public.user_roles ur on ur.user_id = u.user_id
left join public.roles r on r.role_id = ur.role_id
order by d.name, u.display_name;
