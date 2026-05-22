# UC-001: Authenticate and Access Role Portal

## Primary Actor

Employee, Admin, or Line Manager

## Goal

Authenticate the user and route the user to the correct authorized portal or dashboard based on assigned access.

## Source Evidence

- src/app/App.tsx
- src/app/components/LoginScreen.tsx

## Trigger

The user opens MedReimburse and sees the available Employee and Admin login options.

This use case does not require a visible "Login as Line Manager" button. Line Manager routing may occur through authorized role-based routing or through the Admin login fallback described below.

## Main Flow
1. The user enters an email address and password.

2. The user selects an available login option: Employee or Admin.

3. The system checks whether the email address and password fields are both completed.

4. If both credential fields are completed and a login option was selected, the system authenticates the user using the active authentication provider.

   - QAT deployment: Supabase Auth validates the user credentials and returns an authenticated session.
   - Later internal-site deployment: Windows Active Directory validates the user identity.

5. If email address and password are present and the user selected a portal, QAT Supabase Auth validates the user's credentials and returns an authenticated session.


6. The system checks the following MedReimburse user profile fields and related access fields:

   - User profile ID
   - Employee ID
   - Email address
   - Full name
   - Department
   - Designation
   - Active or inactive status
   - Assigned role or roles
   - Assigned Admin role
   - `employee_profiles.is_line_manager` yes/no attribute
   - Assigned team or direct-report relationship, if the user is a Line Manager

7. The system checks whether the matched user profile is active.

8. The system checks whether the matched user profile is authorized to access the selected portal or dashboard.

   - Employee access routes to the Employee Dashboard.
   - Admin Dashboard access requires an assigned Admin role from `user_roles` / `roles`.
   - Line Manager Dashboard access requires `employee_profiles.is_line_manager = true`.
   - `employee_profiles.is_line_manager` grants Line Manager access only and must not grant Admin Dashboard access.
   - If the user selected Admin, lacks an assigned Admin role, and has `employee_profiles.is_line_manager = true`, the system uses the Admin login fallback and routes the user to LineManagerDashboard.
   - If the user selected Admin and has neither an assigned Admin role nor `employee_profiles.is_line_manager = true`, the system denies access.

9. If authorized, the system routes the user to the correct area:

   - Employee access routes to the Employee Dashboard.
   - Admin access with an assigned Admin role routes to the Admin Dashboard.
   - Admin login fallback for a valid Line Manager user routes to LineManagerDashboard.
   - Line Manager Dashboard access routes to LineManagerDashboard through role-based routing.

10. The system shows a successful login notification.

11. The user views the authorized portal, dashboard, or review area.

## Authorization Rules

- Users with Employee access can open the Employee Dashboard.

- Users with only Employee access cannot open the Admin Dashboard.

- Users with an assigned Admin role from `user_roles` / `roles` can open the Admin Dashboard.

- Users with `employee_profiles.is_line_manager = true` can open LineManagerDashboard.

- `employee_profiles.is_line_manager = true` grants Line Manager access only and does not grant Admin Dashboard access.

- Admin login fallback for valid Line Manager users routes only to LineManagerDashboard and does not authorize Admin Dashboard access.

- Line Manager-only users cannot access Admin Dashboard review, reporting, analytics, or all-request views unless separately assigned an Admin role.

- Line Managers can only view reimbursement requests for assigned team members.

- Line Managers can sign off pending team requests for HR/Admin review.

- Line Managers can deny pending team requests with a reason before HR/Admin review.

- Line Managers cannot make the final HR/Admin approval or denial decision unless they also have an assigned Admin role.

- Users with multiple access paths may access each area they are explicitly authorized to use.

## Alternate Flows

### 3.1 Missing Credential Field

This alternate flow branches from **Main Flow Step 3**.

If the user tries to continue while one or more credential fields are blank, the system displays a clear message such as:

- Enter your email address.
- Enter your password.
- Enter your email address and password.

The system does not proceed to authentication until both fields contain values.

### 4.1 Valid Credentials Without Portal Selection

This alternate flow branches from **Main Flow Step 4**.

