# Request Status Rules

## Purpose
Define request statuses and how they appear across employee, admin, and line-manager views.

## Source Use Cases
- UC-004: Employee Track Reimbursement Requests
- UC-008: Admin View Operational Overview
- UC-009: Admin Filter Reimbursement Requests
- UC-014: Line Manager Review Team Approval Queue

## Rules

### STAT-001: Employee Request Statuses
Employee-facing requests may show Approved, Pending, or Denied.

### STAT-002: Admin Request Statuses
Admin-facing requests may be filtered by All, Pending, Approved, or Denied.

### STAT-003: Line Manager Request Statuses
Line-manager requests may be filtered by All, Pending, Approved, or Declined.

### STAT-004: Status Must Be Visible on Request Lists
Every request list item must display current status.

### STAT-005: Status Must Be Visible in Request Details
Request details must include the current request status.

### STAT-006: Pending Requests Count Toward Pending Metrics
Pending requests are counted in employee, admin, and line-manager pending summaries.

### STAT-007: Pending Stage Labels
Pending requests must show the active review stage. A pending request in `line_manager_review` stage is awaiting line-manager sign-off. A pending request in `hr_admin_review` stage has been approved by the line manager and is awaiting HR/Admin review.

### STAT-008: Oldest Pending Request Date
Employee dashboard may surface the oldest pending request date when at least one pending request exists.

### STAT-009: Urgency Labels for Line Manager
Line-manager queue labels requests as New, 1 day, or Urgent based on days pending.

## Open Questions
- Should Denied and Declined be separate global statuses or role-specific labels for the same outcome?
- What exact age threshold should make a request overdue or urgent?
