# Supabase QAT Setup

## What Was Generated
- `supabase/migrations/202605190001_initial_schema.sql`
- `supabase/migrations/202605190002_rls_policies.sql`
- `supabase/migrations/202605200002_line_manager_profile_attribute.sql`
- `supabase/migrations/202605200003_authenticated_table_grants.sql`
- `supabase/migrations/202605190003_storage.sql`
- `.env.example`
- `src/lib/supabase.ts`

These files are designed for the no-CLI path: paste the SQL migrations into the Supabase Dashboard SQL Editor.

## Setup Steps

### 1. Create the Supabase Project
Create a QAT project in Supabase. Keep the database password and service-role key private.

### 2. Run the SQL Migrations
In Supabase Dashboard, open SQL Editor and run these files in order:

1. `supabase/migrations/202605190001_initial_schema.sql`
2. `supabase/migrations/202605190002_rls_policies.sql`
3. `supabase/migrations/202605200002_line_manager_profile_attribute.sql`
4. `supabase/migrations/202605200003_authenticated_table_grants.sql`
5. `supabase/migrations/202605190003_storage.sql`

Run each file as a separate SQL query. If one fails, stop and fix that file before running the next one.

If you see `permission denied for table ...` while using the app, run `supabase/migrations/202605200003_authenticated_table_grants.sql` in the SQL Editor. The grants give Supabase authenticated sessions table-level access, while RLS policies still control which rows they can actually see or change.

### 3. Configure Auth
In Supabase Dashboard:

1. Go to Authentication.
2. Enable the QAT sign-in method you want, such as email/password or magic link.
3. Set the Site URL to your local app while developing, for example `http://localhost:5173`.
4. Add your future Vercel preview and production URLs later.

### 4. Add Frontend Environment Variables
Copy `.env.example` to `.env.local`.

Fill values from Supabase Dashboard > Project Settings > API:

```text
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

The anon key is expected in frontend apps. Do not put the service-role key in `.env.local` for the browser app.

### 5. Install the Supabase JS Client
`package.json` already includes the Supabase browser client. Install dependencies:

```bash
pnpm install
```

If you use npm instead:

```bash
npm install
```

### 6. Create Your First QAT User
Create a test user from Supabase Authentication.

After that user signs in from the app, call this RPC once to create the internal app user mapping:

```ts
await supabase.rpc("ensure_current_supabase_user", {
  p_display_name: "Your Name",
});
```

That creates or links:

```text
Supabase auth.users.id
  -> public.user_identity_links.external_subject
  -> public.users.user_id
```

### 7. Assign Role and Employee Profile
The first user will not automatically be an employee or admin. Use the SQL Editor to assign profile and role data during QAT.

For the current QAT test users, use this seed after the Supabase Auth users have been created:

```text
supabase/seeds/202605200001_qat_user_department_mappings.sql
```

Open the file, paste it into the Supabase SQL Editor, and run it once. It reads the users from Supabase Authentication, creates or updates the matching app records, links each Supabase Auth ID to `public.users`, fills display names, assigns departments from email hints, assigns starting Employee/Admin roles, sets the line-manager yes/no flag, and creates employee profile records.

Current special mappings:

- `edward.sal365@gmail.com` belongs to `Product Development`.
- `financeguy@test123.com` gets the display name `Finance Guy`.
- `linemanagerguy@test123.com` gets the display name `Line Manager Guy`.
- HR and Finance users receive both `employee` and `admin` roles so they can use employee self-service and admin reimbursement functions.
- Line-manager users are marked with `employee_profiles.is_line_manager = true`; line manager is not assigned as a role.

Example shape:

```sql
-- Replace the email and employee details.
with target_user as (
  select user_id from public.users where email = 'your.email@company.com'
),
target_role as (
  select role_id from public.roles where code = 'admin'
)
insert into public.user_roles (user_id, role_id)
select target_user.user_id, target_role.role_id
from target_user, target_role
on conflict do nothing;
```

For employee portal testing, also create an `employee_profiles` record for the user and assign benefit enrollments for the current year.

## Upload Path Convention
Use this path format for files in the `reimbursement-documents` bucket:

```text
{internal_user_id}/{reimbursement_request_id}/{file_name}
```

The storage policies allow users to upload into their own internal-user folder. Document metadata should then be inserted into `public.reimbursement_documents` with the same `storage_path`.

## Notes
- RLS is enabled on the application tables.
- Admin visibility comes from the `admin` role in `public.user_roles`.
- Line-manager visibility uses `employee_profiles.is_line_manager = true` plus either direct report mapping or same-department matching.
- The model intentionally references `public.users.user_id` instead of Supabase Auth IDs so the later Windows Active Directory migration can keep reimbursement records unchanged.
