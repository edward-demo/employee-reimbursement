# Data Schema

## Purpose
Provide a relational schema baseline for the current reimbursement use cases, rules, and data model. This is a documentation schema, not an applied migration.

## Database Assumptions
- Target relational database: PostgreSQL-compatible.
- Monetary amounts use `numeric(12,2)` and Philippine Peso (`PHP`) by default.
- Identifiers use UUIDs for database keys and separate human-readable numbers for requests and employees.
- Files are stored in object storage or a document service; the database stores metadata and storage references. In Supabase QAT, document records store a private bucket name and object path.
- Reporting metrics are derived from transactional tables unless a future performance need justifies materialized views.
- QAT authentication uses Supabase Auth. The internal-site version will use Windows Active Directory.
- Application records reference internal `users.user_id` values. External identity subjects are stored in `user_identity_links` so the authentication provider can change without rewriting reimbursement, approval, document, notification, or audit records.
- Roles are additive. A user may have more than one row in `user_roles`, such as HR and Finance users who need both employee self-service access and admin reimbursement access.
- Line-manager access is a yes/no attribute on `employee_profiles`, not a role in `user_roles`.
- Reimbursement review is staged. Submitted requests start in `line_manager_review`; line-manager sign-off moves the same pending request to `hr_admin_review`; HR/Admin then approves or denies the request.

## Enumerations

```sql
create type user_status as enum ('active', 'inactive', 'suspended');
create type identity_provider as enum ('supabase', 'active_directory');
create type system_role as enum ('employee', 'admin');
create type reimbursement_category as enum ('medicine', 'optical');
create type reimbursement_status as enum ('draft', 'pending', 'approved', 'denied', 'declined', 'cancelled');
create type document_type as enum ('prescription', 'receipt');
create type decision_type as enum ('approve', 'deny', 'decline', 'sign_off');
create type reimbursement_review_stage as enum ('line_manager_review', 'hr_admin_review', 'completed');
create type notification_channel as enum ('in_app', 'email');
```

Status display mapping:

| Stored status | Current review stage | Display label |
| --- | --- | --- |
| `pending` | `line_manager_review` | Pending |
| `pending` | `hr_admin_review` | Approved by LM • Pending HR Review |
| `approved` | `completed` | Approved by HR |
| `denied` | `completed` | Denied |
| `declined` | `completed` | Denied, if the UI uses one combined employee-facing denied label |

## Reimbursement Review Stage Values

The live Supabase enum `reimbursement_review_stage` is the source of truth for `reimbursement_requests.current_review_stage`.

Use these values when filtering or updating `reimbursement_requests.current_review_stage`:

- `line_manager_review` - request is awaiting Line Manager review
- `hr_admin_review` - request has been signed off by the Line Manager and is awaiting HR/Admin review
- `completed` - request has reached a final HR/Admin decision or was declined by the Line Manager before HR/Admin review

Do not use legacy values for `current_review_stage`:

- `line_manager`
- `admin`
- `finance`

## Tables

### departments

Stores the departments used by employee scope, admin filters, and reports.

