-- Generate human-readable reimbursement request reference numbers.
-- Internal identity remains reimbursement_request_id (uuid primary key).

alter table public.reimbursement_requests
  add column if not exists request_reference_number text;

alter table public.reimbursement_requests
  alter column request_number set default ('LEGACY-' || gen_random_uuid()::text);

create table if not exists public.reimbursement_request_reference_counters (
  reference_year integer primary key,
  last_value integer not null check (last_value >= 0),
  updated_at timestamptz not null default now()
);

create or replace function public.assign_reimbursement_request_reference_number()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_reference_year integer;
  v_next_value integer;
begin
  v_reference_year := extract(year from coalesce(new.submitted_at, now()))::integer;

  insert into public.reimbursement_request_reference_counters as counters (
    reference_year,
    last_value,
    updated_at
  )
  values (
    v_reference_year,
    1,
    now()
  )
  on conflict (reference_year) do update
    set last_value = counters.last_value + 1,
        updated_at = now()
  returning last_value into v_next_value;

  new.request_reference_number := 'REQ-' || v_reference_year || '-' || lpad(v_next_value::text, 4, '0');

  return new;
end;
$$;

with numbered_requests as (
  select
    reimbursement_request_id,
    extract(year from coalesce(submitted_at, now()))::integer as reference_year,
    row_number() over (
      partition by extract(year from coalesce(submitted_at, now()))::integer
      order by submitted_at, created_at, reimbursement_request_id
    ) as sequence_number
  from public.reimbursement_requests
  where request_reference_number is null
)
update public.reimbursement_requests rr
set request_reference_number = 'REQ-'
  || numbered.reference_year
  || '-'
  || lpad(numbered.sequence_number::text, 4, '0')
from numbered_requests numbered
where rr.reimbursement_request_id = numbered.reimbursement_request_id;

insert into public.reimbursement_request_reference_counters (
  reference_year,
  last_value,
  updated_at
)
select
  extract(year from coalesce(submitted_at, now()))::integer as reference_year,
  count(*)::integer as last_value,
  now()
from public.reimbursement_requests
group by extract(year from coalesce(submitted_at, now()))::integer
on conflict (reference_year) do update
  set last_value = greatest(
        public.reimbursement_request_reference_counters.last_value,
        excluded.last_value
      ),
      updated_at = now();

alter table public.reimbursement_requests
  alter column request_reference_number set not null;

alter table public.reimbursement_requests
  add constraint reimbursement_requests_reference_number_format
  check (request_reference_number ~ '^REQ-[0-9]{4}-[0-9]{4}$');

create unique index if not exists reimbursement_requests_request_reference_number_key
  on public.reimbursement_requests (request_reference_number);

drop trigger if exists set_reimbursement_request_reference_number
  on public.reimbursement_requests;

create trigger set_reimbursement_request_reference_number
before insert on public.reimbursement_requests
for each row
execute function public.assign_reimbursement_request_reference_number();
