# Validation Rules

## Purpose
Define field-level and submission-level validation used by reimbursement forms and decision workflows.

## Source Use Cases
- UC-006: Employee Submit Medicine Reimbursement Request
- UC-007: Employee Submit Optical Reimbursement Request
- UC-012: Admin Deny Reimbursement Request
- UC-016: Line Manager Decline Team Request

## Rules

### VAL-001: At Least One Line Item Required
A reimbursement request must contain at least one line item.

### VAL-002: Line Item Name Required
Each medicine or optical item must have a non-empty name.

### VAL-003: Line Item Quantity Required
Each line item must have a quantity.

### VAL-004: Line Item Unit Price Required
Each line item must have a unit price.

### VAL-005: Line Item Subtotal Calculation
The system calculates each line item subtotal as quantity multiplied by unit price.

### VAL-006: Request Total Calculation
The system calculates request total as the sum of all line item subtotals, adjusted later by approved deductions when applicable.

### VAL-007: Prescription Required
A reimbursement request requires at least one prescription document.

### VAL-008: Prescription Upload Limit
An employee may attach up to three prescription files to one request.

### VAL-009: Receipt Required
A reimbursement request requires at least one official receipt.

### VAL-010: Multiple Receipts Allowed
A reimbursement request may include multiple official receipts.

### VAL-011: Receipt Invoice Number Required
Every receipt must have an invoice or receipt number before submission.

### VAL-012: Employee Confirmation Required
The employee must confirm that submitted information is true and correct before the system allows submission.

### VAL-013: Decline Reason Required
A line manager must enter a decline reason before declining a request.

### VAL-014: Admin Denial Reason Required
An admin denial must include either a predefined reason or a custom reason.

### VAL-015: Supported Upload File Types
The form accepts PDF, PNG, JPG, and JPEG files for prescriptions and receipts.

### VAL-016: Upload Size Limit
Each uploaded document should be limited to 10MB.

## Open Questions
- Should quantity allow decimals for every category, or only for selected item types?
- Should duplicate invoice numbers be blocked globally?
- Should prescription date and receipt date be validated at submission time or review time?
