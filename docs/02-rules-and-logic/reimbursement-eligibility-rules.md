# Reimbursement Eligibility Rules

## Purpose
Define which reimbursement requests are eligible to be submitted and reviewed.

## Source Use Cases
- UC-002: Employee View Benefits Dashboard
- UC-005: Employee Select Reimbursement Category
- UC-006: Employee Submit Medicine Reimbursement Request
- UC-007: Employee Submit Optical Reimbursement Request
- UC-010: Admin View Request Details and Documents

## Rules

### ELIG-001: Supported Reimbursement Categories
The system supports two reimbursement categories: Medicine and Optical.

### ELIG-002: Category Required Before Submission
An employee must select a reimbursement category before entering claim details.

### ELIG-003: Medicine Claim Scope
Medicine claims cover prescriptions, pharmacy purchases, and medical supplies.

### ELIG-004: Optical Claim Scope
Optical claims cover eyeglasses, contact lenses, and optical services.

### ELIG-005: Request Must Belong to an Employee
Every reimbursement request must be associated with one employee profile.

### ELIG-006: Employee Benefit Category Must Match Claim Category
Medicine claims consume medicine benefit balance. Optical claims consume optical benefit balance.

### ELIG-007: Claim Must Include Supporting Documents
A claim is not eligible for submission unless required prescription and receipt documents are attached.

## Open Questions
- Are medical supplies always included under Medicine, or should they become a separate category later?
- Are optical services reimbursable without a prescription?
- Are there eligibility limits based on employment status, tenure, or department?
