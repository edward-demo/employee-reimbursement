# Access Control Rules

## Purpose
Define what each user role can see and do in the reimbursement system.

## Source Use Cases
- UC-001: Authenticate and Access Role Portal
- UC-002: Employee View Benefits Dashboard
- UC-008: Admin View Operational Overview
- UC-014: Line Manager Review Team Approval Queue

## Rules

### ACL-000: Authentication Provider Strategy
QAT authentication is handled by Supabase Auth. The later internal-site deployment will authenticate users through Windows Active Directory. Application authorization remains based on internal roles, employee profiles, and manager scope after the authenticated identity is resolved to an internal user record.

### ACL-001: Role-Based Portal Routing
Authenticated users are routed based on assigned access: Employee, Admin, and line-manager status. Employee and Admin are additive roles, so users with more than one role may be allowed to choose between their available portals after authentication. HR and Finance users can hold both Employee and Admin access. Line-manager access comes from `employee_profiles.is_line_manager`.

### ACL-002: Employee Portal Access
Employees can view their own dashboard, profile, balances, requests, and reimbursement forms.

### ACL-003: Employee Request Scope
Employees can see only their own reimbursement requests.

### ACL-004: Admin Portal Access
Users with the `admin` role and employees marked with `employee_profiles.is_line_manager = true` can open the Admin portal. Admin-role users can view operational overview, request lists, request details, reports, and admin decision actions. Line managers use the Admin portal entry point for review workflows scoped by manager access rules.

### ACL-005: Line Manager Portal Access
Employees with `employee_profiles.is_line_manager = true` can view their team approval queue, team request details, alerts, and team insights.

### ACL-006: Line Manager Team Scope
Line managers should only review requests from employees in their managed team or department.

### ACL-007: Logout Clears Role Session
Logging out clears the selected role and returns the user to the initial viewer or login state.

## Open Questions
- Should HR Admin and Finance Admin become separate roles later, or remain Admin users distinguished by department?
- Can line managers see medical document contents, or only request summaries?
- Should employees be able to edit profile data or only view it?
- Which Active Directory identifier should be treated as the immutable identity key during migration?
