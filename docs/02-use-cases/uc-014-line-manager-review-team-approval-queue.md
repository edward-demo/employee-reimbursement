# UC-014: Line Manager Review Team Approval Queue

## Primary Actor
Line Manager

## Goal
Find and review reimbursement requests submitted by team members.

## Source Evidence
- src/app/components/LineManagerDashboard.tsx

## Trigger
The line manager opens the Line Manager Portal.

## Main Flow
1. The system displays pending approvals, approved count, declined count, and pending amount.
2. The line manager searches by employee name or request ID.
3. The line manager filters by status and amount range.
4. The system displays matching team requests.
5. The line manager opens request details.
6. The system displays employee information, item breakdown, receipts, notes, and total amount.

## Postconditions
The line manager has identified the request to approve or decline.
