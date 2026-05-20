-- MedReimburse QAT Supabase schema
-- Run this first in the Supabase SQL Editor.

create extension if not exists pgcrypto;

do $$ begin
  create type public.user_status as enum ('active', 'inactive', 'suspended');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.identity_provider as enum ('supabase', 'active_directory');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.system_role as enum ('employee', 'admin');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.reimbursement_category as enum ('medicine', 'optical');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.reimbursement_status as enum ('draft', 'pending', 'approved', 'denied', 'declined', 'cancelled');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.reimbursement_document_type as enum ('prescription', 'receipt');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.decision_type as enum ('approve', 'deny', 'decline');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.review_stage as enum ('line_manager', 'admin', 'finance');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.notification_channel as enum ('in_app', 'email');
exception when duplicate_object then null;
end $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.departments (
  department_id uuid primary key default gen_random_uuid(),
  name varchar(100) not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.users (
  user_id uuid primary key default gen_random_uuid(),
  email varchar(255) not null unique,
  display_name varchar(200) not null,
  status public.user_status not null default 'active',
  last_login_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_users_status on public.users (status);

create table if not exists public.user_identity_links (
  user_identity_link_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(user_id) on delete cascade,
  identity_provider public.identity_provider not null,
  external_subject varchar(255) not null,
  external_email varchar(255) null,
  external_username varchar(255) null,
  linked_at timestamptz not null default now(),
  last_seen_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (identity_provider, external_subject)
);

create index if not exists idx_user_identity_links_user
  on public.user_identity_links (user_id);

create index if not exists idx_user_identity_links_external_email
  on public.user_identity_links (external_email);

create table if not exists public.roles (
  role_id uuid primary key default gen_random_uuid(),
  code public.system_role not null unique,
  display_name varchar(100) not null
);

create table if not exists public.user_roles (
  user_id uuid not null references public.users(user_id) on delete cascade,
  role_id uuid not null references public.roles(role_id) on delete cascade,
  assigned_at timestamptz not null default now(),
  primary key (user_id, role_id)
);

create table if not exists public.employee_profiles (
  employee_profile_id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(user_id) on delete cascade,
  employee_number varchar(50) not null unique,
  full_name varchar(200) not null,
  designation varchar(150) not null,
  department_id uuid not null references public.departments(department_id),
  is_line_manager boolean not null default false,
  line_manager_employee_profile_id uuid null references public.employee_profiles(employee_profile_id),
  employment_status public.user_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_employee_profiles_department
  on public.employee_profiles (department_id);

create index if not exists idx_employee_profiles_is_line_manager
  on public.employee_profiles (is_line_manager)
  where is_line_manager = true;

create index if not exists idx_employee_profiles_manager
  on public.employee_profiles (line_manager_employee_profile_id);

create table if not exists public.benefit_plans (
  benefit_plan_id uuid primary key default gen_random_uuid(),
  category public.reimbursement_category not null,
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

create index if not exists idx_benefit_plans_category_active
  on public.benefit_plans (category, is_active);

create table if not exists public.employee_benefit_enrollments (
  employee_benefit_enrollment_id uuid primary key default gen_random_uuid(),
  employee_profile_id uuid not null references public.employee_profiles(employee_profile_id) on delete cascade,
  benefit_plan_id uuid not null references public.benefit_plans(benefit_plan_id),
  plan_year integer not null,
  annual_limit_override numeric(12,2) null check (annual_limit_override is null or annual_limit_override >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (employee_profile_id, benefit_plan_id, plan_year)
);

create index if not exists idx_employee_benefit_enrollments_employee_year
  on public.employee_benefit_enrollments (employee_profile_id, plan_year);

create table if not exists public.reimbursement_requests (
  reimbursement_request_id uuid primary key default gen_random_uuid(),
  request_number varchar(50) not null unique,
  employee_profile_id uuid not null references public.employee_profiles(employee_profile_id),
  category public.reimbursement_category not null,
  status public.reimbursement_status not null default 'pending',
  submitted_at timestamptz not null default now(),
  employee_confirmed_at timestamptz not null default now(),
  item_subtotal_amount numeric(12,2) not null default 0 check (item_subtotal_amount >= 0),
  pwd_deduction_amount numeric(12,2) not null default 0 check (pwd_deduction_amount >= 0),
  claim_amount numeric(12,2) not null check (claim_amount > 0),
  notes text null,
  current_review_stage public.review_stage null,
  final_decided_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_request_amounts check (claim_amount = item_subtotal_amount - pwd_deduction_amount)
);

create index if not exists idx_reimbursement_requests_employee
  on public.reimbursement_requests (employee_profile_id, submitted_at desc);

create index if not exists idx_reimbursement_requests_status
  on public.reimbursement_requests (status, submitted_at desc);

create index if not exists idx_reimbursement_requests_category_status
  on public.reimbursement_requests (category, status);

create table if not exists public.reimbursement_request_items (
  reimbursement_request_item_id uuid primary key default gen_random_uuid(),
  reimbursement_request_id uuid not null references public.reimbursement_requests(reimbursement_request_id) on delete cascade,
  item_name varchar(300) not null,
  quantity numeric(12,2) not null check (quantity > 0),
  unit_price numeric(12,2) not null check (unit_price > 0),
  subtotal_amount numeric(12,2) not null check (subtotal_amount = quantity * unit_price),
  sequence_number integer not null check (sequence_number > 0),
  created_at timestamptz not null default now(),
  unique (reimbursement_request_id, sequence_number)
);

create index if not exists idx_reimbursement_request_items_request
  on public.reimbursement_request_items (reimbursement_request_id, sequence_number);

create table if not exists public.reimbursement_documents (
  reimbursement_document_id uuid primary key default gen_random_uuid(),
  reimbursement_request_id uuid not null references public.reimbursement_requests(reimbursement_request_id) on delete cascade,
  document_type public.reimbursement_document_type not null,
  file_name varchar(255) not null,
  mime_type varchar(100) not null,
  file_size_bytes integer not null check (file_size_bytes > 0 and file_size_bytes <= 10485760),
  storage_bucket varchar(100) not null default 'reimbursement-documents',
  storage_path varchar(1000) not null unique,
  checksum_sha256 varchar(64) null,
  uploaded_by_user_id uuid not null references public.users(user_id),
  uploaded_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint chk_document_mime_type check (mime_type in ('application/pdf', 'image/png', 'image/jpeg'))
);

create index if not exists idx_reimbursement_documents_request_type
  on public.reimbursement_documents (reimbursement_request_id, document_type);

create table if not exists public.reimbursement_receipts (
  reimbursement_receipt_id uuid primary key default gen_random_uuid(),
  reimbursement_request_id uuid not null references public.reimbursement_requests(reimbursement_request_id) on delete cascade,
  receipt_document_id uuid not null unique references public.reimbursement_documents(reimbursement_document_id),
  invoice_number varchar(100) not null,
  is_pwd boolean not null default false,
  vat_exemption_amount numeric(12,2) not null default 0 check (vat_exemption_amount >= 0),
  pwd_discount_amount numeric(12,2) not null default 0 check (pwd_discount_amount >= 0),
  sequence_number integer not null check (sequence_number > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (reimbursement_request_id, invoice_number),
  unique (reimbursement_request_id, sequence_number),
  constraint chk_pwd_deductions_require_pwd check (
    is_pwd = true
    or (vat_exemption_amount = 0 and pwd_discount_amount = 0)
  )
);

create index if not exists idx_reimbursement_receipts_request
  on public.reimbursement_receipts (reimbursement_request_id, sequence_number);

create index if not exists idx_reimbursement_receipts_invoice
  on public.reimbursement_receipts (invoice_number);

create table if not exists public.reimbursement_decisions (
  reimbursement_decision_id uuid primary key default gen_random_uuid(),
  reimbursement_request_id uuid not null references public.reimbursement_requests(reimbursement_request_id) on delete cascade,
  review_stage public.review_stage not null,
  decision_type public.decision_type not null,
  decision_reason_code varchar(50) null,
  decision_reason_text text null,
  decided_by_user_id uuid not null references public.users(user_id),
  decided_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint chk_negative_decision_reason check (
    decision_type = 'approve'
    or coalesce(nullif(trim(decision_reason_text), ''), decision_reason_code) is not null
  )
);

create index if not exists idx_reimbursement_decisions_request
  on public.reimbursement_decisions (reimbursement_request_id, decided_at desc);

create index if not exists idx_reimbursement_decisions_actor
  on public.reimbursement_decisions (decided_by_user_id, decided_at desc);

create table if not exists public.reimbursement_history (
  reimbursement_history_id uuid primary key default gen_random_uuid(),
  reimbursement_request_id uuid not null references public.reimbursement_requests(reimbursement_request_id) on delete cascade,
  event_type varchar(50) not null,
  previous_status public.reimbursement_status null,
  new_status public.reimbursement_status null,
  performed_by_user_id uuid not null references public.users(user_id),
  event_note text null,
  created_at timestamptz not null default now()
);

create index if not exists idx_reimbursement_history_request
  on public.reimbursement_history (reimbursement_request_id, created_at desc);

create index if not exists idx_reimbursement_history_created_at
  on public.reimbursement_history (created_at desc);

create table if not exists public.notifications (
  notification_id uuid primary key default gen_random_uuid(),
  recipient_user_id uuid not null references public.users(user_id),
  reimbursement_request_id uuid null references public.reimbursement_requests(reimbursement_request_id) on delete set null,
  notification_type varchar(50) not null,
  title varchar(200) not null,
  message text not null,
  delivery_channel public.notification_channel not null default 'in_app',
  delivered_at timestamptz null,
  read_at timestamptz null,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_recipient_unread
  on public.notifications (recipient_user_id, read_at, created_at desc);

create index if not exists idx_notifications_request
  on public.notifications (reimbursement_request_id);

drop trigger if exists set_departments_updated_at on public.departments;
create trigger set_departments_updated_at before update on public.departments
for each row execute function public.set_updated_at();

drop trigger if exists set_users_updated_at on public.users;
create trigger set_users_updated_at before update on public.users
for each row execute function public.set_updated_at();

drop trigger if exists set_user_identity_links_updated_at on public.user_identity_links;
create trigger set_user_identity_links_updated_at before update on public.user_identity_links
for each row execute function public.set_updated_at();

drop trigger if exists set_employee_profiles_updated_at on public.employee_profiles;
create trigger set_employee_profiles_updated_at before update on public.employee_profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_benefit_plans_updated_at on public.benefit_plans;
create trigger set_benefit_plans_updated_at before update on public.benefit_plans
for each row execute function public.set_updated_at();

drop trigger if exists set_employee_benefit_enrollments_updated_at on public.employee_benefit_enrollments;
create trigger set_employee_benefit_enrollments_updated_at before update on public.employee_benefit_enrollments
for each row execute function public.set_updated_at();

drop trigger if exists set_reimbursement_requests_updated_at on public.reimbursement_requests;
create trigger set_reimbursement_requests_updated_at before update on public.reimbursement_requests
for each row execute function public.set_updated_at();

drop trigger if exists set_reimbursement_receipts_updated_at on public.reimbursement_receipts;
create trigger set_reimbursement_receipts_updated_at before update on public.reimbursement_receipts
for each row execute function public.set_updated_at();

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

insert into public.benefit_plans (category, display_name, annual_limit, effective_from)
values
  ('medicine', 'Medicine Reimbursement', 10000.00, date '2026-01-01'),
  ('optical', 'Optical Reimbursement', 5000.00, date '2026-01-01')
on conflict do nothing;
