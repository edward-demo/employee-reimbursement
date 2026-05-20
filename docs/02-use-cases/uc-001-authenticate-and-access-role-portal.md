# UC-001: Authenticate and Access Role Portal

## Primary Actor
Employee, Admin, or Line Manager

## Goal
Access the correct portal for the user's role.

## Source Evidence
- src/app/App.tsx
- src/app/components/LoginScreen.tsx

## Trigger
The user opens MedReimburse and sees Employee and Admin login options.

## Main Flow
1. The user enters email address and password.
2. The user selects Employee or Admin, or presses Enter while focused in the credential fields.
3. The system checks whether the email address or password field is blank.
4. If any credential field is blank, the system informs the user which field must be completed and keeps the user on the login screen.
5. If email address and password are present and the user selected a portal, QAT Supabase Auth validates the user's credentials and returns an authenticated session.
6. In the later internal-site deployment, Windows Active Directory validates the user's identity.
7. The system resolves the authenticated provider identity to an internal user record.
8. The system loads the user's assigned role or roles, employee profile context, and line-manager yes/no attribute.
9. The system routes the user to the selected portal only if the user has the matching access. Users with only the Employee role cannot open the Admin portal. Users with the `admin` role or `employee_profiles.is_line_manager = true` can open the Admin portal. If the user has multiple access paths, such as HR or Finance users with both Employee and Admin access, or an employee marked as a line manager, the system allows access to each authorized portal.
10. The system shows a success notification.

## Alternate Flows

### Missing Credential Field
If the user presses Enter while one or more credential fields are blank, the system displays a clear message such as:

- Enter your email address.
- Enter your password.
- Enter your email address and password.

The system does not attempt authentication until both fields contain values.

### Valid Credentials Without Portal Selection
If the user presses Enter and both email address and password contain values, the system does not assume a portal. The Employee and Admin login options remain visible, and the system informs the user to choose Login as Employee or Login as Admin.

### Selected Portal Not Authorized
If the user chooses Admin but does not have the `admin` role and is not marked as a line manager, the system denies access, signs out the authenticated session, and keeps the user on the login screen.

## Postconditions
The user is viewing the employee, admin, or line-manager dashboard.

## Notes
The current mockup exposes employee and admin buttons on the login screen and line-manager access through the mockup viewer.
The QAT build should replace mock role selection with Supabase-backed authentication while preserving internal role-based routing. The later internal-site migration should replace Supabase as the identity provider with Windows Active Directory without changing reimbursement ownership, decision, or audit records.
