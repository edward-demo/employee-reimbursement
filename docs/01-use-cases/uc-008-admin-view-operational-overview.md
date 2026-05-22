# UC-008: Admin View Operational Overview

## Primary Actor
Admin

## Goal
Monitor current reimbursement activity by category and status.

## Source Evidence
- src/app/components/AdminDashboard.tsx

## Trigger
The admin opens the Admin Dashboard Overview tab.

## Preconditions
- User is authenticated.
- User has an assigned admin role from `user_roles` / `roles`.
- Line Manager-only users are denied Admin Dashboard access unless separately assigned admin role.

## Main Flow
1. The system displays medicine Approved by HR, pending HR/Admin review, and denied counts.
2. The system displays optical Approved by HR, pending HR/Admin review, and denied counts.
3. Pending counts include only requests that completed Line Manager sign-off and are pending HR/Admin review.
4. The system displays total reimbursed amount for the month by reimbursement category.
5. The system displays month-over-month growth percentage.
6. The system displays department breakdown by reimbursement category across Product Development, Finance, HR, Admin, and IT Helpdesk.
7. The system highlights recent pending activity that completed Line Manager sign-off and requires HR/Admin attention.
8. Admin dashboard totals, counts, summaries, department summaries, and recent activity load when the admin opens or manually refreshes/reloads the dashboard.
9. The admin can move from recent activity into request review.

## Postconditions
The admin has an operational snapshot of reimbursement activity based on the loaded or manually refreshed dashboard data.
