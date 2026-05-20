-- Supabase app-role table grants
-- RLS policies decide which rows authenticated users can access, but PostgreSQL
-- still requires table-level privileges before those policies are evaluated.

grant usage on schema public to authenticated;

grant select on
  public.departments,
  public.roles,
  public.users,
  public.user_identity_links,
  public.user_roles,
  public.employee_profiles,
  public.benefit_plans,
  public.employee_benefit_enrollments,
  public.reimbursement_requests,
  public.reimbursement_request_items,
  public.reimbursement_documents,
  public.reimbursement_receipts,
  public.reimbursement_decisions,
  public.reimbursement_history,
  public.notifications
to authenticated;

grant insert on
  public.reimbursement_requests,
  public.reimbursement_request_items,
  public.reimbursement_documents,
  public.reimbursement_receipts,
  public.reimbursement_decisions,
  public.reimbursement_history,
  public.notifications
to authenticated;

grant update on
  public.users,
  public.user_identity_links,
  public.user_roles,
  public.employee_profiles,
  public.employee_benefit_enrollments,
  public.reimbursement_requests,
  public.notifications
to authenticated;

grant delete on
  public.user_identity_links,
  public.user_roles,
  public.employee_profiles,
  public.employee_benefit_enrollments
to authenticated;

grant select on
  public.employee_benefit_usage,
  public.admin_department_reimbursement_summary,
  public.line_manager_queue
to authenticated;