```sql
create table departments (
  department_id uuid primary key,
  name varchar(100) not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

Seed values:
- Product Development
- Finance
- HR
- Admin
- IT Helpdesk

### users

Stores internal application users. These records are the authorization, ownership, audit, and notification anchors for the reimbursement system. They are not the credential store.

```sql
create table users (
  user_id uuid primary key,
  email varchar(255) not null unique,
  display_name varchar(200) not null,
  status user_status not null default 'active',
  last_login_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_users_status on users (status);
```

### user_identity_links

Maps an internal application user to an external authentication-provider account.

In QAT, `identity_provider = 'supabase'` and `external_subject` should store the Supabase Auth user ID from `auth.users.id`.

In the internal-site version, `identity_provider = 'active_directory'` and `external_subject` should store the selected immutable Active Directory subject, such as object GUID or SID. UPN and email can change, so they should be stored as searchable attributes rather than the only stable key.

```sql
create table user_identity_links (
  user_identity_link_id uuid primary key,
  user_id uuid not null references users(user_id) on delete cascade,
  identity_provider identity_provider not null,
  external_subject varchar(255) not null,
  external_email varchar(255) null,
  external_username varchar(255) null,
  linked_at timestamptz not null default now(),
  last_seen_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (identity_provider, external_subject)
);

create index idx_user_identity_links_user
  on user_identity_links (user_id);

create index idx_user_identity_links_external_email
  on user_identity_links (external_email);
```

### roles

Stores system role definitions.

```sql
create table roles (
  role_id uuid primary key,
  code system_role not null unique,
  display_name varchar(100) not null
);
```

### user_roles

Allows a user to hold one or more roles.

Expected QAT examples:
- HR users have both `employee` and `admin`.
- Finance users have both `employee` and `admin`.
- Line managers still have `employee`; manager status is stored in `employee_profiles.is_line_manager`.

```sql
create table user_roles (
  user_id uuid not null references users(user_id),
  role_id uuid not null references roles(role_id),
  assigned_at timestamptz not null default now(),
  primary key (user_id, role_id)
);
```

### employee_profiles

Stores employee information visible in the employee profile view and used for ownership and manager scope.

```sql
create table employee_profiles (
  employee_profile_id uuid primary key,
  user_id uuid not null unique references users(user_id),
  employee_number varchar(50) not null unique,
  full_name varchar(200) not null,
  designation varchar(150) not null,
  department_id uuid not null references departments(department_id),
  is_line_manager boolean not null default false,
  line_manager_employee_profile_id uuid null references employee_profiles(employee_profile_id),
  employment_status user_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_employee_profiles_department on employee_profiles (department_id);
create index idx_employee_profiles_is_line_manager
  on employee_profiles (is_line_manager)
  where is_line_manager = true;
create index idx_employee_profiles_manager on employee_profiles (line_manager_employee_profile_id);
```

### benefit_plans

Defines reimbursement limits by category and effective period.

```sql
create table benefit_plans (
  benefit_plan_id uuid primary key,
  category reimbursement_category not null,
  display_name varchar(100) not null,
  annual_limit numeric(12,2) not null check (annual_limit >= 0),
  currency char(3) not null default 'PHP',
  effective_from date not null,
  effective_to date null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_benefit_plan_currency check (currency = 'PHP')
);

create index idx_benefit_plans_category_active on benefit_plans (category, is_active);
```

Initial defaults from current documentation:
- Medicine: PHP 10,000 annual limit
- Optical: PHP 5,000 annual limit, based on the current employee dashboard mock data

### employee_benefit_enrollments

Stores an employee's annual category entitlement.

```sql
create table employee_benefit_enrollments (
  employee_benefit_enrollment_id uuid primary key,
  employee_profile_id uuid not null references employee_profiles(employee_profile_id),
  benefit_plan_id uuid not null references benefit_plans(benefit_plan_id),
  plan_year integer not null,
  annual_limit_override numeric(12,2) null check (annual_limit_override is null or annual_limit_override >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (employee_profile_id, benefit_plan_id, plan_year)
);

create index idx_employee_benefit_enrollments_employee_year
  on employee_benefit_enrollments (employee_profile_id, plan_year);
```

### reimbursement_requests

Stores request-level details, lifecycle status, employee confirmation, and calculated totals.

```sql
create table reimbursement_requests (
  reimbursement_request_id uuid primary key,
  request_number varchar(50) not null unique,
  employee_profile_id uuid not null references employee_profiles(employee_profile_id),
  category reimbursement_category not null,
  status reimbursement_status not null default 'pending',
  submitted_at timestamptz not null default now(),
  employee_confirmed_at timestamptz not null,
  item_subtotal_amount numeric(12,2) not null default 0 check (item_subtotal_amount >= 0),
  pwd_deduction_amount numeric(12,2) not null default 0 check (pwd_deduction_amount >= 0),
  claim_amount numeric(12,2) not null check (claim_amount > 0),
  notes text null,
  current_review_stage reimbursement_review_stage not null default 'line_manager_review',
  final_decided_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_request_amounts
    check (claim_amount = item_subtotal_amount - pwd_deduction_amount)
);

create index idx_reimbursement_requests_employee
  on reimbursement_requests (employee_profile_id, submitted_at desc);

create index idx_reimbursement_requests_status
  on reimbursement_requests (status, submitted_at desc);

create index idx_reimbursement_requests_category_status
  on reimbursement_requests (category, status);

create index idx_reimbursement_requests_review_stage
  on reimbursement_requests (status, current_review_stage, submitted_at desc);
```

Implementation note: because `claim_amount` depends on child tables, production systems usually enforce the exact total through transactional application logic, database triggers, or generated rollup tables. The check above documents the invariant expected once totals are written.

### reimbursement_request_items

Stores claim line items for medicine and optical requests.

```sql
create table reimbursement_request_items (
  reimbursement_request_item_id uuid primary key,
  reimbursement_request_id uuid not null references reimbursement_requests(reimbursement_request_id) on delete cascade,
  item_name varchar(300) not null,
  quantity numeric(12,2) not null check (quantity > 0),
  unit_price numeric(12,2) not null check (unit_price > 0),
  subtotal_amount numeric(12,2) not null check (subtotal_amount = quantity * unit_price),
  sequence_number integer not null check (sequence_number > 0),
  created_at timestamptz not null default now(),
  unique (reimbursement_request_id, sequence_number)
);

create index idx_reimbursement_request_items_request
  on reimbursement_request_items (reimbursement_request_id, sequence_number);
```

### reimbursement_documents

Stores uploaded prescription and receipt file metadata.

```sql
create table reimbursement_documents (
  reimbursement_document_id uuid primary key,
  reimbursement_request_id uuid not null references reimbursement_requests(reimbursement_request_id) on delete cascade,
  document_type document_type not null,
  file_name varchar(255) not null,
  mime_type varchar(100) not null,
  file_size_bytes integer not null check (file_size_bytes > 0 and file_size_bytes <= 10485760),
  storage_bucket varchar(100) not null default 'reimbursement-documents',
  storage_path varchar(1000) not null unique,
  checksum_sha256 varchar(64) null,
  uploaded_by_user_id uuid not null references users(user_id),
  uploaded_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint chk_document_mime_type
    check (mime_type in ('application/pdf', 'image/png', 'image/jpeg'))
);

create index idx_reimbursement_documents_request_type
  on reimbursement_documents (reimbursement_request_id, document_type);
```

Business constraints to enforce in application logic or triggers:
- Each submitted request must have at least one prescription document.
- Each submitted request may have no more than three prescription documents.
- Each submitted request must have at least one receipt document.

### reimbursement_receipts

Stores receipt invoice and PWD deduction details.

```sql
create table reimbursement_receipts (
  reimbursement_receipt_id uuid primary key,
  reimbursement_request_id uuid not null references reimbursement_requests(reimbursement_request_id) on delete cascade,
  receipt_document_id uuid not null unique references reimbursement_documents(reimbursement_document_id),
  invoice_number varchar(100) not null,
  is_pwd boolean not null default false,
  vat_exemption_amount numeric(12,2) not null default 0 check (vat_exemption_amount >= 0),
  pwd_discount_amount numeric(12,2) not null default 0 check (pwd_discount_amount >= 0),
  sequence_number integer not null check (sequence_number > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (reimbursement_request_id, invoice_number),
  unique (reimbursement_request_id, sequence_number),
  constraint chk_pwd_deductions_require_pwd
    check (
      is_pwd = true
      or (vat_exemption_amount = 0 and pwd_discount_amount = 0)
    )
);

create index idx_reimbursement_receipts_request
  on reimbursement_receipts (reimbursement_request_id, sequence_number);

create index idx_reimbursement_receipts_invoice
  on reimbursement_receipts (invoice_number);
```

### reimbursement_decisions

Stores line-manager and HR/Admin decisions.

```sql
create table reimbursement_decisions (
  reimbursement_decision_id uuid primary key,
  reimbursement_request_id uuid not null references reimbursement_requests(reimbursement_request_id) on delete cascade,
  review_stage reimbursement_review_stage not null,
  decision_type decision_type not null,
  decision_reason_code varchar(50) null,
  decision_reason_text text null,
  decided_by_user_id uuid not null references users(user_id),
  decided_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint chk_negative_decision_reason
    check (
      decision_type in ('approve', 'sign_off')
      or coalesce(nullif(trim(decision_reason_text), ''), decision_reason_code) is not null
    )
);

create index idx_reimbursement_decisions_request
  on reimbursement_decisions (reimbursement_request_id, decided_at desc);

create index idx_reimbursement_decisions_actor
  on reimbursement_decisions (decided_by_user_id, decided_at desc);
```

Suggested HR/Admin denial reason codes:
- `duplicate`
- `incomplete_details`
- `others`

Line-manager decline uses free text and may leave `decision_reason_code` null.

Line-manager sign-off uses `decision_type = sign_off` and `review_stage = line_manager_review`. It is a workflow transition, not a final approval: the request remains `status = pending` and `reimbursement_requests.current_review_stage` changes to `hr_admin_review`.

HR/Admin approval uses `decision_type = approve` and `review_stage = hr_admin_review`; it is the final approval and sets `status = approved`, `current_review_stage = completed`, and `final_decided_at`.

HR/Admin denial uses `decision_type = deny` and `review_stage = hr_admin_review`; it is the final denial and sets `status = denied`, `current_review_stage = completed`, and `final_decided_at`.

Line-manager decline uses `decision_type = decline` and `review_stage = line_manager_review`; it denies the request before HR/Admin review and sets `status = declined`, `current_review_stage = completed`, and `final_decided_at`.

### reimbursement_history

Stores an immutable audit trail of important request events.

```sql
create table reimbursement_history (
  reimbursement_history_id uuid primary key,
  reimbursement_request_id uuid not null references reimbursement_requests(reimbursement_request_id) on delete cascade,
  event_type varchar(50) not null,
  previous_status reimbursement_status null,
  new_status reimbursement_status null,
  performed_by_user_id uuid not null references users(user_id),
  event_note text null,
  created_at timestamptz not null default now()
);

create index idx_reimbursement_history_request
  on reimbursement_history (reimbursement_request_id, created_at desc);

create index idx_reimbursement_history_created_at
  on reimbursement_history (created_at desc);
```

Suggested event types:
- `submitted`
- `approved`
- `denied`
- `declined`
- `status_changed`
- `document_uploaded`
- `request_updated`

### notifications

Stores in-app notifications and future email delivery records.

```sql
create table notifications (
  notification_id uuid primary key,
  recipient_user_id uuid not null references users(user_id),
  reimbursement_request_id uuid null references reimbursement_requests(reimbursement_request_id) on delete set null,
  notification_type varchar(50) not null,
  title varchar(200) not null,
  message text not null,
  delivery_channel notification_channel not null default 'in_app',
  delivered_at timestamptz null,
  read_at timestamptz null,
  created_at timestamptz not null default now()
);

create index idx_notifications_recipient_unread
  on notifications (recipient_user_id, read_at, created_at desc);

create index idx_notifications_request
  on notifications (reimbursement_request_id);
```

## Derived Views

### employee_benefit_usage

Supports employee dashboard balances.

```sql
create view employee_benefit_usage as
select
  ebe.employee_profile_id,
  bp.category,
  ebe.plan_year,
  coalesce(ebe.annual_limit_override, bp.annual_limit) as annual_limit,
  coalesce(sum(rr.claim_amount) filter (where rr.status = 'approved'), 0) as approved_amount,
  coalesce(sum(rr.claim_amount) filter (where rr.status = 'pending'), 0) as pending_amount,
  coalesce(ebe.annual_limit_override, bp.annual_limit)
    - coalesce(sum(rr.claim_amount) filter (where rr.status = 'approved'), 0) as remaining_amount
from employee_benefit_enrollments ebe
join benefit_plans bp on bp.benefit_plan_id = ebe.benefit_plan_id
left join reimbursement_requests rr
  on rr.employee_profile_id = ebe.employee_profile_id
  and rr.category = bp.category
  and extract(year from rr.submitted_at)::integer = ebe.plan_year
group by
  ebe.employee_profile_id,
  bp.category,
  ebe.plan_year,
  ebe.annual_limit_override,
  bp.annual_limit;
```

### admin_department_reimbursement_summary

Supports admin reporting by department and category.

```sql
create view admin_department_reimbursement_summary as
select
  d.department_id,
  d.name as department_name,
  rr.category,
  count(*) filter (where rr.status = 'approved') as approved_count,
  count(*) filter (where rr.status = 'pending') as pending_count,
  count(*) filter (where rr.status in ('denied', 'declined')) as rejected_count,
  coalesce(sum(rr.claim_amount) filter (where rr.status = 'approved'), 0) as approved_amount
from departments d
join employee_profiles ep on ep.department_id = d.department_id
join reimbursement_requests rr on rr.employee_profile_id = ep.employee_profile_id
group by d.department_id, d.name, rr.category;
```

### line_manager_queue

Supports line-manager scope, search, status filtering, pending amount, and urgency labels.

```sql
create view line_manager_queue as
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
from employee_profiles manager
join employee_profiles employee
  on employee.line_manager_employee_profile_id = manager.employee_profile_id
join reimbursement_requests rr
  on rr.employee_profile_id = employee.employee_profile_id
where manager.is_line_manager = true
  and rr.status = 'pending'
  and rr.current_review_stage = 'line_manager_review';
```

## Integrity Rules

Application logic, service transactions, or database triggers should enforce these cross-table rules:

- Every signed-in user must resolve from the active authentication provider to exactly one internal `users` record before accessing reimbursement data.
- Supabase Auth is the QAT credential and session source; Windows Active Directory is the planned internal-site credential and session source.
- Authorization decisions must use internal roles, employee profile ownership, and manager scope after authentication succeeds.
- A submitted request must contain at least one line item.
- A submitted request must contain at least one and no more than three prescription documents.
- A submitted request must contain at least one receipt and every receipt must have an invoice number.
- Every `reimbursement_receipts.receipt_document_id` must point to a `reimbursement_documents` row where `document_type = 'receipt'`.
- `item_subtotal_amount`, `pwd_deduction_amount`, and `claim_amount` must match child item and receipt totals.
- Only approved requests consume employee benefit balance.
- New submitted requests start as `status = pending` and `current_review_stage = line_manager_review`.
- Line-manager sign-off inserts a `reimbursement_decisions` row with `decision_type = sign_off` and `review_stage = line_manager_review`.
- Line-manager sign-off keeps `status = pending` and changes `current_review_stage` to `hr_admin_review`.
- HR/Admin approval sets `status = approved` and `current_review_stage = completed`.
- HR/Admin denial sets `status = denied` and `current_review_stage = completed`.
- Line-manager decline sets `status = declined` and `current_review_stage = completed`.
- HR/Admin approve or deny actions require prior line-manager sign-off, represented by `current_review_stage = hr_admin_review`.
- Closed requests should not accept sign-off, approve, deny, or decline decisions unless a future reopen workflow is defined.
- Employees can access only their own request records.
- Line managers can access only requests for employees in their team scope.
- Admins can access request lists, details, reports, and decision actions.

## Open Schema Questions
- Should the first implementation use UUID keys, human-readable string keys, or both?
- Which Active Directory subject should be stored in `user_identity_links.external_subject` for production: object GUID, SID, or another immutable claim?
- Should prescription documents be linked directly to the request only, or can a future receipt or item require its own prescription association?
- Should payment processing add `payments` and `payment_batches` tables in the next phase?
- Should duplicate invoice detection remain per request or become employee-wide, vendor-wide, or global?
