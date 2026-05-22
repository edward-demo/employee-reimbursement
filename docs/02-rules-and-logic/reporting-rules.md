# Reporting Rules

## Purpose
Define administrative reporting and dashboard metrics.

## Source Use Cases
- UC-008: Admin View Operational Overview
- UC-009: Admin Filter Reimbursement Requests
- UC-013: Admin View Reimbursement Reports
- UC-014: Line Manager Review Team Approval Queue

## Rules

### RPT-001: Category Status Counts
Admin overview displays approved, pending, and denied counts separately for Medicine and Optical.

### RPT-001A: Pending Counts Respect Review Stage
Pending metrics should distinguish requests awaiting line-manager sign-off from requests approved by the line manager and awaiting HR/Admin review.

### RPT-002: Total Reimbursed by Category
Admin overview displays total reimbursed amount for Medicine and Optical.

### RPT-003: Department Breakdown
Admin reports display approved reimbursements by department and category.

### RPT-004: Request Filters Affect Request Lists
Status and department filters affect the admin request list and result count.

### RPT-005: Line Manager Pending Amount
Line-manager overview displays total pending amount for the currently filtered queue.

### RPT-006: Line Manager High-Value Claims
Line-manager insights identify pending claims above the high-value threshold used by the interface.

### RPT-007: Recent Activity
Admin and line-manager dashboards display recent review activity.

## Open Questions
- Should reports use submitted date, approved date, or payment date for monthly totals?
- Should denied and declined amounts be included in reporting totals?
- What export formats are required for reports?
