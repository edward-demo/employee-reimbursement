-- MedReimburse QAT row-level security and helper functions
-- Run this after 202605190001_initial_schema.sql.

create or replace function public.current_app_user_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select uil.user_id
  from public.user_identity_links uil
  where uil.identity_provider = 'supabase'
    and uil.external_subject = auth.uid()::text
  limit 1
$$;

create or replace function public.current_employee_profile_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select ep.employee_profile_id
  from public.employee_profiles ep
  where ep.user_id = public.current_app_user_id()
  limit 1
$$;

create or replace function public.has_role(target_role public.system_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.role_id = ur.role_id
    where ur.user_id = public.current_app_user_id()
      and r.code = target_role
  )
$$;

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
      public.has_role('line_manager')
      and exists (
        select 1
        from public.employee_profiles manager
        join public.employee_profiles employee
          on employee.employee_profile_id = target_employee_profile_id
        where manager.employee_profile_id = public.current_employee_profile_id()
          and (
            employee.line_manager_employee_profile_id = manager.employee_profile_id
            or employee.department_id = manager.department_id
          )
      )
    )
$$;

create or replace function public.can_access_reimbursement_request(target_reimbursement_request_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.reimbursement_requests rr
    where rr.reimbursement_request_id = target_reimbursement_request_id
      and public.can_access_employee_profile(rr.employee_profile_id)
  )
$$;

