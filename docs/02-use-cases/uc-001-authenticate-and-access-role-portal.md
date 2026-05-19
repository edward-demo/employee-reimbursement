# UC-001: Authenticate and Access Role Portal

## Primary Actor
Employee, Admin, or Line Manager

## Goal
Access the correct portal for the user's role.

## Source Evidence
- src/app/App.tsx
- src/app/components/LoginScreen.tsx

## Trigger
The user opens MedReimburse and chooses a role-based login action.

## Main Flow
1. The user enters or reviews login credentials.
2. The user selects the relevant role login action.
3. The system stores the selected role.
4. The system routes the user to the matching portal.
5. The system shows a success notification.

## Postconditions
The user is viewing the employee, admin, or line-manager dashboard.

## Notes
The current mockup exposes employee and admin buttons on the login screen and line-manager access through the mockup viewer.
