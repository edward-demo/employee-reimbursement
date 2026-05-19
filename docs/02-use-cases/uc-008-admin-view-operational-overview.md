# UC-008: Admin View Operational Overview

## Primary Actor
Admin

## Goal
Monitor current reimbursement activity by category and status.

## Source Evidence
- src/app/components/AdminDashboard.tsx

## Trigger
The admin opens the Admin Dashboard Overview tab.

## Main Flow
1. The system displays medicine approved, pending, and denied counts.
2. The system displays optical approved, pending, and denied counts.
3. The system displays medicine and optical reimbursed totals.
4. The system highlights recent pending activity requiring attention.
5. The admin can move from recent activity into request review.

## Postconditions
The admin has a current operational snapshot of reimbursement activity.
