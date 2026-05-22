# UC-002: Employee View Benefits Dashboard

## Primary Actor
Employee

## Goal
See reimbursement dashboard statistics, remaining benefit balances, and recent request status.

## Source Evidence
- src/app/components/EmployeeDashboard.tsx

## Trigger
The employee lands on the employee dashboard or selects the Overview tab.

## Main Flow
1. The system displays overview statistics for Total Requests, Reimbursement Balance, and Pending Review.
2. The system displays the employee's Medicine Reimbursement annual limit of PHP 10,000.00.
3. The system displays the employee's approved Medicine Reimbursement usage for the current year.
4. The system displays the employee's remaining Medicine Reimbursement balance.
5. The system displays the employee's Optical Reimbursement annual limit of PHP 5,000.00.
6. The system displays the employee's approved Optical Reimbursement usage for the current year.
7. The system displays the employee's remaining Optical Reimbursement balance.
8. The system displays remaining balances and progress bars for each reimbursement category.
9. The system displays the employee's latest 2 submitted reimbursement requests.
10. The system labels visible request statuses as Pending, Approved by LM • Pending HR Review, Approved by HR, or Denied.
11. The system provides quick access to start a New Reimbursement Request.
12. The system loads dashboard totals, balances, counts, and summary statistics when the employee opens or manually refreshes/reloads the dashboard.
13. The system updates request statuses in real time, including statuses shown in the latest submitted request cards or list.

## Postconditions
The employee understands current benefit availability, recent request status, and available access to submit a new request.
