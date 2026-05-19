# Authentication Integration Plan

## Purpose
Document the planned authentication path for the QAT version and the later internal-site migration.

## Current Plan

### QAT
QAT authentication will use Supabase Auth. Supabase is responsible for credential validation, session issuance, password flows, and provider-level user identity.

The reimbursement application remains responsible for:
- Mapping the Supabase authenticated user to an internal `users` record.
- Loading assigned application roles.
- Applying employee ownership, admin access, and line-manager scope.
- Writing audit events against the internal user ID.

### Internal Site
The later internal-site deployment will authenticate users through Windows Active Directory.

The reimbursement application should preserve the same internal authorization model:
- Active Directory validates the user's identity.
- The app maps the AD identity to the existing internal `users` record.
- Reimbursement requests, documents, decisions, notifications, and audit records continue to reference internal user IDs.

## Migration Principle
Authentication providers may change. Business records should not.

The app should avoid storing Supabase-specific identifiers directly on reimbursement requests, employee profiles, decisions, documents, or notifications. Those records should reference `users.user_id`. Provider-specific subjects belong in `user_identity_links`.

## Identity Mapping

QAT mapping:
```text
Supabase auth.users.id
  -> user_identity_links.external_subject where identity_provider = 'supabase'
  -> users.user_id
```

Internal-site mapping:
```text
Active Directory immutable subject
  -> user_identity_links.external_subject where identity_provider = 'active_directory'
  -> users.user_id
```

The selected Active Directory subject should be immutable. Good candidates include object GUID or SID. Email and UPN are useful searchable attributes, but they can change and should not be the only durable key.

## Authorization Boundary
Authentication answers who the user is. Authorization answers what the user can do.

Authorization should continue to come from application data:
- `roles`
- `user_roles`
- `employee_profiles`
- `departments`
- `line_manager_employee_profile_id`

## Migration Checklist
- Confirm the immutable Active Directory identifier to store in `user_identity_links.external_subject`.
- Export or reconcile QAT users by employee number and company email.
- Create Active Directory identity links for existing internal users.
- Validate role assignments after AD mapping.
- Validate employee profile ownership and line-manager scope after AD mapping.
- Keep historical decision and audit records unchanged.

## Open Questions
- Will the internal site use direct Active Directory integration, Azure AD/Entra ID, or another corporate single sign-on layer backed by AD?
- Will roles be managed inside MedReimburse, synchronized from AD groups, or both?
- Should employee profile data be manually maintained, imported from HRIS, or synchronized from directory attributes?
