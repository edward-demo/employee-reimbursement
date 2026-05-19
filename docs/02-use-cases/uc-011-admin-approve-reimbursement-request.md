# UC-011: Admin Approve Reimbursement Request

## Primary Actor
Admin

## Goal
Approve a pending reimbursement request.

## Source Evidence
- src/app/components/AdminDashboard.tsx

## Trigger
The admin clicks Approve on a pending request or inside the details dialog.

## Main Flow
1. The admin reviews request summary or full details.
2. The admin selects Approve.
3. The system records the approval action.
4. The system closes the details dialog when approval happens from the dialog.

## Postconditions
The request is approved and ready for downstream payment processing.

## Notes
The current mockup logs the approval action; persistence is expected in the real implementation.
