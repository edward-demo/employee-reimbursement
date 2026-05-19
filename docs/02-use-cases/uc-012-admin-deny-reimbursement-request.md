# UC-012: Admin Deny Reimbursement Request

## Primary Actor
Admin

## Goal
Deny a pending reimbursement request with a reason.

## Source Evidence
- src/app/components/AdminDashboard.tsx

## Trigger
The admin clicks Deny on a pending request.

## Main Flow
1. The system opens the denial dialog.
2. The admin selects a denial reason such as duplicate application or incomplete details.
3. The admin enters a custom reason when choosing Others.
4. The admin confirms denial.
5. The system records the denial reason.
6. The system closes the denial and details dialogs.

## Postconditions
The request is denied with a reason that can be communicated to the employee.

## Notes
The current mockup logs the denial action; persistence is expected in the real implementation.
