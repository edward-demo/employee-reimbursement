# Approval Workflow Rules

## Purpose
Define how reimbursement requests move through review, approval, denial, and decline decisions.

## Source Use Cases
- UC-008: Admin View Operational Overview
- UC-010: Admin View Request Details and Documents
- UC-011: Admin Approve Reimbursement Request
- UC-012: Admin Deny Reimbursement Request
- UC-014: Line Manager Review Team Approval Queue
- UC-015: Line Manager Approve Team Request
- UC-016: Line Manager Decline Team Request

## Rules

### WF-001: Submitted Requests Start With Line Manager Review
A newly submitted reimbursement request enters Pending status with `current_review_stage = line_manager_review`.

### WF-002: Line Manager Approval Is Required Before HR/Admin Review
Pending requests assigned to an employee with a line manager must be reviewed and signed off by that line manager before HR/Admin can make the final approval or denial decision.

### WF-003: Line Manager Approval Moves Request To HR/Admin Review
When a line manager approves a pending team request, the request remains Pending and moves to `current_review_stage = hr_admin_review`. Employee and admin-facing screens label this state as `Approved by LM • Pending HR Review`.

### WF-004: Admin Can Approve After Line Manager Sign-Off
An admin can approve a pending reimbursement request only after the line manager has approved it and the request is in the HR/Admin review stage.

### WF-005: Admin Can Deny After Line Manager Sign-Off
An admin can deny a pending reimbursement request with a denial reason only after the line manager has approved it and the request is in the HR/Admin review stage.

### WF-006: Line Manager Can Approve Team Requests
A line manager can approve pending reimbursement requests belonging to team members.

### WF-007: Line Manager Can Decline Team Requests
A line manager can decline pending reimbursement requests belonging to team members with a decline reason.

### WF-008: Decision Requires Request Review Context
Decision screens should expose employee details, submitted date, item breakdown, receipts, invoice numbers, notes, and total amount.

### WF-009: Closed Decisions Hide Pending Actions
Approved, denied, or declined requests should not show pending approval actions.

### WF-010: Admin Denial Reasons
Admin denial reasons include duplicate application, incomplete details, and custom others reason.

### WF-011: Line Manager Decline Reason Is Free Text
Line manager decline requires a manually entered reason.

### WF-012: Decision Actor Must Be Recorded
The system should record who made an approval, denial, or decline decision.

### WF-013: Decision Date Must Be Recorded
The system should record when an approval, denial, or decline decision occurs.

## Open Questions
- Should Finance have a separate approval step after HR or line-manager approval?
- Should employees be able to resubmit denied or declined requests?
