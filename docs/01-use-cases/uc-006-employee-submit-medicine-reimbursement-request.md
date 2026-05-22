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
1. The employee uploads at least one doctor's prescription, up to three files, with each file no larger than 10MB.
2. The employee uploads one or more official receipts, with each file no larger than 10MB.
3. The employee enters invoice or receipt numbers for every receipt.
4. The employee enters one or more medicines with name, quantity, and unit price.
5. The system calculates subtotals and total reimbursement amount.
6. The employee optionally adds notes.
7. The employee confirms the submitted information is true and correct.
8. The system enables submission only when all required information is present.
9. The employee submits the request.
10. The system creates the request with Pending status and routes it to Line Manager review.
11. The system shows a success notification and returns to the employee dashboard.

## Validation Rules
- At least one prescription file is required.
- Each prescription file must be no larger than 10MB.
- At least one receipt is required.
- Each official receipt file must be no larger than 10MB.
- Every receipt requires an invoice or receipt number.
- Every medicine requires name, quantity, and unit price.
- Confirmation is required before submission.
