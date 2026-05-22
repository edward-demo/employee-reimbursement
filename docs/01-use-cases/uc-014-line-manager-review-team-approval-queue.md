# UC-014: Line Manager Review Team Approval Queue

## Primary Actor
Line Manager

## Goal
Find and access reimbursement requests submitted by team members.

## Source Evidence
- src/app/components/LineManagerDashboard.tsx

## Trigger
The line manager opens the Line Manager Portal after being routed to LineManagerDashboard. This may occur through Line Manager access or through the Admin login fallback defined by the authentication use cases.

## Preconditions
- User is authenticated.
- `employee_profiles.is_line_manager = true`.
- User is routed to LineManagerDashboard.
- The `is_line_manager` flag grants Line Manager access only and does not grant Admin Dashboard access unless the user is separately assigned admin role.

## Main Flow
1. The system displays the Line Manager Portal header with the line manager profile summary and logout action.

2. The system displays the Overview and Profile tabs.

3. On the Overview tab, the system displays reimbursement requests for the line manager's assigned team members.

4. The system displays a pending approvals count that includes only actionable requests awaiting Line Manager review. Actionable requests are Pending requests assigned to the line manager for review and exclude requests already signed off, denied, or awaiting HR/Admin review.

5. The system displays request cards with:
   - Employee name
   - Employee ID
   - Department
   - Reimbursement category or type, if applicable
   - Item or medicine count
   - Receipt count
   - Total amount
   - Submitted date
   - Notes, if any
   - Status badge

6. When Team Insights are included in the queue view, the system summarizes only team reimbursement activity within the line manager's assigned team scope. If there is no activity to summarize, the system shows zero or empty summary values.

7. The line manager searches by employee name or request ID.

8. The line manager filters by type or category, status, and department.

9. The system applies all search and filter criteria only within the line manager's assigned team scope.

10. The system displays up to 10 request cards per page.

11. If more than 10 matching requests exist, the system provides paginated page navigation rather than a load-more interaction.

12. When the line manager changes search or filter criteria, the system resets the queue to page 1 before displaying the matching results.

13. If search or filter criteria reduce the matching results to zero, including from a later page, the system resets to page 1 and displays the empty state.

14. The line manager selects a visible request card.

15. The system displays the full details of the selected request. See UC-[X]: View Request Details.

## Display States
- While pending team requests are being loaded, the system displays a loading state.
- If pending team requests fail to load, the system displays an error state separate from the empty state.
- If pending team requests load successfully but no matching pending requests exist, the system displays an empty state below the search and filter controls.
- If there are no pending team reimbursement requests awaiting review, the dashboard displays an empty state.
- The pending count badge reflects the loaded actionable pending request count and shows "0 pending" when no actionable pending requests exist.
- The empty state is not treated as an error and is not shown while pending requests are still loading.

## Postconditions
- The queue displays only request cards that match the current team scope, search criteria, filter criteria, and pagination state.
- If the line manager selects a request card, the selected request is passed to the View Request Details use case.
