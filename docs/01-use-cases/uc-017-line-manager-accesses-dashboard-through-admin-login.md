# UC-017: Line Manager Accesses Line Manager Dashboard Through Admin Login

## Primary Actor
Line Manager

## Goal
Access the correct Line Manager Dashboard when using the Admin login option without having an assigned admin role.

## Source Evidence
- docs/00-business-requirements/BUSINESS_REQUIREMENTS.md
- docs/01-use-cases/uc-001-authenticate-and-access-role-portal.md
- docs/01-use-cases/uc-014-line-manager-review-team-approval-queue.md

## Trigger
A valid Line Manager selects the Admin login option and submits valid credentials.

## Preconditions
- User authenticates successfully.
- User does not have an assigned admin role in `user_roles` / `roles`.
- `employee_profiles.is_line_manager = true`.
- `employee_profiles.is_line_manager` grants Line Manager access only and does not grant Admin Dashboard access.

## Main Flow
1. The user selects the Admin login option.
2. The system authenticates the user credentials.
3. The system checks whether the user has an assigned admin role.
4. The system determines the user does not have an assigned admin role.
5. The system checks `employee_profiles.is_line_manager`.
6. The system determines `employee_profiles.is_line_manager = true`.
7. The system routes the user to LineManagerDashboard.
8. If a fallback message is shown, it reads: "You do not have Admin access. Redirecting to the Line Manager Dashboard."
9. The system displays the Line Manager Dashboard landing view.

## Line Manager Dashboard Landing View
To be completed later. This section will define the visible dashboard components shown after fallback routing.

## Alternate Flows

### A1. User Has Assigned Admin Role
- The system routes the user to Admin Dashboard.
- Admin role takes precedence when using Admin login.

### A2. User Has No Assigned Admin Role and Is Not a Line Manager
- The system denies Admin access.
- The user is not routed to Admin Dashboard.

## Postconditions
- Line Manager-only user does not access Admin Dashboard.
- Line Manager-only user lands on LineManagerDashboard.
- Full Line Manager Dashboard behavior remains governed by UC-014 unless expanded here later.

## Notes
This use case does not require a visible "Login as Line Manager" button.
