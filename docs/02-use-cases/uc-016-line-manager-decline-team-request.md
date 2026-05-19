# UC-016: Line Manager Decline Team Request

## Primary Actor
Line Manager

## Goal
Decline a pending team reimbursement request with an explanation.

## Source Evidence
- src/app/components/LineManagerDashboard.tsx

## Trigger
The line manager clicks Decline on a pending request.

## Main Flow
1. The system opens the decline dialog.
2. The line manager enters a decline reason.
3. The system disables the decline confirmation until a reason is present.
4. The line manager confirms the decline.
5. The system records the decline reason.
6. The system closes the decline and details dialogs.

## Postconditions
The request is declined and the reason can be shown to the employee.

## Notes
The current mockup logs the decline action; persistence is expected in the real implementation.
