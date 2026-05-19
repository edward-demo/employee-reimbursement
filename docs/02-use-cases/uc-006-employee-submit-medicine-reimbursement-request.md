# UC-006: Employee Submit Medicine Reimbursement Request

## Primary Actor
Employee

## Goal
Submit a medicine reimbursement claim with required supporting documents.

## Source Evidence
- src/app/components/ReimbursementForm.tsx
- src/app/App.tsx

## Trigger
The employee chooses Medicine from the reimbursement category modal.

## Main Flow
1. The employee uploads at least one doctor's prescription, up to three files.
2. The employee uploads one or more official receipts.
3. The employee enters invoice or receipt numbers for every receipt.
4. The employee enters one or more medicines with name, quantity, and unit price.
5. The system calculates subtotals and total reimbursement amount.
6. The employee optionally adds notes.
7. The employee confirms the submitted information is true and correct.
8. The system enables submission only when all required information is present.
9. The employee submits the request.
10. The system shows a success notification and returns to the employee dashboard.

## Validation Rules
- At least one prescription file is required.
- At least one receipt is required.
- Every receipt requires an invoice or receipt number.
- Every medicine requires name, quantity, and unit price.
- Confirmation is required before submission.
