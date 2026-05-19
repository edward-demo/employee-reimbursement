# UC-015: Line Manager Approve Team Request

## Primary Actor
Line Manager

## Goal
Approve a pending reimbursement request from a team member.

## Source Evidence
- src/app/components/LineManagerDashboard.tsx

## Trigger
The line manager clicks Approve on a pending request or inside the details dialog.

## Main Flow
1. The line manager reviews the request summary or details.
2. The line manager selects Approve.
3. The system records the approval action.
4. The system closes the details dialog when approval happens from the dialog.

## Postconditions
The team member request is approved for the next downstream step.

## Notes
The current mockup logs the approval action; persistence is expected in the real implementation.
