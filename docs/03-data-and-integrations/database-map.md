# Database Map

## Purpose
Use this file as a quick navigation map before writing code, queries, policies, or migrations.

This is not the full schema reference. For detailed columns, constraints, indexes, and views, use:
- `docs/03-data-and-integrations/data-model.md`
- `docs/03-data-and-integrations/schema.md`
- `supabase/migrations/*`

## Working Rule
For every task, identify the 3-5 relevant tables or views first before writing code or SQL.

Do not inspect unrelated tables unless the task explicitly requires them.

When in doubt, start from the user journey or use case:
- login and portal routing
- employee profile and benefit balance
- request submission
- document upload and receipt details
- line-manager review
- HR/Admin review
- reporting or dashboard metrics

## Authentication and Authorization

### auth.users
Supabase-managed authentication users.

Use this only for QAT login identity, email, and Supabase Auth UID. Do not anchor business records directly to `auth.users`.

### public.users
Internal application user.

Use this as the stable authorization, ownership, notification, decision, and audit actor record.

### public.user_identity_links
Maps an external identity provider user to `public.users`.

In QAT, `identity_provider = 'supabase'` and `external_subject` maps to `auth.users.id`.

Use this when resolving the signed-in Supabase user to the internal app user.

### public.roles
Role definitions.

Current role codes:
- `employee`
- `admin`

### public.user_roles
Assigned application roles per internal user.

Use this for Employee/Admin access. HR and Finance users are currently represented through admin-style access, not separate role codes.

### public.employee_profiles
Employee-specific profile and manager-scope data.

Use this for employee number, full name, designation, department, employment status, line-manager flag, and direct manager relationship.

Line-manager access is stored here through `is_line_manager`, not in `public.user_roles`.

## Organization and Benefits

### public.departments
Supported organization departments.

Use this for employee profile department membership, admin filters, and department-level reporting.

### public.benefit_plans
Benefit category definitions and annual limits.

Current seeded defaults:
- Medicine Reimbursement: PHP 10,000 annual limit
- Optical Reimbursement: PHP 5,000 annual limit

### public.employee_benefit_enrollments
Employee-specific enrollment record for annual benefit entitlement.

Use this to confirm that an employee is enrolled in a benefit plan for a plan year.

Current rule:
- All employees use the standard benefit plan annual limits.
- Medicine Reimbursement uses the standard PHP 10,000 annual limit.
- Optical Reimbursement uses the standard PHP 5,000 annual limit.
- Do not use or populate `annual_limit_override` unless a future requirement explicitly introduces employee-specific limits.

### public.employee_benefit_usage
Derived view for employee benefit balances.

Use this for dashboard-style balance reads before manually joining enrollments, plans, and requests.

## Reimbursement Requests

### public.reimbursement_requests
Main reimbursement request header.

Use this for request number, employee owner, category, status, submitted date, totals, current review stage, and final decision timestamp.

Current request categories:
- `medicine`
- `optical`

Current request statuses:
- `draft`
- `pending`
- `approved`
- `denied`
- `declined`
- `cancelled`

Current review stages:
- `line_manager_review`
- `hr_admin_review`
- `completed`

`docs/03-data-and-integrations/schema.md` is the authoritative source for the live Supabase `reimbursement_review_stage` enum used by `reimbursement_requests.current_review_stage`. Do not use legacy values such as `line_manager`, `admin`, or `finance` for `current_review_stage`.

Display labels should be derived from `status` plus `current_review_stage`; do not create a separate database status for `Approved by LM • Pending HR Review`.

Common display mapping:
- `status = pending` and `current_review_stage = line_manager_review`: Pending
- `status = pending` and `current_review_stage = hr_admin_review`: Approved by LM • Pending HR Review
- `status = approved` and `current_review_stage = completed`: Approved by HR
- `status = denied` and `current_review_stage = completed`: Denied
- `status = declined` and `current_review_stage = completed`: Denied, if the UI uses one combined employee-facing denied label

### public.reimbursement_request_items
Line items under a reimbursement request.

Use this for medicine or optical item name, quantity, unit price, subtotal, and line sequence.

### public.reimbursement_documents
Uploaded document metadata.

Use this for prescription and receipt files, storage bucket/path, MIME type, uploader, and upload timestamp.

Files themselves live in storage; this table stores metadata and references.

### public.reimbursement_receipts
Receipt-specific details.

Use this for invoice numbers, receipt sequence, PWD flag, VAT exemption amount, and PWD discount amount.

Use `reimbursement_documents` for the uploaded receipt file metadata.

## Workflow, Decisions, and Audit

### public.reimbursement_decisions
Sign-off, approval, denial, or decline decision records.

