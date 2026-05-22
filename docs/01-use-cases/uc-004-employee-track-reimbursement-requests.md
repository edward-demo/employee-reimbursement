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
2. The system shows reimbursement category, item name or category-appropriate item label, quantity, total amount, status, and submitted date.
3. The system labels each request as Pending, Approved by LM • Pending HR Review, Approved by HR, or Denied.
4. The system updates employee request statuses in real time when the status of a submitted request changes.
5. The system displays admin remarks when available.

## Postconditions
The employee knows the state and outcome of each reimbursement request.
