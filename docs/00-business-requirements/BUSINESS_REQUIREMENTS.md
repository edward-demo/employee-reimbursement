# Employee Reimbursement HRIS System
## Business Requirements Document (BRD)

**Document Version:** 1.4  
**Last Updated:** May 22, 2026  
**Project Name:** MedReimburse  

---

## 1. Executive Summary

### 1.1 Project Overview
MedReimburse is a web-based Human Resources Information System (HRIS) designed to streamline employee reimbursement for supported benefit categories. The current scope supports Medicine Reimbursement and Optical Reimbursement. The system enables employees to submit reimbursement requests, routes requests first to the employee's line manager for sign-off, then allows HR/Admin personnel to make the final approval or denial decision efficiently.

### 1.2 Business Objectives
- Automate the Medicine and Optical reimbursement submission and approval process
- Reduce processing time for reimbursement requests from days to hours
- Provide transparency in reimbursement status tracking
- Ensure compliance with PWD (Person with Disability) benefit regulations
- Generate comprehensive reports for financial planning and analysis
- Maintain accurate records of all reimbursement transactions

### 1.3 Target Users
- **Employees:** Submit and track Medicine and Optical reimbursement requests
- **Line Managers:** Review reimbursement requests submitted by assigned team members. Line Managers can sign off requests for HR/Admin review or deny requests before HR/Admin review.
- **HR/Admin Personnel:** Review line-manager-approved requests, approve or deny reimbursement requests, and generate reports

---

## 2. System Scope

### 2.1 In Scope
- Employee reimbursement request submission with document upload
- Medicine and Optical reimbursement categories
- Multiple line items per reimbursement request
- Multi-receipt support for a single request
- PWD discount tracking per receipt
- Admin dashboard for request review and approval
- Department-based filtering and analytics
- Real-time request status tracking for submitted requests, including statuses shown in request lists and recent request cards
- Annual reimbursement limit tracking
- Document preview functionality
- Report generation and analytics

### 2.2 Out of Scope
- Payment processing integration (Phase 2)
- Mobile application (Phase 2)
- Integration with external provider systems, including pharmacy and optical systems (Phase 2)
- Automated prescription validation (Phase 2)
- Email notifications (Phase 2)

---

## 3. User Roles & Permissions

### 3.1 Employee Role
**Permissions:**
- Submit new reimbursement requests
- Upload prescription and receipt documents
- View own reimbursement history
- Track reimbursement status
- View remaining annual balance
- View personal profile information

**Restrictions:**
- Cannot view other employees' requests
- Cannot approve or deny requests
- Cannot access system-wide analytics

### 3.2 HR/Admin Role
**Access Rule:**
- Admin Dashboard access requires an assigned admin role from `user_roles` / `roles`.
- `employee_profiles.is_line_manager = true` must not grant Admin Dashboard access unless the user is also separately assigned the admin role.
- If a valid Line Manager user selects the Admin login option but does not have an assigned admin role, the system routes the user to LineManagerDashboard instead of granting Admin Dashboard access.
- If a user selects the Admin login option and has neither an assigned admin role nor `employee_profiles.is_line_manager = true`, Admin access is denied.
- If a fallback message is shown, it shall read: "You do not have Admin access. Redirecting to the Line Manager Dashboard."

**Permissions:**
- View all reimbursement requests across departments
- Approve or deny pending requests after line-manager sign-off
- Add remarks/comments to requests
- Filter requests by status and department
- View detailed request information including documents
- Generate reports and analytics
- Download request data
- View department-wide statistics

**Restrictions:**
- Cannot submit requests on behalf of employees
- Cannot modify approved/denied requests

### 3.3 Line Manager Role
**Access Rule:**
- Line Manager Dashboard access requires `employee_profiles.is_line_manager = true`.
- The `employee_profiles.is_line_manager` flag grants Line Manager access only and must not grant Admin Dashboard access.
- Line Managers are not HR/Admin users unless they are separately assigned the admin role.

**Permissions:**
- View reimbursement requests for assigned team members
- Sign off pending team requests for HR/Admin review
- Deny pending team requests with a reason

**Restrictions:**
- Cannot make the final HR/Admin approval or denial decision
- Cannot view requests outside assigned team scope
- Requests already signed off by the Line Manager and displaying Approved by LM • Pending HR Review remain visible to the Line Manager but are no longer actionable by the Line Manager

---

## 4. Functional Requirements

### 4.1 Employee Portal

#### 4.1.1 Dashboard
- **FR-E-001:** Display overview statistics (Total Requests, Reimbursement Balance, Pending Review)
- **FR-E-002:** Show separate annual reimbursement limits for Medicine Reimbursement (₱10,000.00) and Optical Reimbursement (₱5,000.00)
- **FR-E-003:** Display remaining balance after approved reimbursements for each reimbursement category
- **FR-E-004:** Show total amount used in the current year for each reimbursement category
- **FR-E-005:** Display recent requests (latest 2 submissions)
- **FR-E-006:** Provide quick access to "New Reimbursement Request" action
- Dashboard totals, balances, counts, and summary statistics are loaded when the employee opens or manually refreshes/reloads the dashboard. Request statuses shown in employee request lists or recent request cards update in real time when the status of the employee's submitted request changes.

