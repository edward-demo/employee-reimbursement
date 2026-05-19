# UC-002: Employee View Benefits Dashboard

## Primary Actor
Employee

## Goal
See remaining reimbursement balances and pending request status.

## Source Evidence
- src/app/components/EmployeeDashboard.tsx

## Trigger
The employee lands on the employee dashboard or selects the Overview tab.

## Main Flow
1. The system displays the employee's medicine and optical annual limits.
2. The system calculates approved medicine usage.
3. The system calculates approved optical usage.
4. The system displays remaining balances and progress bars.
5. The system displays pending request count and oldest pending request date.

## Postconditions
The employee understands current benefit availability and pending workload.
