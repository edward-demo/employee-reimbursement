# UC-015: Line Manager Sign Off Team Request

## Primary Actor
Line Manager

## Goal
Sign off a pending reimbursement request from a team member for HR/Admin review.

## Source Evidence
- src/app/components/LineManagerDashboard.tsx

## Trigger
The line manager clicks "Sign Off for HR/Admin Review" on a pending request or inside the details dialog.

## Preconditions
- User is authenticated.
- `employee_profiles.is_line_manager = true`.
- User is routed to LineManagerDashboard.
- The `is_line_manager` flag grants Line Manager access only and does not grant Admin Dashboard access unless the user is separately assigned admin role.

## Main Flow
1. The line manager reviews the request summary or details.
2. The line manager selects "Sign Off for HR/Admin Review."
3. The system records the Line Manager sign-off action.
4. The system routes the request to HR/Admin review.
5. The user-facing display status becomes `Approved by LM • Pending HR Review`.
6. The request may remain pending in the internal workflow state while awaiting HR/Admin final review, but this internal state must not be presented as final approval.
7. The system removes Line Manager action buttons for that request.
8. The system closes the details dialog when sign-off happens from the dialog.

## Postconditions
The team member request is signed off by the line manager and ready for HR/Admin review.

Line Manager sign-off is not final reimbursement approval. HR/Admin approval is the final approval.

## Notes
The current mockup logs the sign-off action; persistence is expected in the real implementation.