#### 4.1.2 Profile Tab
- **FR-E-007:** Display employee information (Name, ID, Designation, Department, Email)
- **FR-E-008:** Show employee identification details in read-only format

#### 4.1.3 My Requests Tab
- **FR-E-009:** List all reimbursement requests submitted by the employee
- **FR-E-010:** Display request details: reimbursement category, item name or category-appropriate item label, quantity, total amount, status, and submitted date.
- **FR-E-011:** Show employee-visible status badges with visual indicators for Pending, Approved by LM • Pending HR Review, Approved by HR, and Denied
- **FR-E-012:** Display admin remarks for each request
- **FR-E-013:** Provide "New Request" button for quick submission

#### 4.1.4 New Reimbursement Request
- **FR-E-014:** The dashboard "New Reimbursement Request" action shall allow the employee to start a new request by selecting a supported reimbursement category.
- **FR-E-014a:** Selecting Medicine opens the Medicine reimbursement submission experience.
- **FR-E-014b:** Selecting Optical opens the Optical reimbursement submission experience.
- **FR-E-014c:** Upload prescription document (required, PDF format)
- **FR-E-014d:** For Medicine and Optical reimbursement requests, each prescription or supporting document file must be no larger than 10MB. For Optical reimbursement requests, the employee may upload at least one and up to three prescription or supporting document files.
- **FR-E-015:** Add one or more category-specific line items to a single request.
- **FR-E-016:** For each line item: Enter item name, quantity, and unit price.
- **FR-E-017:** Calculate subtotal per line item automatically.
- **FR-E-018:** Upload multiple official receipts (one or more required)
- **FR-E-018a:** For Medicine and Optical reimbursement requests, each official receipt file must be no larger than 10MB.
- **FR-E-019:** For each receipt: Upload file, enter invoice number
- **FR-E-020:** Toggle PWD status per individual receipt
- **FR-E-021:** When PWD is enabled: Enter VAT exemption and PWD discount amounts
- **FR-E-022:** Edit invoice numbers inline with edit/save functionality
- **FR-E-023:** Add optional notes/comments to request
- **FR-E-024:** Display request summary showing:
  - All line items with quantities
  - Item subtotal
  - PWD deductions per receipt (if applicable)
  - Total PWD deductions
  - Final reimbursement amount
- **FR-E-025:** Calculate total reimbursement automatically
- **FR-E-026:** Validate all required fields before submission
- **FR-E-027:** Allow adding/removing line items (minimum 1 required)
- **FR-E-028:** Allow adding/removing receipts (minimum 1 required)

### 4.2 Admin Portal
**Access Precondition:**
- Only users with an assigned admin role may access the Admin Dashboard and Admin review/reporting features.
- Line Manager-only users must not access the Admin Dashboard unless they are separately assigned the admin role.
- Admin login fallback for valid Line Manager users routes only to LineManagerDashboard and does not authorize Admin Dashboard, Admin review, reporting, analytics, all-request views, or final approve/deny actions.

#### 4.2.1 Overview Tab
- **FR-A-001:** Display reimbursement statistics card with:
  - Approved by HR requests count by reimbursement category
  - Pending requests count by reimbursement category, based on the current reviewer's actionable queue: Line Managers see requests pending their own review, and HR/Admin personnel see only requests that have completed Line Manager sign-off and are pending HR/Admin review
  - Denied requests count by reimbursement category
  - Total reimbursed amount for the month by reimbursement category
  - Month-over-month growth percentage
- **FR-A-002:** Display department breakdown card with:
  - Bar chart showing Approved by HR count and total amount per department and reimbursement category
  - Dual Y-axis (count and amount in ₱)
  - Department summary table with request count and total amount by reimbursement category
- **FR-A-003:** Show recent activity with pending requests that have completed Line Manager sign-off and require HR/Admin attention
- **FR-A-004:** Display all five departments: Product Development, Finance, HR, Admin, IT Helpdesk
- Admin dashboard totals, counts, summary statistics, department summaries, and recent activity are loaded when HR/Admin opens or manually refreshes/reloads the dashboard.

#### 4.2.2 Requests Tab
- **FR-A-005:** List all reimbursement requests across all employees and departments
- **FR-A-006:** Filter requests by status (All Status, Pending, Approved by LM • Pending HR Review, Approved by HR, Denied)
- **FR-A-007:** Filter requests by department (All Departments, Product Development, Finance, HR, Admin, IT Helpdesk)
- **FR-A-008:** Apply multiple filters simultaneously
- **FR-A-009:** Display filter summary bar showing active filters and result count
- **FR-A-010:** Provide "Clear Filters" button when filters are active
- **FR-A-011:** Show empty state with clear action when no results match filters
- **FR-A-012:** Display request cards with:
  - Employee name, ID, and department
  - Reimbursement category
  - Total line items count
  - Total receipts count
  - Total amount
  - Submitted date
  - Status badge
  - Admin remarks (if any)
