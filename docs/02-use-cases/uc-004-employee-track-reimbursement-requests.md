# UC-004: Employee Track Reimbursement Requests

## Primary Actor
Employee

## Goal
Review submitted reimbursement requests, statuses, amounts, dates, and remarks.

## Source Evidence
- src/app/components/EmployeeDashboard.tsx

## Trigger
The employee selects the My Requests tab.

## Main Flow
1. The system lists all reimbursement requests for the employee.
2. The system shows request ID, item name, quantity, total amount, and submitted date.
3. The system labels each request as approved, pending, or denied.
4. The system displays review remarks when available.

## Postconditions
The employee knows the state and outcome of each reimbursement request.
