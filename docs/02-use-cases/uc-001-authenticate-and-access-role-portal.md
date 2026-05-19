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
1. The user enters credentials or uses the available sign-in method for the current environment.
2. In QAT, Supabase Auth validates the user's credentials and returns an authenticated session.
3. In the later internal-site deployment, Windows Active Directory validates the user's identity.
4. The system resolves the authenticated provider identity to an internal user record.
5. The system loads the user's assigned role and employee profile context.
6. The system routes the user to the matching portal.
7. The system shows a success notification.

## Postconditions
The user is viewing the employee, admin, or line-manager dashboard.

## Notes
The current mockup exposes employee and admin buttons on the login screen and line-manager access through the mockup viewer.
The QAT build should replace mock role selection with Supabase-backed authentication while preserving internal role-based routing. The later internal-site migration should replace Supabase as the identity provider with Windows Active Directory without changing reimbursement ownership, decision, or audit records.