- **FR-A-013:** Provide "View Full Details" button for each request
- **FR-A-014:** For pending requests that have line-manager sign-off: Show "Approve" and "Deny" action buttons

#### 4.2.3 Request Details View
- **FR-A-015:** Display in responsive modal (960px minimum width on desktop)
- **FR-A-016:** Show employee information (Name, ID, Department, Submitted date)
- **FR-A-017:** List uploaded documents:
  - Prescription with preview and download options
  - All receipts with preview and download options
  - PWD badge for PWD-enabled receipts
  - Invoice numbers for each receipt
  - VAT exemption and PWD discount amounts per receipt
- **FR-A-018:** Display item breakdown with labels that adapt to the reimbursement category:
  - Item name, quantity, unit price, subtotal
  - Numbered list with visual indicators
- **FR-A-019:** Show financial summary:
  - Item subtotal
  - PWD deductions per receipt (with invoice number)
  - Total PWD deductions
  - Final reimbursement amount
- **FR-A-020:** Display additional notes from employee (if provided)
- **FR-A-021:** Show document preview panel:
  - Side-by-side on desktop (≥640px)
  - Overlay on mobile (<640px)
  - Preview prescription and receipts
  - Comparison checklist for verification
- **FR-A-022:** For pending requests that have Line Manager sign-off and are in HR/Admin review: provide "Approve Request" and "Deny Request" buttons

#### 4.2.4 Denial Process
- **FR-A-023:** Open denial dialog with reason selection
- **FR-A-024:** Provide predefined denial reasons:
  - Duplicate Application
  - Incomplete Details
  - Others (custom reason)
- **FR-A-025:** Display reason description for predefined options
- **FR-A-026:** For "Others": Require custom text input
- **FR-A-027:** Validate custom reason is not empty before allowing denial
- **FR-A-028:** Record denial reason with request

#### 4.2.5 Reports Tab
- **FR-A-029:** Display monthly summary card with:
  - Total reimbursed amount by reimbursement category
  - Total Approved by HR requests count by reimbursement category
  - "View Screenshot" option
  - "Download Report" option
- **FR-A-030:** Display department breakdown card with:
  - List of all departments with amounts by Medicine and Optical reimbursement category
  - "View Screenshot" option
  - "Export Details" option

### 4.3 Line Manager Portal
**Access and Routing:**
- Users with `employee_profiles.is_line_manager = true` route to `LineManagerDashboard` when using the Line Manager portal.
- Users with `employee_profiles.is_line_manager = true` also route to `LineManagerDashboard` when using the Admin login option without an assigned admin role.
- This flag grants Line Manager access only and does not grant Admin Dashboard access.

#### 4.3.1 Dashboard Shell
- **FR-LM-001:** The header shall identify the area as the Line Manager Portal and display the Line Manager's profile summary and logout action.
- **FR-LM-002:** The Line Manager Portal shall include Overview and Profile tabs.
- **FR-LM-003:** The Overview tab shall display reimbursement requests for the Line Manager's assigned team members.
- **FR-LM-004:** The Profile tab shall display Line Manager profile details, including name, designation, and department.

#### 4.3.2 Team Request List
- **FR-LM-005:** The request list shall include requests awaiting Line Manager review, requests already signed off by the Line Manager and pending HR/Admin review, and completed team requests when included by the current filters.
- **FR-LM-006:** Request cards shall display employee name, employee ID, department, reimbursement category or type when applicable, item or medicine count, receipt count, total amount, submitted date, notes when provided, and a status badge.
- **FR-LM-007:** Line Managers shall be able to open the full details for each visible team request.
- **FR-LM-008:** When filters return no matching requests, the portal shall show an empty state and provide a way to clear active filters.

#### 4.3.3 Filters and Scope
- **FR-LM-009:** The Line Manager request list shall support filtering by reimbursement type or category.
- **FR-LM-010:** The Line Manager request list shall support filtering by status.
- **FR-LM-011:** If a department filter is retained, it shall apply only within the Line Manager's assigned team scope.
- **FR-LM-012:** All Line Manager search and filter results shall remain limited to reimbursement requests for the Line Manager's assigned team members.

#### 4.3.4 Request Details
- **FR-LM-013:** Request details shall show employee information, submitted date, reimbursement category or type, uploaded documents and receipts, item breakdown, financial summary, employee notes when provided, current status, and available actions.
- **FR-LM-014:** Document and receipt details shall include enough information for Line Manager review, including receipt file references and invoice numbers.
- **FR-LM-015:** Completed or denied requests shall show applicable approval or denial information, including denial reason when available.

