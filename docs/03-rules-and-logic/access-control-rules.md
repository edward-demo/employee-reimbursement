# Access Control Rules

## Purpose
Define what each user role can see and do in the reimbursement system.

## Source Use Cases
- UC-001: Authenticate and Access Role Portal
- UC-002: Employee View Benefits Dashboard
- UC-008: Admin View Operational Overview
- UC-014: Line Manager Review Team Approval Queue

## Rules

### ACL-001: Role-Based Portal Routing
Authenticated users are routed to a portal based on role: Employee, Admin, or Line Manager.

### ACL-002: Employee Portal Access
Employees can view their own dashboard, profile, balances, requests, and reimbursement forms.

### ACL-003: Employee Request Scope
Employees can see only their own reimbursement requests.

### ACL-004: Admin Portal Access
Admins can view operational overview, request lists, request details, reports, and admin decision actions.

### ACL-005: Line Manager Portal Access
Line managers can view their team approval queue, team request details, alerts, and team insights.

### ACL-006: Line Manager Team Scope
Line managers should only review requests from employees in their managed team or department.

### ACL-007: Logout Clears Role Session
Logging out clears the selected role and returns the user to the initial viewer or login state.

## Open Questions
- Are HR Admin and Finance Admin separate roles?
- Can line managers see medical document contents, or only request summaries?
- Should employees be able to edit profile data or only view it?
