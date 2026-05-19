# Notification Rules

## Purpose
Define when the system informs users about login, submission, review activity, and decision outcomes.

## Source Use Cases
- UC-001: Authenticate and Access Role Portal
- UC-006: Employee Submit Medicine Reimbursement Request
- UC-007: Employee Submit Optical Reimbursement Request
- UC-012: Admin Deny Reimbursement Request
- UC-016: Line Manager Decline Team Request

## Rules

### NOTIF-001: Login Success Notification
The system displays a success notification after role-based login.

### NOTIF-002: Submission Success Notification
The system displays a success notification after a medicine reimbursement request is submitted.

### NOTIF-003: Optical Submission Success Notification
The system displays a success notification after an optical reimbursement request is submitted.

### NOTIF-004: Review Queue Alerts
Line-manager dashboard shows alerts for new and overdue requests.

### NOTIF-005: Decline Reason Communicated
When a line manager declines a request, the employee should be notified of the decline reason.

### NOTIF-006: Denial Reason Communicated
When an admin denies a request, the employee should be notified of the denial reason.

### NOTIF-007: Approval Notification
When a request is approved, the employee should be notified of approval and next payment-processing status.

## Open Questions
- Should notifications be in-app only, email, or both?
- Should employees receive notifications at each approval step or only final decision?
- Should overdue request alerts be configurable by department?