#### 4.3.5 Status Badges
- **FR-LM-016:** Pending means the request is awaiting Line Manager review.
- **FR-LM-017:** Approved by LM • Pending HR Review means Line Manager sign-off is complete and the request is awaiting HR/Admin final review.
- **FR-LM-018:** Approved by HR means the request has been finally approved by HR/Admin.
- **FR-LM-019:** Denied means the request was denied either by the Line Manager before HR/Admin review or by HR/Admin during final review, unless the business later chooses to distinguish denial sources.

#### 4.3.6 Line Manager Actions
- **FR-LM-020:** For requests awaiting Line Manager review, the portal shall show "Sign Off for HR/Admin Review" and "Deny Request" actions.
- **FR-LM-021:** Line Manager action wording shall use "Sign Off for HR/Admin Review" and must not use "Approve Request" for Line Manager sign-off, because Line Manager sign-off is not final approval.
- **FR-LM-022:** Selecting "Sign Off for HR/Admin Review" shall record the Line Manager's sign-off and route the request to HR/Admin for final review.
- **FR-LM-023:** Selecting "Deny Request" shall require the Line Manager to provide a reason and shall deny the request before HR/Admin review.
- **FR-LM-024:** Signed-off requests with status Approved by LM • Pending HR Review shall remain visible to the Line Manager but shall be read-only from the Line Manager view and shall not display Line Manager action buttons.

#### 4.3.7 Counts, Alerts, and Team Insights
- **FR-LM-025:** Pending approvals count shall include only actionable requests awaiting Line Manager review.
- **FR-LM-026:** Requests already signed off by the Line Manager and pending HR/Admin review shall not be counted as actionable Line Manager approvals.
- **FR-LM-027:** Alerts may highlight time-sensitive team requests, such as overdue requests or newly submitted requests requiring Line Manager action.
- **FR-LM-028:** Team insights may summarize team reimbursement activity, such as monthly request volume, approved and denied counts, high-value claims, and frequent submitters.
- Line Manager dashboard totals, counts, queues, alerts, insights, and request summaries are loaded when the Line Manager opens or manually refreshes/reloads the dashboard.

---

## 5. Data Model and Schema References

### 5.1 Data Documentation Source of Truth

The BRD defines the business data requirements for MedReimburse. Detailed database design, table names, columns, constraints, indexes, views, and implementation-level schema decisions are maintained in:
- `docs/04-data-and-integrations/data-model.md`
- `docs/04-data-and-integrations/schema.md`
- `docs/04-data-and-integrations/database-map.md`
- `supabase/migrations/*`

If this BRD and the detailed data documentation conflict on implementation-level structure, the conflict must be reviewed before schema, SQL, policy, or application changes are made.

### 5.2 Business Data Requirements

The system must maintain business data for:
- Authenticated application users and their internal MedReimburse user identity.
- Employee profiles, departments, employment status, and line-manager relationships.
- Application access roles and line-manager access attributes.
- Medicine and Optical benefit plans, including standard annual limits.
- Employee enrollment in benefit plans for each plan year.
- Reimbursement requests for supported categories.
- Category-specific request line items for Medicine and Optical claims.
- Uploaded prescription, supporting document, and receipt metadata.
- Receipt invoice details and PWD-related deduction information.
- Line Manager sign-off, HR/Admin approval, HR/Admin denial, and Line Manager denial decisions.
- Request history, audit activity, real-time employee status updates for submitted requests, and reviewer notifications for newly submitted requests or requests requiring reviewer action.
- Dashboard and reporting summaries derived from request, employee, department, category, status, and decision data.

### 5.3 Category-Aware Request Model

Each reimbursement request must identify its reimbursement category. The current supported categories are:
- Medicine Reimbursement
- Optical Reimbursement

The request model must support a common reimbursement lifecycle for both categories:
- Employee submission.
- Pending status while the request is awaiting Line Manager review.
- Line Manager sign-off for HR/Admin review, or Line Manager denial with a required reason.
- Approved by LM • Pending HR Review status after Line Manager sign-off.
- HR/Admin final approval or denial after Line Manager sign-off.
- Real-time employee status tracking for submitted requests, including statuses shown in request lists and recent request cards.

The request model must support category-aware line items. Medicine claims and Optical claims may use different user-facing labels, but both must support item name, quantity, unit price, subtotal, and total reimbursement calculation.

### 5.4 Benefit Limits and Enrollment

The system must support separate annual reimbursement limits by category:
- Medicine Reimbursement: ₱10,000.00 annual limit.
- Optical Reimbursement: ₱5,000.00 annual limit.

Employee benefit enrollment must confirm that an employee is eligible for a benefit category in a plan year. Current business rules use the standard annual limits defined by the benefit plan.

### 5.5 Document and Receipt Data Requirements

