# UC-012: Admin Deny Reimbursement Request

## Primary Actor
Admin

## Goal
Deny a pending reimbursement request with a reason after line-manager sign-off.

## Source Evidence
- src/app/components/AdminDashboard.tsx

## Trigger
The admin clicks Deny on a pending request.

## Preconditions
- User is authenticated.
- User has assigned admin role.
- Line Manager-only users are denied Admin Dashboard access unless separately assigned admin role.

## Main Flow
1. The admin opens a pending request that has `current_review_stage = hr_admin_review`.
2. The system opens the denial dialog.
3. The admin selects a denial reason such as duplicate application or incomplete details.
4. The admin enters a custom reason when choosing Others.
5. The admin confirms denial.
6. The system records the HR/Admin denial reason.
7. The system closes the denial and details dialogs.

## Postconditions
The request is denied with a reason that can be communicated to the employee.

## Notes
The current mockup logs the denial action; persistence is expected in the real implementation.
