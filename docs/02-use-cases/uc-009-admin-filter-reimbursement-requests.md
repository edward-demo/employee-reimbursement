# UC-009: Admin Filter Reimbursement Requests

## Primary Actor
Admin

## Goal
Find reimbursement requests by status and department.

## Source Evidence
- src/app/components/AdminDashboard.tsx

## Trigger
The admin opens the Requests tab and changes filter controls.

## Main Flow
1. The admin selects a status filter: all, pending, approved, or denied.
2. The admin selects a department filter.
3. The system filters the reimbursement request list.
4. The system shows a result count when filters are active.
5. The admin clears filters when needed.

## Alternate Flow
If no requests match, the system displays an empty state and offers a clear filters action.

## Postconditions
The admin sees only the requests matching the selected criteria.
