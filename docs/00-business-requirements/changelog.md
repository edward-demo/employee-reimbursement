# Business Requirements Changelog

## 2026-05-21

- Added session-expiration and invalid-session user-facing behavior to the active BRD and UC-001, including the login-screen return and sign-in-again message.
- Updated remaining medicine-only BRD wording in employee request details, UI deletion rules, file structure notes, sample request flow, calculation examples, and glossary definitions to describe category-aware reimbursement behavior for Medicine and Optical.
- Archived the pre-update active BRD at `docs/00-business-requirements/archive/BUSINESS_REQUIREMENTS_v1.0_2026-05-21.md`.
- Updated the active BRD to version 1.1 and refreshed the top-level scope from medicine-only reimbursement to Employee Reimbursement covering Medicine and Optical reimbursement categories.
- Clarified separate standard annual limits: Medicine Reimbursement at PHP 10,000 and Optical Reimbursement at PHP 5,000.
- Added category-aware dashboard, admin overview, request card, request detail, and reporting requirements.
- Added BRD clarification items for future provider integrations, automated prescription validation scope, and category-aware request-detail labels.
- Updated UC-002 to state the Medicine and Optical standard annual limits used by the employee benefits dashboard.
- Clarified the staged reimbursement review workflow across the BRD and use cases: submitted requests begin in Line Manager review, Line Manager sign-off is required before HR/Admin review, and HR/Admin approval or denial is the final decision.
- Updated BRD Admin Dashboard requirements, request status labels, glossary language, and schema-aligned workflow notes to distinguish Pending Line Manager Review from Approved by LM/Pending HR Review.
- Updated employee submission and Line Manager review use cases to route submitted requests to Line Manager review first and to describe the Line Manager action as sign-off for HR/Admin review.
- Updated the Admin Dashboard behavior to distinguish requests awaiting Line Manager review from requests ready for HR/Admin review, show HR/Admin attention items only after Line Manager sign-off, and use stage-aware pending labels.
- Replaced the legacy medicine-only BRD schema section with high-level business data requirements and references to the current data model, schema, database map, and migrations.
- Updated BRD business rules to require reimbursement line items instead of medicine-only entries and to calculate totals from line item subtotals plus receipt-level deductions.
- Aligned BRD reimbursement-limit business rules with separate Medicine and Optical annual limits.
- Clarified employee-visible reimbursement status labels and role-specific pending dashboard counts for Line Manager and HR/Admin review queues.
- Clarified that requests already signed off by a Line Manager remain visible in the Line Manager view but are no longer actionable while awaiting HR/Admin review.
- Aligned UC-002 Employee View Benefits Dashboard with BRD dashboard requirements for overview statistics, separate Medicine and Optical balances, latest 2 submitted requests, employee-visible status labels, new request access, and real-time statistics refresh.
- Clarified Optical reimbursement submission requirements for prescription or supporting document file count, submission confirmation, and UC-007 alignment.

## 2026-05-12

- Set up `docs/00-business-requirements/` as the dedicated version-control directory for the active BRD, changelog, and archived versions.
- Added the initial archived BRD copy at `docs/00-business-requirements/archive/BUSINESS_REQUIREMENTS_v1.0_2026-05-12.md`.