Each reimbursement request must include required supporting documents and at least one official receipt. Document and receipt data must support:
- Prescription or supporting document upload metadata.
- Official receipt upload metadata.
- Invoice or receipt number per receipt.
- PWD status per receipt.
- VAT exemption and PWD discount amount per receipt when applicable.
- Secure review access for Line Manager and HR/Admin workflows.

### 5.6 Calculation and Reporting Requirements

The system must calculate reimbursement amounts from request line items and applicable receipt-level deductions.

Approved by HR requests must reduce the employee's remaining balance only for the matching reimbursement category and plan year. Pending, Approved by LM • Pending HR Review, and denied requests must not reduce the remaining balance.

Dashboard and reporting metrics must be derived from current request, employee, department, category, status, decision, and amount data when the relevant dashboard, report, or summary is opened or manually refreshed/reloaded. Real-time recalculation of dashboard totals, balances, counts, and summary statistics is not required. Reports must support department and reimbursement-category views for Medicine and Optical reimbursement activity.

---

## 6. Business Rules

### 6.1 Reimbursement Limits
- **BR-001:** Each employee has separate annual reimbursement limits by category: Medicine Reimbursement at ₱10,000.00 and Optical Reimbursement at ₱5,000.00.
- **BR-002:** Limit resets on January 1st of each year
- **BR-003:** Only Approved by HR requests count toward the annual limit
- **BR-004:** Pending, Approved by LM • Pending HR Review, and denied requests do not affect the balance

### 6.2 PWD (Person with Disability) Benefits
- **BR-005:** PWD status is tracked per receipt, not per request
- **BR-006:** A single request can have both PWD and non-PWD receipts
- **BR-007:** PWD receipts can have VAT exemption and/or PWD discount
- **BR-008:** PWD deductions are subtracted from the item subtotal to calculate the final reimbursement amount.
- **BR-009:** Both VAT exemption and PWD discount are optional even when PWD is enabled
- **BR-010:** PWD deductions are displayed separately per receipt in the request financial summary.

### 6.3 Request Submission
- **BR-011:** Employees can submit reimbursement requests with one or more category-specific line items.
- **BR-012:** Multiple receipts can be uploaded for a single request (different pharmacies)
- **BR-013:** Each receipt must have a unique invoice number within the request
- **BR-014:** Prescription document is mandatory for all requests
- **BR-014a:** Optical reimbursement requests require at least one prescription or supporting document and may include up to three prescription or supporting document files.
- **BR-015:** At least one receipt is mandatory for all requests
- **BR-016:** At least one reimbursement line item must be specified.
- **BR-017:** All line item names, quantities, and prices must be filled before submission.
- **BR-017a:** Before submission, the employee must confirm that the submitted reimbursement information is true and correct.

### 6.4 Request Review
- **BR-018:** Request review follows a two-stage flow: Employee submits request → Line Manager signs off or denies → HR/Admin approves or denies only after Line Manager sign-off. Line-manager sign-off is required before HR/Admin approval or denial.
- **BR-019:** Line Manager sign-off sends the request to HR/Admin review and is not final approval.
- **BR-019a:** HR/Admin personnel can make the final approval or denial decision only when the request is pending and has completed Line Manager sign-off. HR/Admin approval is the final reimbursement approval.
- **BR-020:** Once finally approved by HR/Admin or denied by either reviewer stage, requests cannot be modified.
- **BR-021:** HR/Admin denial requires a reason, and Line Manager denial requires a reason before the request can be denied prior to HR/Admin review.
- **BR-022:** Approved by HR requests are recorded with approver ID and approval timestamp
- **BR-023:** Denied requests are recorded with reviewer ID, denial source, denial reason, and review timestamp so decision history identifies whether denial was by Line Manager or HR/Admin.
- **BR-024:** Line-manager sign-off is recorded with the line manager ID and timestamp while the request remains pending for HR/Admin review
- **BR-025:** Line Managers may sign off or deny only requests awaiting Line Manager review. Once a request is signed off and displays Approved by LM • Pending HR Review, the request remains visible to the Line Manager but is read-only from the Line Manager view and no longer displays Line Manager action buttons.

### 6.5 Department Structure
- **BR-026:** Five departments are supported: Product Development, Finance, HR, Admin, IT Helpdesk
- **BR-027:** Each employee belongs to exactly one department
- **BR-028:** Department analytics aggregate by these five departments only

---

## 7. Non-Functional Requirements

### 7.1 Performance
- **NFR-001:** Page load time shall not exceed 3 seconds under normal conditions
- **NFR-002:** Request submission shall complete within 5 seconds
- **NFR-003:** Reimbursement file uploads for Medicine and Optical requests shall support prescription, supporting document, and receipt files up to 10MB each.
- **NFR-004:** Dashboard totals, balances, counts, and summary statistics shall load when the user opens or manually refreshes/reloads the dashboard. Real-time recalculation of dashboard totals or statistics is not required. Employees shall receive real-time updates when the status of their submitted requests changes, including statuses shown in request lists or recent request cards. Reviewer notifications may be real-time for newly submitted requests or requests requiring reviewer action.

