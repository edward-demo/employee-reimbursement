-- QAT user record audit
-- Run in Supabase Dashboard > SQL Editor.
-- Reports mismatches between Supabase Auth users and MedReimburse app records.

with auth_source as (
  select
    au.id::text as auth_subject,
    lower(au.email) as email,
    lower(split_part(au.email, '@', 1)) as email_name,
    au.raw_user_meta_data ->> 'display_name' as auth_display_name
  from auth.users au
  where au.email is not null
),
expected_users as (
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
    end as expected_display_name,
    case
      when email = 'edward.sal365@gmail.com' then 'Product Development'
      when email_name ~ '(product|prod|dev|developer|engineer|software|qa|quality)' then 'Product Development'
      when email_name ~ '(finance|accounting|accountant|payroll|billing)' then 'Finance'
      when email_name ~ '(^hr$|hr[._+-]|[._+-]hr|human|people|talent)' then 'HR'
      when email_name ~ '(it|helpdesk|support|tech|systems|infra)' then 'IT Helpdesk'
      when email_name ~ '(admin|operations|ops)' then 'Admin'
      else 'Admin'
    end as expected_department,
    email_name ~ '(manager|lead|supervisor|approver)' as expected_is_line_manager,
    auth_display_name
  from auth_source
),
actual_users as (
  select
    eu.email,
    eu.auth_subject,
    eu.auth_display_name,
    eu.expected_display_name,
    eu.expected_department,
    eu.expected_is_line_manager,
    u.user_id,
    u.display_name as app_display_name,
    u.status as app_status,
    uil.external_subject,
    ep.employee_profile_id,
    ep.employee_number,
    ep.full_name as profile_full_name,
    ep.is_line_manager,
    d.name as department_name,
    array_remove(array_agg(distinct r.code::text), null) as role_codes,
    count(distinct ebe.employee_benefit_enrollment_id) as benefit_enrollment_count,
    count(distinct rr.reimbursement_request_id) filter (where rr.status = 'pending') as pending_reimbursement_count
  from expected_users eu
  left join public.users u on lower(u.email) = eu.email
  left join public.user_identity_links uil
    on uil.user_id = u.user_id
    and uil.identity_provider = 'supabase'
  left join public.employee_profiles ep on ep.user_id = u.user_id
  left join public.departments d on d.department_id = ep.department_id
  left join public.user_roles ur on ur.user_id = u.user_id
  left join public.roles r on r.role_id = ur.role_id
  left join public.employee_benefit_enrollments ebe on ebe.employee_profile_id = ep.employee_profile_id
  left join public.reimbursement_requests rr on rr.employee_profile_id = ep.employee_profile_id
  group by
    eu.email,
    eu.auth_subject,
    eu.auth_display_name,
    eu.expected_display_name,
    eu.expected_department,
    eu.expected_is_line_manager,
    u.user_id,
    u.display_name,
    u.status,
    uil.external_subject,
    ep.employee_profile_id,
    ep.employee_number,
    ep.full_name,
    ep.is_line_manager,
    d.name
),
discrepancies as (
  select
    'missing_app_user' as issue,
    email,
    jsonb_build_object('expected', 'public.users row exists') as details
  from actual_users
  where user_id is null

  union all

  select
    'missing_identity_link' as issue,
    email,
    jsonb_build_object('expected_subject', auth_subject) as details
  from actual_users
  where user_id is not null
    and external_subject is null

  union all

  select
    'wrong_identity_link' as issue,
    email,
    jsonb_build_object('expected_subject', auth_subject, 'actual_subject', external_subject) as details
  from actual_users
  where external_subject is not null
    and external_subject <> auth_subject

  union all

  select
    'display_name_mismatch' as issue,
    email,
    jsonb_build_object('expected', expected_display_name, 'actual', app_display_name) as details
  from actual_users
  where user_id is not null
    and app_display_name is distinct from expected_display_name

  union all

  select
    'profile_name_mismatch' as issue,
    email,
    jsonb_build_object('expected', expected_display_name, 'actual', profile_full_name) as details
  from actual_users
  where employee_profile_id is not null
    and profile_full_name is distinct from expected_display_name

  union all

  select
    'missing_employee_profile' as issue,
    email,
    jsonb_build_object('expected', 'employee_profiles row exists') as details
  from actual_users
  where user_id is not null
    and employee_profile_id is null

  union all

  select
    'department_mismatch' as issue,
    email,
    jsonb_build_object('expected', expected_department, 'actual', department_name) as details
  from actual_users
  where employee_profile_id is not null
    and department_name is distinct from expected_department

  union all

  select
    'line_manager_flag_mismatch' as issue,
    email,
    jsonb_build_object('expected', expected_is_line_manager, 'actual', is_line_manager) as details
  from actual_users
  where employee_profile_id is not null
    and is_line_manager is distinct from expected_is_line_manager

  union all

  select
    'missing_employee_role' as issue,
    email,
    jsonb_build_object('actual_roles', role_codes) as details
  from actual_users
  where user_id is not null
    and not ('employee' = any(role_codes))

  union all

  select
    'missing_expected_admin_role' as issue,
    email,
    jsonb_build_object('department', department_name, 'actual_roles', role_codes) as details
  from actual_users
  where user_id is not null
    and expected_department in ('Finance', 'HR', 'Admin')
    and not ('admin' = any(role_codes))

  union all

  select
    'unexpected_admin_role' as issue,
    email,
    jsonb_build_object('department', department_name, 'actual_roles', role_codes) as details
  from actual_users
  where user_id is not null
    and expected_department not in ('Finance', 'HR', 'Admin')
    and 'admin' = any(role_codes)

  union all

  select
    'missing_benefit_enrollments' as issue,
    email,
    jsonb_build_object('actual_count', benefit_enrollment_count, 'expected_minimum', 2) as details
  from actual_users
  where employee_profile_id is not null
    and benefit_enrollment_count < 2

  union all

  select
    'pending_reimbursements_exist' as issue,
    email,
    jsonb_build_object('pending_count', pending_reimbursement_count) as details
  from actual_users
  where pending_reimbursement_count > 0
)
select *
from discrepancies
order by email, issue;
