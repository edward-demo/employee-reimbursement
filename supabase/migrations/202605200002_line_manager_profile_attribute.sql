-- Move line-manager access from a role assignment to employee profile metadata.
-- Run this after the initial schema and RLS migrations if your QAT database
-- was already created before `employee_profiles.is_line_manager` existed.

alter table public.employee_profiles
add column if not exists is_line_manager boolean not null default false;

create index if not exists idx_employee_profiles_is_line_manager
  on public.employee_profiles (is_line_manager)
  where is_line_manager = true;

update public.employee_profiles ep
set is_line_manager = true,
    updated_at = now()
from public.user_roles ur
join public.roles r on r.role_id = ur.role_id
where ep.user_id = ur.user_id
  and r.code::text = 'line_manager';

delete from public.user_roles ur
using public.roles r
where ur.role_id = r.role_id
  and r.code::text = 'line_manager';

delete from public.roles
where code::text = 'line_manager';

create or replace function public.can_access_employee_profile(target_employee_profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.has_role('admin')
    or target_employee_profile_id = public.current_employee_profile_id()
    or (
      exists (
        select 1
        from public.employee_profiles manager
        join public.employee_profiles employee
          on employee.employee_profile_id = target_employee_profile_id
        where manager.employee_profile_id = public.current_employee_profile_id()
          and manager.is_line_manager = true
          and (
            employee.line_manager_employee_profile_id = manager.employee_profile_id
            or employee.department_id = manager.department_id
          )
      )
    )
$$;

drop policy if exists "Admins and line managers can update accessible reimbursement requests" on public.reimbursement_requests;
create policy "Admins and line managers can update accessible reimbursement requests"
on public.reimbursement_requests for update
to authenticated
using (
  (
    public.has_role('admin')
    and status = 'pending'
    and current_review_stage in ('admin', 'finance')
  )
  or (
    exists (
      select 1
      from public.employee_profiles manager
      where manager.employee_profile_id = public.current_employee_profile_id()
        and manager.is_line_manager = true
    )
    and public.can_access_employee_profile(employee_profile_id)
    and status = 'pending'
    and current_review_stage = 'line_manager'
  )
)
with check (
  (
    public.has_role('admin')
    and current_review_stage in ('admin', 'finance')
  )
  or (
    exists (
      select 1
      from public.employee_profiles manager
      where manager.employee_profile_id = public.current_employee_profile_id()
        and manager.is_line_manager = true
    )
    and public.can_access_employee_profile(employee_profile_id)
    and current_review_stage in ('line_manager', 'admin')
  )
);

drop policy if exists "Admins and line managers can insert decisions" on public.reimbursement_decisions;
create policy "Admins and line managers can insert decisions"
on public.reimbursement_decisions for insert
to authenticated
with check (
  decided_by_user_id = public.current_app_user_id()
  and public.can_access_reimbursement_request(reimbursement_request_id)
  and (
    (
      public.has_role('admin')
      and review_stage in ('admin', 'finance')
    )
    or (
      review_stage = 'line_manager'
      and exists (
        select 1
        from public.employee_profiles manager
        where manager.employee_profile_id = public.current_employee_profile_id()
          and manager.is_line_manager = true
      )
    )
  )
);

drop view if exists public.line_manager_queue;
create or replace view public.line_manager_queue
with (security_invoker = on) as
select
  manager.employee_profile_id as manager_employee_profile_id,
  employee.employee_profile_id as employee_profile_id,
  rr.reimbursement_request_id,
  rr.request_number,
  employee.full_name as employee_name,
  rr.category,
  rr.status,
  rr.current_review_stage,
  rr.submitted_at,
  rr.claim_amount,
  extract(day from now() - rr.submitted_at)::integer as days_pending
from public.employee_profiles manager
join public.employee_profiles employee
  on employee.line_manager_employee_profile_id = manager.employee_profile_id
join public.reimbursement_requests rr
  on rr.employee_profile_id = employee.employee_profile_id
where manager.is_line_manager = true
  and rr.status = 'pending'
  and rr.current_review_stage = 'line_manager';
