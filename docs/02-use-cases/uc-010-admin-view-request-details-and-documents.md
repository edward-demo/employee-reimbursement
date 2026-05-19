# UC-010: Admin View Request Details and Documents

## Primary Actor
Admin

## Goal
Inspect a reimbursement request before making a decision.

## Source Evidence
- src/app/components/AdminDashboard.tsx

## Trigger
The admin selects View Full Details on a request.

## Main Flow
1. The system opens a request details dialog.
2. The system displays employee information and submitted date.
3. The system displays uploaded prescription and receipt records.
4. The system shows invoice numbers and PWD-related deductions when present.
5. The admin previews or downloads supporting documents.
6. The system displays medicine or item breakdown and totals.
7. The system displays submitted notes and remarks when present.

## Postconditions
The admin has enough detail to approve, deny, or continue reviewing the request.