### 7.2 Security
- **NFR-005:** All user sessions shall be encrypted using HTTPS
- **NFR-006:** Employees can only view their own requests
- **NFR-007:** Document files shall be stored securely with access controls
- **NFR-008:** User authentication required for all portal access
- **NFR-009:** Role-based access control (RBAC) enforced for all operations
- **NFR-010:** QAT authentication shall use Supabase Auth as the credential and session provider
- **NFR-011:** The later internal-site deployment shall support Windows Active Directory as the authentication provider
- **NFR-012:** Application authorization, ownership, decisions, and audit records shall reference internal user records rather than provider-specific authentication records
- **NFR-012a:** When a user is automatically signed out due to session expiration, inactivity, or an invalid session, the system shall return the user to the login screen and display a clear message explaining that the session expired and the user must sign in again.

### 7.3 Usability
- **NFR-013:** System shall be responsive and work on desktop (≥640px) and mobile (<640px)
- **NFR-014:** Document preview shall adapt: side-by-side on desktop, overlay on mobile
- **NFR-015:** All forms shall provide inline validation and error messages
- **NFR-016:** Status changes shall be visually indicated with color-coded badges
- **NFR-017:** Philippine Peso (₱) currency symbol shall be used throughout

### 7.4 Accessibility
- **NFR-018:** System shall follow WCAG 2.1 Level AA standards
- **NFR-019:** All interactive elements shall be keyboard accessible
- **NFR-020:** Color indicators shall be supplemented with icons

### 7.5 Data Integrity
- **NFR-021:** All financial calculations shall be accurate to 2 decimal places
- **NFR-022:** File uploads shall be validated for accepted format and maximum size before submission.
- **NFR-023:** All database transactions shall be atomic (ACID compliant)

---

## 8. User Interface Requirements

### 8.1 Design System

#### 8.1.1 Color Palette
```
Primary:   #6E0F86 (Purple - main brand color)
Secondary: #F165E3 (Pink - accent color)
Tertiary:  #E1B3CE (Light Pink - muted/background)
Success:   #16A34A (Green - approved status)
Warning:   #CA8A04 (Yellow - pending status)
Error:     #DC2626 (Red - denied status)
Background: #FFFFFF (White)
Text:      #000000 (Black - primary text)
Muted:     #6B7280 (Gray - secondary text)
```

#### 8.1.2 Component Standards
- **Buttons:** Height 40px, Border radius 20px
- **Tabs:** Height 40px, Border radius 20px
- **Cards:** Border radius 16px, Box shadow: 0px 3px 16px #BFBFBF29
- **Typography:** Default system fonts, responsive sizing
- **Spacing:** Consistent padding and margins using Tailwind spacing scale

