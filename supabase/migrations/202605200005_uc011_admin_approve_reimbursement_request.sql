-- UC-011: Admin approves a pending reimbursement request after line-manager sign-off.

create or replace view public.admin_review_queue
with (security_invoker = on) as
select
  rr.reimbursement_request_id,
  rr.request_number,
  rr.employee_profile_id,
  employee.full_name as employee_name,
  employee.employee_number,
  employee.designation,
  employee_user.email as employee_email,
  d.name as department_name,
  rr.category,
  rr.status,
  rr.current_review_stage,
  rr.submitted_at,
  rr.claim_amount,
  lm_approval.decided_at as line_manager_approved_at,
  lm_approval.decided_by_user_id as line_manager_user_id,
  line_manager_user.display_name as line_manager_name,
  line_manager_user.email as line_manager_email
from public.reimbursement_requests rr
join public.employee_profiles employee
  on employee.employee_profile_id = rr.employee_profile_id
join public.users employee_user
  on employee_user.user_id = employee.user_id
join public.departments d
  on d.department_id = employee.department_id
join lateral (
  select rd.decided_at, rd.decided_by_user_id
  from public.reimbursement_decisions rd
  where rd.reimbursement_request_id = rr.reimbursement_request_id
    and rd.review_stage = 'line_manager'::public.review_stage
    and rd.decision_type = 'approve'::public.decision_type
  order by rd.decided_at desc
  limit 1
) lm_approval on true
join public.users line_manager_user
  on line_manager_user.user_id = lm_approval.decided_by_user_id
where rr.status = 'pending'::public.reimbursement_status
  and rr.current_review_stage = 'admin'::public.review_stage;

grant select on public.admin_review_queue to authenticated;

create or replace function public.admin_approve_reimbursement_request(
  p_reimbursement_request_id uuid,
  p_remarks text default null
)
returns table (
  reimbursement_request_id uuid,
  request_number varchar,
  status public.reimbursement_status,
  current_review_stage public.review_stage,
  final_decided_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_user_id uuid;
  v_request record;
begin
  v_actor_user_id := public.current_app_user_id();

  if v_actor_user_id is null then
    raise exception 'No internal user is linked to the current authenticated identity.'
      using errcode = '28000';
  end if;

  if not public.has_role('admin'::public.system_role) then
    raise exception 'Admin role is required to approve reimbursement requests.'
      using errcode = '42501';
  end if;

  select rr.*
  into v_request
  from public.reimbursement_requests rr
  where rr.reimbursement_request_id = p_reimbursement_request_id
  for update;

  if not found then
    raise exception 'Reimbursement request was not found.'
      using errcode = 'P0002';
  end if;

  if v_request.status <> 'pending'::public.reimbursement_status then
    raise exception 'Only pending reimbursement requests can be approved.'
      using errcode = 'P0001';
  end if;

  if v_request.current_review_stage <> 'admin'::public.review_stage then
    raise exception 'HR/Admin approval requires prior line-manager sign-off.'
      using errcode = 'P0001';
  end if;

  if not exists (
    select 1
    from public.reimbursement_decisions rd
    where rd.reimbursement_request_id = p_reimbursement_request_id
      and rd.review_stage = 'line_manager'::public.review_stage
      and rd.decision_type = 'approve'::public.decision_type
  ) then
    raise exception 'No line-manager approval decision exists for this request.'
      using errcode = 'P0001';
  end if;

  insert into public.reimbursement_decisions (
    reimbursement_request_id,
    review_stage,
    decision_type,
    decision_reason_text,
    decided_by_user_id
  )
  values (
    p_reimbursement_request_id,
    'admin'::public.review_stage,
    'approve'::public.decision_type,
    nullif(trim(p_remarks), ''),
    v_actor_user_id
  );

  update public.reimbursement_requests rr
  set status = 'approved'::public.reimbursement_status,
      final_decided_at = now(),
      updated_at = now()
  where rr.reimbursement_request_id = p_reimbursement_request_id
  returning rr.*
  into v_request;

  insert into public.reimbursement_history (
    reimbursement_request_id,
    event_type,
    previous_status,
    new_status,
    performed_by_user_id,
    event_note
  )
  values (
    p_reimbursement_request_id,
    'admin_approved',
    'pending'::public.reimbursement_status,
    'approved'::public.reimbursement_status,
    v_actor_user_id,
    nullif(trim(p_remarks), '')
  );

  return query
  select
    v_request.reimbursement_request_id,
    v_request.request_number,
    v_request.status,
    v_request.current_review_stage,
    v_request.final_decided_at;
end;
$$;

grant execute on function public.admin_approve_reimbursement_request(uuid, text) to authenticated;
