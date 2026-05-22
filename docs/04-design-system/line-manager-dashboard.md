# Line Manager Dashboard

## Purpose
Define Line Manager Dashboard UI behavior that is too detailed for business use cases but must remain consistent across implementation and review.

## Reimbursement Requests Empty and Error States

The Line Manager Dashboard must distinguish between a successful empty result and a failed data load.

### Empty State

Show this state only when the team requests query succeeds and returns zero actionable pending requests.

Copy:

- Title: You're all caught up
- Supporting text: There are no team reimbursement requests awaiting your review right now.

Visual treatment:

- Use a neutral empty-state icon, such as Inbox, Clipboard, FileCheck, or InboxOpen.
- Use muted gray/neutral tones.
- Do not use red warning icons, red borders, or error-colored backgrounds.
- Keep spacing consistent with the populated request list area.

### Error State

Show this state only when the team requests query fails.

User-facing message:

We couldn't load team requests right now. Please refresh the page or try again shortly.

Rules:

- Do not expose database, enum, Supabase, or internal technical error messages to users.
- Log technical errors internally using `console.error` or the project's existing logging pattern.
- Do not show the empty state if the query failed.
- Do not show the error state if the query succeeds and returns zero rows.
