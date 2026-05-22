# UC-011: Admin Approve Reimbursement Request

## Primary Actor
Admin

## Goal
Approve a pending reimbursement request after line-manager sign-off.

## Source Evidence
- src/app/components/AdminDashboard.tsx

## Trigger
The admin clicks Approve on a pending request or inside the details dialog.

## Preconditions
- User is authenticated.
- User has assigned admin role.
- Line Manager-only users are denied Admin Dashboard access unless separately assigned admin role.

## Main Flow
1. The admin opens a pending request that has `current_review_stage = hr_admin_review`.
2. The system displays the line manager who signed off the request.
3. The admin reviews request summary or full details.
4. The admin selects Approve.
5. The system records the HR/Admin approval action.
6. The system closes the details dialog when approval happens from the dialog.

## Postconditions
The request is approved and ready for downstream payment processing.

## Notes
The current mockup logs the approval action; persistence is expected in the real implementation.
