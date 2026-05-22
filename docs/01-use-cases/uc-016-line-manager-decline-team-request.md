# UC-016: Line Manager Deny Team Request

## Primary Actor
Line Manager

## Goal
Deny a pending team reimbursement request with an explanation before HR/Admin review.

## Source Evidence
- src/app/components/LineManagerDashboard.tsx

## Trigger
The line manager clicks "Deny Request" on a pending request.

## Preconditions
- User is authenticated.
- `employee_profiles.is_line_manager = true`.
- User is routed to LineManagerDashboard.
- The `is_line_manager` flag grants Line Manager access only and does not grant Admin Dashboard access unless the user is separately assigned admin role.

## Main Flow
1. The system opens the denial dialog.
2. The line manager enters a denial reason.
3. The system disables denial confirmation until a reason is present.
4. The line manager confirms the denial.
5. The system records the denial decision, denial reason, reviewer, timestamp, and denial source as Line Manager.
6. The system sets the user-facing request status to Denied.
7. The denial happens before HR/Admin review and ends the review workflow for that request.
8. The system closes the denial and details dialogs.

## Postconditions
The request is Denied and the reason can be shown to the employee.

## Notes
The current mockup may use decline wording in places, but the BRD status label is Denied. Persistence is expected in the real implementation.
