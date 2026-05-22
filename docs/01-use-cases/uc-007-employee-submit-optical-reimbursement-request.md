# UC-007: Employee Submit Optical Reimbursement Request

## Primary Actor
Employee

## Goal
Submit an optical reimbursement claim with required supporting documents.

## Source Evidence
- src/app/components/OpticalReimbursementForm.tsx
- src/app/App.tsx

## Trigger
The employee chooses Optical from the reimbursement category modal.

## Main Flow
1. The employee uploads at least one and up to three prescription or supporting document files.
2. The employee uploads one or more official receipts.
3. The employee enters invoice or receipt numbers for every receipt.
4. The employee enters one or more optical items with name, quantity, and unit price.
5. The employee optionally marks each receipt as PWD.
6. If PWD is enabled for a receipt, the employee may enter VAT exemption and/or PWD discount amounts.
7. The system displays line item subtotals, item subtotal, PWD deductions per receipt, total PWD deductions, and final reimbursement amount.
8. The employee optionally adds notes.
9. The employee confirms the submitted information is true and correct.
10. The system enables submission only when all required information is present.
11. The employee submits the request.
12. The system creates the request with Pending status and routes it to Line Manager review.
13. The system shows a success notification and returns to the employee dashboard.

## Validation Rules
- At least one prescription or supporting document file is required.
- Optical prescription or supporting document uploads are limited to three files.
- Each prescription or supporting document file must be no larger than 10MB.
- At least one receipt is required.
- Each official receipt file must be no larger than 10MB.
- Every receipt requires an invoice or receipt number.
- Invoice or receipt numbers must be unique within the request.
- Every optical item requires name, quantity, and unit price.
- At least one optical item is required.
- Confirmation is required before submission.
