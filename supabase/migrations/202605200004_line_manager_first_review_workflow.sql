-- Finalize the QAT review order:
-- Employee submits -> Line Manager signs off -> HR/Admin approves or denies.

alter table public.reimbursement_requests
alter column current_review_stage set default 'line_manager'::public.review_stage;

update public.reimbursement_requests
set current_review_stage = 'line_manager'::public.review_stage,
    updated_at = now()
where current_review_stage is null
  and status in ('draft', 'pending');

alter table public.reimbursement_requests
alter column current_review_stage set not null;

create index if not exists idx_reimbursement_requests_review_stage
  on public.reimbursement_requests (status, current_review_stage, submitted_at desc);

drop policy if exists "Employees can create own reimbursement requests" on public.reimbursement_requests;
create policy "Employees can create own reimbursement requests"
on public.reimbursement_requests for insert
to authenticated
with check (
  employee_profile_id = public.current_employee_profile_id()
  and status in ('draft', 'pending')
  and current_review_stage = 'line_manager'::public.review_stage
);

drop policy if exists "Admins and line managers can update accessible reimbursement requests" on public.reimbursement_requests;
create policy "Admins and line managers can update accessible reimbursement requests"
on public.reimbursement_requests for update
to authenticated
using (
  (
    public.has_role('admin')
    and status = 'pending'::public.reimbursement_status
    and current_review_stage in ('admin'::public.review_stage, 'finance'::public.review_stage)
  )
  or (
    exists (
      select 1
      from public.employee_profiles manager
      where manager.employee_profile_id = public.current_employee_profile_id()
        and manager.is_line_manager = true
    )
    and public.can_access_employee_profile(employee_profile_id)
    and status = 'pending'::public.reimbursement_status
    and current_review_stage = 'line_manager'::public.review_stage
  )
)
with check (
  (
    public.has_role('admin')
    and current_review_stage in ('admin'::public.review_stage, 'finance'::public.review_stage)
  )
  or (
    exists (
      select 1
      from public.employee_profiles manager
      where manager.employee_profile_id = public.current_employee_profile_id()
        and manager.is_line_manager = true
    )
    and public.can_access_employee_profile(employee_profile_id)
    and current_review_stage in ('line_manager'::public.review_stage, 'admin'::public.review_stage)
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
      and review_stage in ('admin'::public.review_stage, 'finance'::public.review_stage)
    )
    or (
      review_stage = 'line_manager'::public.review_stage
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
  and rr.status = 'pending'::public.reimbursement_status
  and rr.current_review_stage = 'line_manager'::public.review_stage;

grant select on public.line_manager_queue to authenticated;