#### 8.1.3 Status Badges
- **Pending:** Yellow background (#CA8A04/10%), Yellow text (#CA8A04), Yellow border, Clock icon, indicating the request is awaiting Line Manager review
- **Approved by LM • Pending HR Review:** Pending badge style with label indicating Line Manager sign-off is complete and HR/Admin final review is pending. Line Manager sign-off is not final approval.
- **Approved by HR:** Green background (#16A34A/10%), Green text (#16A34A), Green border, CheckCircle icon, indicating final HR/Admin approval
- **Denied:** Red background (#DC2626/10%), Red text (#DC2626), Red border, XCircle icon, indicating the request was denied by either the Line Manager before HR/Admin review or by HR/Admin during final review, with denial source recorded in decision/history data
- **PWD:** Blue background (#3B82F6/10%), Blue text (#3B82F6), Blue border

### 8.2 Navigation
- **Role-to-dashboard routing:**
  - Employee → Employee Dashboard
  - Admin with assigned admin role → Admin Dashboard
  - Admin login without assigned admin role but with `employee_profiles.is_line_manager = true` → LineManagerDashboard
  - Admin login without assigned admin role and without `employee_profiles.is_line_manager = true` → access denied
  - Line Manager → LineManagerDashboard, if a Line Manager login path is documented
- **UI-001:** Employee portal shall have 3 tabs: Overview, Profile, My Requests
- **UI-002:** Admin portal shall have 3 tabs: Overview, Requests, Reports
- **UI-003:** Line Manager portal shall have 2 tabs: Overview and Profile
- **UI-004:** Active tab shall be visually distinguished with primary color background
- **UI-005:** Header shall display user name, role, and logout button

### 8.3 Forms
- **UI-006:** Required fields shall be marked with asterisk (*)
- **UI-007:** Form validation errors shall appear inline below fields
- **UI-008:** File upload areas shall show drag-and-drop support
- **UI-009:** Calculated fields (subtotals, totals) shall update in real-time
- **UI-010:** Reimbursement item cards and receipt cards shall be deletable if more than one exists.

---

## 9. Technical Stack

### 9.1 Frontend
- **Framework:** React 18+ with TypeScript
- **Styling:** Tailwind CSS v4.0
- **UI Components:** Radix UI primitives
- **Charts:** Recharts library
- **Icons:** Lucide React
- **Build Tool:** Vite

### 9.2 Component Libraries
- **Form Handling:** React Hook Form v7.55.0
- **State Management:** React useState/useContext
- **Routing:** React Router (for multi-page navigation)

### 9.3 File Structure
```
src/
├── app/
│   ├── App.tsx                    # Main entry point
│   └── components/
│       ├── AdminDashboard.tsx     # Admin portal
│       ├── EmployeeDashboard.tsx  # Employee portal
│       ├── ReimbursementForm.tsx  # Request submission form
│       ├── ComponentLibrary.tsx   # Reusable components showcase
│       ├── library/
│       │   ├── MedicineCard.tsx   # Current implementation component for reimbursement item input
│       │   ├── RequestCard.tsx    # Request display card
│       │   └── StatusBadge.tsx    # Status indicator
│       └── ui/                    # Base UI components (Radix)
│           ├── button.tsx
│           ├── card.tsx
│           ├── dialog.tsx
│           ├── select.tsx
│           ├── tabs.tsx
│           └── ... (other UI primitives)
├── styles/
│   ├── theme.css                  # Design tokens
│   └── fonts.css                  # Font imports
└── imports/                       # Static assets
```

---

## 10. Assumptions & Dependencies

### 10.1 Assumptions
- Employees have valid company email addresses for authentication
- QAT users will authenticate through Supabase Auth
- Internal-site users will authenticate through Windows Active Directory after migration
- The reimbursement system will keep an internal user record that maps to the current authentication provider identity
- Employees have access to digital copies of prescriptions and receipts
- HR/Admin personnel have proper training on reimbursement policies
- File storage system is available for document uploads
- Users have modern web browsers (Chrome, Firefox, Safari, Edge - latest versions)

### 10.2 Dependencies
- Supabase Auth for QAT authentication
- Windows Active Directory integration for the later internal-site deployment
- File storage service (local or cloud)
- Database server (PostgreSQL, MySQL, or similar)
- HTTPS/SSL certificates for production
- Email service for notifications (Phase 2)

### 10.3 Clarifications Needed
- Confirm whether future external provider integrations should include only pharmacies or should also include optical clinics, optical shops, and other optical service providers.
- Confirm whether automated prescription validation should apply only to Medicine Reimbursement or should also apply to Optical Reimbursement prescriptions and supporting documents.
- Confirm the preferred request-detail display standard for category-aware item labels, including whether employee request lists should show category, item name, quantity, total amount, status, and submitted date.

---

## 11. Success Criteria

### 11.1 User Acceptance Criteria
- ✅ Employees can successfully submit reimbursement requests
- ✅ Employees receive real-time updates when the status of their submitted requests changes
- ✅ HR/Admin can review and process requests efficiently
- ✅ PWD discounts are accurately tracked per receipt
- ✅ Financial calculations are accurate to 2 decimal places
- ✅ Reports provide meaningful insights for decision-making
- ✅ System is responsive on both desktop and mobile devices

### 11.2 Performance Metrics
- Request submission completion rate > 95%
- Average request processing time < 24 hours
- System uptime > 99.5%
- User satisfaction score > 4.0/5.0
- Average page load time < 3 seconds

---

## 12. Future Enhancements (Phase 2)

### 12.1 Planned Features
- Email notifications for status changes
- SMS alerts for urgent approvals
- Migration from QAT Supabase Auth to internal Windows Active Directory authentication
- Integration with payroll system for automatic disbursement
- Mobile application (iOS and Android)
- OCR for automatic prescription data extraction
- Integration with partner pharmacies for direct billing
- Advanced analytics and forecasting
- Multi-currency support for international employees
- Batch approval for multiple requests
- Customizable approval workflows

### 12.2 Advanced Reporting
- Year-over-year trend analysis
- Predictive analytics for budget planning
- Employee health pattern insights (anonymized)
- Department cost center allocation
- Export to Excel/PDF with custom templates

---

## 13. Glossary

| Term | Definition |
|------|------------|
| **PWD** | Person with Disability - qualified individuals entitled to VAT exemption and discount benefits |
| **VAT Exemption** | Value-Added Tax exemption amount for PWD purchases |
| **PWD Discount** | Senior citizen or disability discount (typically 20% in the Philippines) |
| **Reimbursement** | The process of compensating an employee for eligible category-specific expenses incurred |
| **Annual Limit** | Maximum amount an employee can claim per calendar year for a reimbursement category. Current standard limits are ₱10,000.00 for Medicine Reimbursement and ₱5,000.00 for Optical Reimbursement. |
| **Invoice Number** | Unique identifier on an official receipt from a provider, pharmacy, optical clinic, optical shop, or other supported reimbursement source. |
| **Prescription** | Category-specific supporting document from a licensed provider, such as a medicine prescription or optical prescription, when required |
| **Official Receipt** | Proof of purchase document from a provider, pharmacy, optical clinic, optical shop, or other supported reimbursement source. |
| **Status** | Current state of request. Reimbursement status display labels are Pending, Approved by LM • Pending HR Review, Approved by HR, and Denied. |
| **Line Manager Sign-off** | Line Manager action that sends a team reimbursement request to HR/Admin final review. It is not final approval and does not reduce the employee's benefit balance. |
| **Approved by LM • Pending HR Review** | Status indicating Line Manager sign-off is complete and the request is awaiting HR/Admin final approval or denial. |
| **Approved by HR** | Status indicating final HR/Admin approval. Only Approved by HR requests reduce the employee's applicable benefit balance. |
| **Denied** | Status indicating denial by either Line Manager before HR/Admin review or by HR/Admin during final review. The display status may be Denied while decision/history data records the denial source. |
| **Department** | Organizational unit: Product Development, Finance, HR, Admin, IT Helpdesk |

---

## 14. Appendices

### Appendix A: Sample Request Flow

```
1. Employee submits request
   ├── Uploads prescription or category-specific supporting document
   ├── Adds reimbursement line items (item label, qty, price)
   ├── Uploads receipt(s)
   ├── Marks PWD status per receipt
   └── Enters PWD deductions if applicable

2. Line Manager reviews request
   ├── Views employee information
   ├── Reviews prescription and receipt summary
   └── Reviews request notes and supporting details

3. Line Manager signs off or denies
   ├── Selects "Sign Off for HR/Admin Review" to send the request to HR/Admin; sign-off is not final approval
   └── Or selects "Deny Request" to deny the request before HR/Admin review with a required reason

4. Signed-off request moves to HR/Admin review
   └── Status displays as Approved by LM • Pending HR Review

5. HR/Admin approves or denies
   ├── Reviews only signed-off requests
   ├── If approved: Updates status to Approved by HR, records approver, adds remarks
   └── If denied: Selects reason, adds custom text if needed, and records HR/Admin as the denial source

6. Employee sees updated status
   ├── Request status updates in real time in request lists and recent request cards
   ├── Can view approval/denial details
   └── Dashboard balances and totals reflect Approved by HR requests when the dashboard is loaded or manually refreshed/reloaded
```

Detailed validation at submission:

```
System validates request
   ├── Checks all required fields
   ├── Validates file formats
   ├── Calculates totals
   └── Creates request record with Pending status for Line Manager review
```

### Appendix B: Calculation Examples

**Example 1: Medicine Reimbursement Request (No PWD)**
```
Category: Medicine Reimbursement

Reimbursement line items:
- Paracetamol 500mg: 30 tablets × ₱15.00 = ₱450.00

Receipt (Pharmacy):
- Invoice: INV-2024-0001
- PWD: No

Total Reimbursement: ₱450.00
```

**Example 2: Medicine Reimbursement Request with PWD**
```
Category: Medicine Reimbursement

Reimbursement line items:
- Hypertension Medication: 30 tablets × ₱35.00 = ₱1,050.00
- Multivitamins: 60 capsules × ₱12.50 = ₱750.00
Subtotal: ₱1,800.00

Receipt (Pharmacy):
- Invoice: INV-2024-8888
- PWD: Yes
- VAT Exemption: ₱150.00
- PWD Discount: ₱90.00
Total Deductions: ₱240.00

Total Reimbursement: ₱1,800.00 - ₱240.00 = ₱1,560.00
```

**Example 3: Optical Reimbursement Request with Multiple Receipts**
```
Category: Optical Reimbursement

Reimbursement line items:
- Prescription eyeglass lenses: 1 pair × ₱2,500.00 = ₱2,500.00
- Eyeglass frame: 1 frame × ₱1,200.00 = ₱1,200.00
Subtotal: ₱3,700.00

Receipt 1 (Optical Clinic):
- Invoice: INV-2024-5678
- PWD: Yes
- VAT Exemption: ₱250.00
- PWD Discount: ₱200.00

Receipt 2 (Optical Shop):
- Invoice: INV-2024-5679
- PWD: No

Total PWD Deductions: ₱450.00

Total Reimbursement: ₱3,700.00 - ₱450.00 = ₱3,250.00
```

---

**Document Control:**
- **Author:** MedReimburse Project Team
- **Approved By:** [Pending]
- **Next Review Date:** [To be determined]
- **Change Log:** Version 1.0 - Initial document creation; Version 1.2 - Clarified Line Manager Admin-login fallback routing and two-stage request review flow; Version 1.3 - Defined Line Manager Portal dashboard contents, filters, statuses, actions, counts, alerts, and team insights; Version 1.4 - Resolved Line Manager access, Admin-login fallback, two-stage review, status-label, navigation, and sample-flow conflicts

**End of Business Requirements Document**
