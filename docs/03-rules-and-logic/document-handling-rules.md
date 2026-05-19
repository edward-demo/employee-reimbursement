# Document Handling Rules

## Purpose
Define document attachment, preview, and review behavior for prescriptions and receipts.

## Source Use Cases
- UC-006: Employee Submit Medicine Reimbursement Request
- UC-007: Employee Submit Optical Reimbursement Request
- UC-010: Admin View Request Details and Documents
- UC-014: Line Manager Review Team Approval Queue

## Rules

### DOC-001: Prescription Documents Required
Each reimbursement request must include at least one prescription document.

### DOC-002: Prescription Upload Maximum
Each reimbursement request may include no more than three prescription documents.

### DOC-003: Receipt Documents Required
Each reimbursement request must include at least one receipt document.

### DOC-004: Multiple Receipts Supported
The system supports multiple receipts in a single reimbursement request.

### DOC-005: Receipt Invoice Number Stored Per Receipt
Each receipt stores its own invoice or receipt number.

### DOC-006: Documents Must Be Reviewable
Admin and line-manager review screens must expose uploaded documents for inspection.

### DOC-007: Admin Document Preview
Admins can preview prescriptions and receipts from request details.

### DOC-008: Admin Document Download
Admins can download prescriptions and receipts from request details.

### DOC-009: Document File Type Constraints
Documents should be limited to PDF, PNG, JPG, and JPEG files.

### DOC-010: Document Size Constraint
Each document should be limited to 10MB.

## Open Questions
- Should line managers be allowed to download documents or only view them?
- Should files be virus-scanned before review?
- Should receipt image OCR be introduced later for invoice number extraction?