If the user enters an email address and password, then presses Enter while focused on the password field without selecting the Employee or Admin login option, the system does not authenticate the user and does not assume a portal.

The system keeps the user on the login screen and displays a clear message such as:

- Choose Login as Employee or Login as Admin.

The Employee and Admin login options remain visible. The user must explicitly choose a login option before authentication and portal routing continue.

### 5.1 No Matching MedReimburse User Profile Found

This alternate flow branches from **Main Flow Step 5**.

If authentication succeeds but the system cannot find a matching MedReimburse user profile, the system denies portal access.

The system clears the login session as appropriate and informs the user that the account is not yet configured for MedReimburse.

### 7.1 Inactive MedReimburse User Profile

This alternate flow branches from **Main Flow Step 7**.

If authentication succeeds but the matched MedReimburse user profile is inactive, the system denies portal access.

The system clears the login session as appropriate and informs the user that the account is inactive or not allowed to access MedReimburse.

### 8.1 Selected Portal Not Authorized

This alternate flow branches from **Main Flow Step 8**.

If the user chooses a portal or area that the matched MedReimburse user profile is not authorized to access, the system denies access.

The system signs out or clears the unauthorized session state as appropriate and keeps the user on the login screen or returns the user to an authorized area.

Portal selection validation is specific to the selected portal:

- If the user selects Admin and has an assigned Admin role from `user_roles` / `roles`, the system routes to the Admin Dashboard.
- If the user selects Admin, does not have an assigned Admin role, and has `employee_profiles.is_line_manager = true`, the system routes to LineManagerDashboard.
- If the user selects Admin and has neither an assigned Admin role nor `employee_profiles.is_line_manager = true`, the system denies access.
- Line Manager Dashboard access remains role-based and requires `employee_profiles.is_line_manager = true`.
- The Admin login fallback does not grant Admin Dashboard access.
- If the app shows a message during Admin login fallback, the expected message is: "You do not have Admin access. Redirecting to the Line Manager Dashboard."

Examples:

- A user with only Employee access cannot open the Admin Dashboard.
- A user with only Line Manager access who selects Admin login routes to LineManagerDashboard, not Admin Dashboard review, reporting, analytics, all-request views, or final approve/deny actions.
- A user with an assigned Admin role can open the Admin Dashboard.
- A user with `employee_profiles.is_line_manager = true` can open LineManagerDashboard.

### 8.2 Multiple Authorized Access Paths

This alternate flow branches from **Main Flow Step 8**.

If the authenticated user has more than one authorized access path, the system allows the user to access each permitted area without granting permissions outside those roles.

Examples:

- Employee + Admin: may access Employee Dashboard and Admin Dashboard.
- Employee + Line Manager: may access Employee Dashboard and LineManagerDashboard.
- Employee + Admin + Line Manager: may access Employee Dashboard, Admin Dashboard, and LineManagerDashboard.

### Session Expiration or Invalid Session

This alternate flow may occur after the user has authenticated and is using an authorized portal, dashboard, or review area.

If the user's session expires or becomes invalid, the system returns the user to the login screen and displays:

- Your session expired due to inactivity. Please sign in again to continue.

The user may sign in again using the normal login process.

## Postconditions

The user is authenticated and viewing an authorized Employee Dashboard, Admin Dashboard, or LineManagerDashboard.

## Access Control Notes

- Admin users may review requests that have completed line-manager sign-off.

- Admin users may make the final approval or denial decision.

- Line Managers may review only assigned team member requests.

- Line Managers may sign off pending team requests for HR/Admin review.

- Line Managers may deny pending team requests with a reason before HR/Admin review.

- Line Manager sign-off is not final approval.

- HR/Admin approval or denial is the final reimbursement decision.

- Application authorization, ownership, decisions, and audit records must reference internal MedReimburse user records rather than provider-specific authentication records.

## Notes

The current login screen exposes Employee and Admin login options. This use case does not require a separate visible Line Manager login option.

The QAT build should replace mock role selection with Supabase-backed authentication while preserving internal role-based routing and authorization.

The later internal-site migration should replace Supabase as the identity provider with Windows Active Directory without changing reimbursement ownership, decision, or audit records.