Use this for line-manager decisions, HR/Admin decisions, decision reasons, actor user, and decision timestamp.

Line-manager sign-off inserts `decision_type = sign_off` with `review_stage = line_manager_review`; it keeps the request `pending` and moves `reimbursement_requests.current_review_stage` to `hr_admin_review`.

Line-manager decline inserts `decision_type = decline` with `review_stage = line_manager_review`; it sets `reimbursement_requests.status = declined`, `current_review_stage = completed`, and `final_decided_at`.

HR/Admin approval inserts `decision_type = approve` with `review_stage = hr_admin_review`; it sets `reimbursement_requests.status = approved`, `current_review_stage = completed`, and `final_decided_at`.

HR/Admin denial inserts `decision_type = deny` with `review_stage = hr_admin_review`; it sets `reimbursement_requests.status = denied`, `current_review_stage = completed`, and `final_decided_at`.

Workflow action table map:

| Workflow action | Request table update | Decision table insert |
| --- | --- | --- |
| Line Manager sign-off | `public.reimbursement_requests.status = pending`; `current_review_stage = hr_admin_review` | `public.reimbursement_decisions.decision_type = sign_off`; `review_stage = line_manager_review` |
| Line Manager decline | `public.reimbursement_requests.status = declined`; `current_review_stage = completed`; set `final_decided_at` | `public.reimbursement_decisions.decision_type = decline`; `review_stage = line_manager_review` |
| HR/Admin approval | `public.reimbursement_requests.status = approved`; `current_review_stage = completed`; set `final_decided_at` | `public.reimbursement_decisions.decision_type = approve`; `review_stage = hr_admin_review` |
| HR/Admin denial | `public.reimbursement_requests.status = denied`; `current_review_stage = completed`; set `final_decided_at` | `public.reimbursement_decisions.decision_type = deny`; `review_stage = hr_admin_review` |

### public.reimbursement_history
Immutable request event history.

Use this for submission, status changes, document uploads, request updates, and other audit-style timeline events.

### public.notifications
In-app notification and future email delivery records.

Use this for notification recipient, related reimbursement request, message content, delivery channel, delivery timestamp, and read timestamp.

## Reporting and Queues

### public.admin_department_reimbursement_summary
Derived view for admin reporting by department and category.

Use this for department-level approved, pending, rejected, and approved amount metrics.

### public.line_manager_queue
Derived view for line-manager sign-off and decline queues.

Use this for pending team requests scoped to a line manager.

## Common Task Starting Points

### Login and portal routing
Start with:
- `auth.users`
- `public.user_identity_links`
- `public.users`
- `public.user_roles`
- `public.employee_profiles`

### Employee profile screen
Start with:
- `public.users`
- `public.employee_profiles`
- `public.departments`
- `public.user_roles`

### Employee benefit dashboard
Start with:
- `public.employee_profiles`
- `public.employee_benefit_usage`
- `public.benefit_plans`
- `public.employee_benefit_enrollments`
- `public.reimbursement_requests`

### Submit a reimbursement request
Start with:
- `public.employee_profiles`
- `public.reimbursement_requests`
- `public.reimbursement_request_items`
- `public.reimbursement_documents`
- `public.reimbursement_receipts`

### Upload or inspect request documents
Start with:
- `public.reimbursement_requests`
- `public.reimbursement_documents`
- `public.reimbursement_receipts`
- `public.users`

### Line-manager review
Start with:
- `public.line_manager_queue`
- `public.employee_profiles`
- `public.reimbursement_requests`
- `public.reimbursement_decisions`
- `public.reimbursement_history`

### Admin request review
Start with:
- `public.user_roles`
- `public.reimbursement_requests`
- `public.reimbursement_request_items`
- `public.reimbursement_documents`
- `public.reimbursement_decisions`

### Admin reporting
Start with:
- `public.admin_department_reimbursement_summary`
- `public.departments`
- `public.employee_profiles`
- `public.reimbursement_requests`
- `public.benefit_plans`

### Notifications
Start with:
- `public.notifications`
- `public.users`
- `public.reimbursement_requests`

## Tables to Avoid Unless Needed
Avoid reading or changing unrelated migration support objects, seed scripts, or historical archive documents unless the task is specifically about:
- schema evolution
- seed data
- RLS or grants
- production migration behavior
- historical requirement comparison

## Naming Notes
The detailed documentation may describe business concepts using generic names such as users, roles, documents, or decisions. In SQL and application code, prefer the actual database names with schema prefixes where helpful, such as `public.reimbursement_requests`.

Business records should reference `public.users.user_id`, not `auth.users.id`, unless the task is specifically about authentication identity mapping.