create or replace function public.ensure_current_supabase_user(p_display_name text default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_auth_subject text := auth.uid()::text;
  v_email text := lower(nullif(auth.jwt() ->> 'email', ''));
  v_display_name text;
  v_user_id uuid;
begin
  if v_auth_subject is null then
    raise exception 'No authenticated Supabase user is available';
  end if;

  select user_id
  into v_user_id
  from public.user_identity_links
  where identity_provider = 'supabase'
    and external_subject = v_auth_subject
  limit 1;

  if v_user_id is not null then
    update public.user_identity_links
    set last_seen_at = now(),
        external_email = coalesce(v_email, external_email)
    where identity_provider = 'supabase'
      and external_subject = v_auth_subject;

    update public.users
    set last_login_at = now()
    where user_id = v_user_id;

    return v_user_id;
  end if;

  if v_email is null then
    raise exception 'Authenticated Supabase user has no email claim';
  end if;

  v_display_name := coalesce(nullif(trim(p_display_name), ''), split_part(v_email, '@', 1));

  insert into public.users (email, display_name, last_login_at)
  values (v_email, v_display_name, now())
  on conflict (email) do update
    set display_name = coalesce(public.users.display_name, excluded.display_name),
        last_login_at = now()
  returning user_id into v_user_id;

  insert into public.user_identity_links (
    user_id,
    identity_provider,
    external_subject,
    external_email,
    external_username,
    last_seen_at
  )
  values (
    v_user_id,
    'supabase',
    v_auth_subject,
    v_email,
    v_email,
    now()
  )
  on conflict (identity_provider, external_subject) do update
    set user_id = excluded.user_id,
        external_email = excluded.external_email,
        external_username = excluded.external_username,
        last_seen_at = now();

  return v_user_id;
end;
$$;

grant execute on function public.current_app_user_id() to authenticated;
grant execute on function public.current_employee_profile_id() to authenticated;
grant execute on function public.has_role(public.system_role) to authenticated;
grant execute on function public.can_access_employee_profile(uuid) to authenticated;
grant execute on function public.can_access_reimbursement_request(uuid) to authenticated;
grant execute on function public.ensure_current_supabase_user(text) to authenticated;

alter table public.departments enable row level security;
alter table public.users enable row level security;
alter table public.user_identity_links enable row level security;
alter table public.roles enable row level security;
alter table public.user_roles enable row level security;
alter table public.employee_profiles enable row level security;
alter table public.benefit_plans enable row level security;
alter table public.employee_benefit_enrollments enable row level security;
alter table public.reimbursement_requests enable row level security;
alter table public.reimbursement_request_items enable row level security;
alter table public.reimbursement_documents enable row level security;
alter table public.reimbursement_receipts enable row level security;
alter table public.reimbursement_decisions enable row level security;
alter table public.reimbursement_history enable row level security;
alter table public.notifications enable row level security;

drop policy if exists "Authenticated users can read departments" on public.departments;
create policy "Authenticated users can read departments"
on public.departments for select
to authenticated
using (true);

drop policy if exists "Users can read own internal user or admins can read all" on public.users;
create policy "Users can read own internal user or admins can read all"
on public.users for select
to authenticated
using (user_id = public.current_app_user_id() or public.has_role('admin'));

drop policy if exists "Users can update own display details or admins can update all" on public.users;
create policy "Users can update own display details or admins can update all"
on public.users for update
to authenticated
using (user_id = public.current_app_user_id() or public.has_role('admin'))
with check (user_id = public.current_app_user_id() or public.has_role('admin'));

drop policy if exists "Users can read own identity links or admins can read all" on public.user_identity_links;
create policy "Users can read own identity links or admins can read all"
on public.user_identity_links for select
to authenticated
using (user_id = public.current_app_user_id() or public.has_role('admin'));

drop policy if exists "Admins can manage identity links" on public.user_identity_links;
create policy "Admins can manage identity links"
on public.user_identity_links for all
to authenticated
using (public.has_role('admin'))
with check (public.has_role('admin'));

drop policy if exists "Authenticated users can read roles" on public.roles;
create policy "Authenticated users can read roles"
on public.roles for select
to authenticated
using (true);

drop policy if exists "Users can read own role assignments or admins can read all" on public.user_roles;
create policy "Users can read own role assignments or admins can read all"
on public.user_roles for select
to authenticated
using (user_id = public.current_app_user_id() or public.has_role('admin'));

drop policy if exists "Admins can manage role assignments" on public.user_roles;
create policy "Admins can manage role assignments"
on public.user_roles for all
to authenticated
using (public.has_role('admin'))
with check (public.has_role('admin'));

drop policy if exists "Users can read accessible employee profiles" on public.employee_profiles;
create policy "Users can read accessible employee profiles"
on public.employee_profiles for select
to authenticated
using (public.can_access_employee_profile(employee_profile_id));

drop policy if exists "Admins can manage employee profiles" on public.employee_profiles;
create policy "Admins can manage employee profiles"
on public.employee_profiles for all
to authenticated
using (public.has_role('admin'))
with check (public.has_role('admin'));

drop policy if exists "Authenticated users can read benefit plans" on public.benefit_plans;
create policy "Authenticated users can read benefit plans"
on public.benefit_plans for select
to authenticated
using (true);

drop policy if exists "Users can read accessible benefit enrollments" on public.employee_benefit_enrollments;
create policy "Users can read accessible benefit enrollments"
on public.employee_benefit_enrollments for select
to authenticated
using (public.can_access_employee_profile(employee_profile_id));

drop policy if exists "Admins can manage benefit enrollments" on public.employee_benefit_enrollments;
create policy "Admins can manage benefit enrollments"
on public.employee_benefit_enrollments for all
to authenticated
using (public.has_role('admin'))
with check (public.has_role('admin'));

drop policy if exists "Users can read accessible reimbursement requests" on public.reimbursement_requests;
create policy "Users can read accessible reimbursement requests"
on public.reimbursement_requests for select
to authenticated
using (public.can_access_employee_profile(employee_profile_id));

drop policy if exists "Employees can create own reimbursement requests" on public.reimbursement_requests;
create policy "Employees can create own reimbursement requests"
on public.reimbursement_requests for insert
to authenticated
with check (
  employee_profile_id = public.current_employee_profile_id()
  and status in ('draft', 'pending')
);

drop policy if exists "Admins and line managers can update accessible reimbursement requests" on public.reimbursement_requests;
create policy "Admins and line managers can update accessible reimbursement requests"
on public.reimbursement_requests for update
to authenticated
using (
  public.has_role('admin')
  or (public.has_role('line_manager') and public.can_access_employee_profile(employee_profile_id))
)
with check (
  public.has_role('admin')
  or (public.has_role('line_manager') and public.can_access_employee_profile(employee_profile_id))
);

drop policy if exists "Users can read accessible request items" on public.reimbursement_request_items;
create policy "Users can read accessible request items"
on public.reimbursement_request_items for select
to authenticated
using (public.can_access_reimbursement_request(reimbursement_request_id));

drop policy if exists "Employees can insert items on own requests" on public.reimbursement_request_items;
create policy "Employees can insert items on own requests"
on public.reimbursement_request_items for insert
to authenticated
with check (
  exists (
    select 1
    from public.reimbursement_requests rr
    where rr.reimbursement_request_id = public.reimbursement_request_items.reimbursement_request_id
      and rr.employee_profile_id = public.current_employee_profile_id()
      and rr.status in ('draft', 'pending')
  )
);

drop policy if exists "Users can read accessible documents" on public.reimbursement_documents;
create policy "Users can read accessible documents"
on public.reimbursement_documents for select
to authenticated
using (public.can_access_reimbursement_request(reimbursement_request_id));

drop policy if exists "Employees can insert documents on own requests" on public.reimbursement_documents;
create policy "Employees can insert documents on own requests"
on public.reimbursement_documents for insert
to authenticated
with check (
  uploaded_by_user_id = public.current_app_user_id()
  and exists (
    select 1
    from public.reimbursement_requests rr
    where rr.reimbursement_request_id = public.reimbursement_documents.reimbursement_request_id
      and rr.employee_profile_id = public.current_employee_profile_id()
      and rr.status in ('draft', 'pending')
  )
);

drop policy if exists "Users can read accessible receipts" on public.reimbursement_receipts;
create policy "Users can read accessible receipts"
on public.reimbursement_receipts for select
to authenticated
using (public.can_access_reimbursement_request(reimbursement_request_id));

drop policy if exists "Employees can insert receipts on own requests" on public.reimbursement_receipts;
create policy "Employees can insert receipts on own requests"
on public.reimbursement_receipts for insert
to authenticated
with check (
  exists (
    select 1
    from public.reimbursement_requests rr
    where rr.reimbursement_request_id = public.reimbursement_receipts.reimbursement_request_id
      and rr.employee_profile_id = public.current_employee_profile_id()
      and rr.status in ('draft', 'pending')
  )
);

drop policy if exists "Users can read accessible decisions" on public.reimbursement_decisions;
create policy "Users can read accessible decisions"
on public.reimbursement_decisions for select
to authenticated
using (public.can_access_reimbursement_request(reimbursement_request_id));

drop policy if exists "Admins and line managers can insert decisions" on public.reimbursement_decisions;
create policy "Admins and line managers can insert decisions"
on public.reimbursement_decisions for insert
to authenticated
with check (
  decided_by_user_id = public.current_app_user_id()
  and public.can_access_reimbursement_request(reimbursement_request_id)
  and (
    public.has_role('admin')
    or public.has_role('line_manager')
  )
);

drop policy if exists "Users can read accessible history" on public.reimbursement_history;
create policy "Users can read accessible history"
on public.reimbursement_history for select
to authenticated
using (public.can_access_reimbursement_request(reimbursement_request_id));

drop policy if exists "Authenticated actors can insert history for accessible requests" on public.reimbursement_history;
create policy "Authenticated actors can insert history for accessible requests"
on public.reimbursement_history for insert
to authenticated
with check (
  performed_by_user_id = public.current_app_user_id()
  and public.can_access_reimbursement_request(reimbursement_request_id)
);

drop policy if exists "Users can read own notifications or admins can read all" on public.notifications;
create policy "Users can read own notifications or admins can read all"
on public.notifications for select
to authenticated
using (recipient_user_id = public.current_app_user_id() or public.has_role('admin'));

drop policy if exists "Users can update own notifications" on public.notifications;
create policy "Users can update own notifications"
on public.notifications for update
to authenticated
using (recipient_user_id = public.current_app_user_id() or public.has_role('admin'))
with check (recipient_user_id = public.current_app_user_id() or public.has_role('admin'));

drop policy if exists "Admins can insert notifications" on public.notifications;
create policy "Admins can insert notifications"
on public.notifications for insert
to authenticated
with check (public.has_role('admin'));

create or replace view public.employee_benefit_usage
with (security_invoker = on) as
select
  ebe.employee_profile_id,
  bp.category,
  ebe.plan_year,
  coalesce(ebe.annual_limit_override, bp.annual_limit) as annual_limit,
  coalesce(sum(rr.claim_amount) filter (where rr.status = 'approved'), 0) as approved_amount,
  coalesce(sum(rr.claim_amount) filter (where rr.status = 'pending'), 0) as pending_amount,
  coalesce(ebe.annual_limit_override, bp.annual_limit)
    - coalesce(sum(rr.claim_amount) filter (where rr.status = 'approved'), 0) as remaining_amount
from public.employee_benefit_enrollments ebe
join public.benefit_plans bp on bp.benefit_plan_id = ebe.benefit_plan_id
left join public.reimbursement_requests rr
  on rr.employee_profile_id = ebe.employee_profile_id
  and rr.category = bp.category
  and extract(year from rr.submitted_at)::integer = ebe.plan_year
group by
  ebe.employee_profile_id,
  bp.category,
  ebe.plan_year,
  ebe.annual_limit_override,
  bp.annual_limit;

create or replace view public.admin_department_reimbursement_summary
with (security_invoker = on) as
select
  d.department_id,
  d.name as department_name,
  rr.category,
  count(*) filter (where rr.status = 'approved') as approved_count,
  count(*) filter (where rr.status = 'pending') as pending_count,
  count(*) filter (where rr.status in ('denied', 'declined')) as rejected_count,
  coalesce(sum(rr.claim_amount) filter (where rr.status = 'approved'), 0) as approved_amount
from public.departments d
join public.employee_profiles ep on ep.department_id = d.department_id
join public.reimbursement_requests rr on rr.employee_profile_id = ep.employee_profile_id
group by d.department_id, d.name, rr.category;

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
  rr.submitted_at,
  rr.claim_amount,
  extract(day from now() - rr.submitted_at)::integer as days_pending
from public.employee_profiles manager
join public.employee_profiles employee
  on employee.line_manager_employee_profile_id = manager.employee_profile_id
join public.reimbursement_requests rr
  on rr.employee_profile_id = employee.employee_profile_id;
