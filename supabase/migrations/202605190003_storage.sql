-- MedReimburse QAT Supabase Storage setup
-- Run this after 202605190002_rls_policies.sql.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'reimbursement-documents',
  'reimbursement-documents',
  false,
  10485760,
  array['application/pdf', 'image/png', 'image/jpeg']
)
on conflict (id) do update
set public = false,
    file_size_limit = 10485760,
    allowed_mime_types = array['application/pdf', 'image/png', 'image/jpeg'];

drop policy if exists "Users can upload reimbursement documents to own folder" on storage.objects;
create policy "Users can upload reimbursement documents to own folder"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'reimbursement-documents'
  and (storage.foldername(name))[1] = public.current_app_user_id()::text
);

drop policy if exists "Users can read reimbursement documents they can access" on storage.objects;
create policy "Users can read reimbursement documents they can access"
on storage.objects for select
to authenticated
using (
  bucket_id = 'reimbursement-documents'
  and (
    (storage.foldername(name))[1] = public.current_app_user_id()::text
    or exists (
      select 1
      from public.reimbursement_documents rd
      where rd.storage_bucket = storage.objects.bucket_id
        and rd.storage_path = storage.objects.name
        and public.can_access_reimbursement_request(rd.reimbursement_request_id)
    )
  )
);

drop policy if exists "Users can update reimbursement documents in own folder" on storage.objects;
create policy "Users can update reimbursement documents in own folder"
on storage.objects for update
to authenticated
using (
  bucket_id = 'reimbursement-documents'
  and (storage.foldername(name))[1] = public.current_app_user_id()::text
)
with check (
  bucket_id = 'reimbursement-documents'
  and (storage.foldername(name))[1] = public.current_app_user_id()::text
);

drop policy if exists "Users can delete reimbursement documents in own folder before review" on storage.objects;
create policy "Users can delete reimbursement documents in own folder before review"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'reimbursement-documents'
  and (storage.foldername(name))[1] = public.current_app_user_id()::text
);
