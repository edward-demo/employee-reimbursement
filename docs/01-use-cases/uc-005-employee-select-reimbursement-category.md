# UC-005: Employee Select Reimbursement Category

## Primary Actor
Employee

## Goal
Choose whether a new reimbursement request is for medicine or optical items.

## Source Evidence
- src/app/components/EmployeeDashboard.tsx
- src/app/App.tsx

## Trigger
The employee clicks New Reimbursement Request or New Request.

## Main Flow
1. The system opens a category selection modal.
2. The system presents Medicine and Optical options.
3. The employee selects one category.
4. The system closes the modal.
5. The system routes the employee to the matching reimbursement form.

## Alternate Flow
The employee cancels the modal and remains on the dashboard.

## Postconditions
The employee is routed to the selected reimbursement submission form and can begin entering request details.
