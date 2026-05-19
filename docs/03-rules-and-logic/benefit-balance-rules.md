# Benefit Balance Rules

## Purpose
Define how medicine and optical benefit balances are displayed and consumed.

## Source Use Cases
- UC-002: Employee View Benefits Dashboard
- UC-006: Employee Submit Medicine Reimbursement Request
- UC-007: Employee Submit Optical Reimbursement Request
- UC-011: Admin Approve Reimbursement Request
- UC-015: Line Manager Approve Team Request

## Rules

### BAL-001: Separate Annual Limits
Each employee has separate annual limits for Medicine and Optical reimbursement.

### BAL-002: Approved Claims Consume Balance
Only approved reimbursement requests count against the employee's benefit balance.

### BAL-003: Pending Claims Do Not Consume Balance
Pending requests are displayed separately and do not reduce remaining balance until approved.

### BAL-004: Denied or Declined Claims Do Not Consume Balance
Denied or declined requests do not reduce remaining benefit balance.

### BAL-005: Remaining Balance Calculation
Remaining balance equals annual category limit minus total approved amount for that category.

### BAL-006: Balance Usage Display
The system should display used amount, annual limit, remaining balance, and visual progress for each category.

### BAL-007: Category Isolation
Medicine approved amounts must not reduce optical balance. Optical approved amounts must not reduce medicine balance.

## Open Questions
- Should a request be prevented if it exceeds remaining balance?
- If a request exceeds remaining balance, should the system allow partial reimbursement?
- Do balances reset annually by calendar year, fiscal year, or employee anniversary?
