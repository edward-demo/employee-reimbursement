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

### WF-001: Submitted Requests Start Pending
A newly submitted reimbursement request enters Pending status.

### WF-002: Admin Can Approve Pending Requests
An admin can approve a pending reimbursement request after review.

### WF-003: Admin Can Deny Pending Requests
An admin can deny a pending reimbursement request with a denial reason.

### WF-004: Line Manager Can Approve Team Requests
A line manager can approve pending reimbursement requests belonging to team members.

### WF-005: Line Manager Can Decline Team Requests
A line manager can decline pending reimbursement requests belonging to team members with a decline reason.

### WF-006: Decision Requires Request Review Context
Decision screens should expose employee details, submitted date, item breakdown, receipts, invoice numbers, notes, and total amount.

### WF-007: Closed Decisions Hide Pending Actions
Approved, denied, or declined requests should not show pending approval actions.

### WF-008: Admin Denial Reasons
Admin denial reasons include duplicate application, incomplete details, and custom others reason.

### WF-009: Line Manager Decline Reason Is Free Text
Line manager decline requires a manually entered reason.

### WF-010: Decision Actor Must Be Recorded
The system should record who made an approval, denial, or decline decision.

### WF-011: Decision Date Must Be Recorded
The system should record when an approval, denial, or decline decision occurs.

## Open Questions
- Is line-manager approval required before admin approval, or are these separate review paths?
- Should Finance have a separate approval step after HR or line-manager approval?
- Should employees be able to resubmit denied or declined requests?
