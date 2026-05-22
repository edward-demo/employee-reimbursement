# Medicine Reimbursement HRIS System
## Business Requirements Document (BRD)

**Document Version:** 1.0  
**Last Updated:** May 12, 2026  
**Project Name:** MedReimburse  

---

## 1. Executive Summary

### 1.1 Project Overview
MedReimburse is a web-based Human Resources Information System (HRIS) designed to streamline the medicine reimbursement process for employees. The system enables employees to submit reimbursement requests for prescribed medications, routes requests first to the employee's line manager for sign-off, then allows HR/Admin personnel to make the final approval or denial decision efficiently.

### 1.2 Business Objectives
- Automate the medicine reimbursement submission and approval process
- Reduce processing time for reimbursement requests from days to hours
- Provide transparency in reimbursement status tracking
- Ensure compliance with PWD (Person with Disability) benefit regulations
- Generate comprehensive reports for financial planning and analysis
- Maintain accurate records of all reimbursement transactions

### 1.3 Target Users
- **Employees:** Submit and track medicine reimbursement requests
- **Line Managers:** Review and sign off or decline team reimbursement requests before HR/Admin review
- **HR/Admin Personnel:** Review line-manager-approved requests, approve or deny reimbursement requests, and generate reports

---

## 2. System Scope

### 2.1 In Scope
- Employee reimbursement request submission with document upload
- Multi-medicine support per single prescription
- Multi-receipt support for single request (different pharmacies)
- PWD discount tracking per receipt
- Admin dashboard for request review and approval
- Department-based filtering and analytics
- Real-time status tracking
- Annual reimbursement limit tracking
- Document preview functionality
- Report generation and analytics

### 2.2 Out of Scope
- Payment processing integration (Phase 2)
- Mobile application (Phase 2)
- Integration with external pharmacy systems (Phase 2)
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
**Permissions:**
- View reimbursement requests for assigned team members
- Sign off pending team requests for HR/Admin review
- Decline pending team requests with a reason

**Restrictions:**
- Cannot make the final HR/Admin approval or denial decision
- Cannot view requests outside assigned team scope

---

## 4. Functional Requirements

### 4.1 Employee Portal

#### 4.1.1 Dashboard
- **FR-E-001:** Display overview statistics (Total Requests, Reimbursement Balance, Pending Review)
- **FR-E-002:** Show annual reimbursement limit (₱10,000.00)
- **FR-E-003:** Display remaining balance after approved reimbursements
- **FR-E-004:** Show total amount used in current year
- **FR-E-005:** Display recent requests (latest 2 submissions)
- **FR-E-006:** Provide quick access to "New Reimbursement Request" action

#### 4.1.2 Profile Tab
- **FR-E-007:** Display employee information (Name, ID, Designation, Department, Email)
- **FR-E-008:** Show employee identification details in read-only format

#### 4.1.3 My Requests Tab
- **FR-E-009:** List all reimbursement requests submitted by the employee
- **FR-E-010:** Display request details: Medicine name, Quantity, Total amount, Status, Submitted date
- **FR-E-011:** Show status badges (Approved, Pending, Denied) with visual indicators
- **FR-E-012:** Display admin remarks for each request
- **FR-E-013:** Provide "New Request" button for quick submission

#### 4.1.4 New Reimbursement Request
- **FR-E-014:** Upload prescription document (required, PDF format)
- **FR-E-014a:** For medicine reimbursement requests, each prescription file must be no larger than 1MB
- **FR-E-015:** Add multiple medicines to single request
- **FR-E-016:** For each medicine: Enter name, quantity, unit price
- **FR-E-017:** Calculate subtotal per medicine automatically
- **FR-E-018:** Upload multiple official receipts (one or more required)
- **FR-E-018a:** For medicine reimbursement requests, each official receipt file must be no larger than 1MB
- **FR-E-019:** For each receipt: Upload file, enter invoice number
- **FR-E-020:** Toggle PWD status per individual receipt
- **FR-E-021:** When PWD is enabled: Enter VAT exemption and PWD discount amounts
- **FR-E-022:** Edit invoice numbers inline with edit/save functionality
- **FR-E-023:** Add optional notes/comments to request
- **FR-E-024:** Display request summary showing:
  - All medicines with quantities
  - Medicines subtotal
  - PWD deductions per receipt (if applicable)
  - Total PWD deductions
  - Final reimbursement amount
- **FR-E-025:** Calculate total reimbursement automatically
- **FR-E-026:** Validate all required fields before submission
- **FR-E-027:** Allow adding/removing medicines (minimum 1 required)
- **FR-E-028:** Allow adding/removing receipts (minimum 1 required)

### 4.2 Admin Portal

#### 4.2.1 Overview Tab
- **FR-A-001:** Display reimbursement statistics card with:
  - Approved requests count
  - Pending requests count
  - Denied requests count
  - Total reimbursed amount for the month
  - Month-over-month growth percentage
- **FR-A-002:** Display department breakdown card with:
  - Bar chart showing approved count and total amount per department
  - Dual Y-axis (count and amount in ₱)
  - Department summary table with request count and total amount
- **FR-A-003:** Show recent activity with pending requests requiring attention
- **FR-A-004:** Display all five departments: Product Development, Finance, HR, Admin, IT Helpdesk

#### 4.2.2 Requests Tab
- **FR-A-005:** List all reimbursement requests across all employees and departments
- **FR-A-006:** Filter requests by status (All Status, Pending, Approved, Denied)
- **FR-A-007:** Filter requests by department (All Departments, Product Development, Finance, HR, Admin, IT Helpdesk)
- **FR-A-008:** Apply multiple filters simultaneously
- **FR-A-009:** Display filter summary bar showing active filters and result count
- **FR-A-010:** Provide "Clear Filters" button when filters are active
- **FR-A-011:** Show empty state with clear action when no results match filters
- **FR-A-012:** Display request cards with:
  - Employee name, ID, and department
  - Total medicines count
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
- **FR-A-018:** Display medicines breakdown:
  - Medicine name, quantity, unit price, subtotal
  - Numbered list with visual indicators
- **FR-A-019:** Show financial summary:
  - Medicines subtotal
  - PWD deductions per receipt (with invoice number)
  - Total PWD deductions
  - Final reimbursement amount
- **FR-A-020:** Display additional notes from employee (if provided)
- **FR-A-021:** Show document preview panel:
  - Side-by-side on desktop (≥640px)
  - Overlay on mobile (<640px)
  - Preview prescription and receipts
  - Comparison checklist for verification
- **FR-A-022:** For pending requests: Provide "Approve Request" and "Deny Request" buttons

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
  - Total reimbursed amount
  - Total approved requests count
  - "View Screenshot" option
  - "Download Report" option
- **FR-A-030:** Display department breakdown card with:
  - List of all departments with amounts
  - "View Screenshot" option
  - "Export Details" option

---

## 5. Database Schema

### 5.1 Entity Relationship Overview

```
EMPLOYEES (1) ──────< (N) REIMBURSEMENT_REQUESTS
                              │
                              ├──< (N) MEDICINES
                              ├──< (N) RECEIPTS
                              └──< (N) REQUEST_HISTORY
```

### 5.2 Tables

#### 5.2.1 EMPLOYEES
```sql
TABLE: employees
─────────────────────────────────────────────────────────
Column Name          Type            Constraints
─────────────────────────────────────────────────────────
employee_id          VARCHAR(50)     PRIMARY KEY
full_name            VARCHAR(200)    NOT NULL
email                VARCHAR(200)    NOT NULL, UNIQUE
designation          VARCHAR(100)    NOT NULL
department           VARCHAR(100)    NOT NULL
annual_limit         DECIMAL(10,2)   NOT NULL DEFAULT 10000.00
created_at           TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
updated_at           TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
is_active            BOOLEAN         NOT NULL DEFAULT TRUE
─────────────────────────────────────────────────────────
INDEXES:
- idx_employees_department ON (department)
- idx_employees_email ON (email)
```

#### 5.2.2 REIMBURSEMENT_REQUESTS
```sql
TABLE: reimbursement_requests
─────────────────────────────────────────────────────────
Column Name          Type            Constraints
─────────────────────────────────────────────────────────
request_id           VARCHAR(50)     PRIMARY KEY
employee_id          VARCHAR(50)     NOT NULL, FOREIGN KEY → employees(employee_id)
prescription_file    VARCHAR(500)    NOT NULL (file path/URL)
notes                TEXT            NULL
total_amount         DECIMAL(10,2)   NOT NULL
status               VARCHAR(20)     NOT NULL DEFAULT 'pending'
                                     CHECK IN ('pending', 'approved', 'denied')
submitted_date       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
reviewed_date        TIMESTAMP       NULL
reviewed_by          VARCHAR(50)     NULL, FOREIGN KEY → employees(employee_id)
denial_reason        VARCHAR(50)     NULL CHECK IN ('duplicate', 'incomplete_details', 'others')
custom_denial_text   TEXT            NULL
remarks              TEXT            NULL
created_at           TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
updated_at           TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
─────────────────────────────────────────────────────────
INDEXES:
- idx_requests_employee ON (employee_id)
- idx_requests_status ON (status)
- idx_requests_submitted_date ON (submitted_date DESC)
- idx_requests_department ON (employee_id, status)
```

#### 5.2.3 MEDICINES
```sql
TABLE: medicines
─────────────────────────────────────────────────────────
Column Name          Type            Constraints
─────────────────────────────────────────────────────────
medicine_id          VARCHAR(50)     PRIMARY KEY
request_id           VARCHAR(50)     NOT NULL, FOREIGN KEY → reimbursement_requests(request_id)
medicine_name        VARCHAR(300)    NOT NULL
quantity             DECIMAL(10,2)   NOT NULL
unit_price           DECIMAL(10,2)   NOT NULL
subtotal             DECIMAL(10,2)   NOT NULL (computed: quantity * unit_price)
sequence_order       INTEGER         NOT NULL
created_at           TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
─────────────────────────────────────────────────────────
INDEXES:
- idx_medicines_request ON (request_id, sequence_order)
```

#### 5.2.4 RECEIPTS
```sql
TABLE: receipts
─────────────────────────────────────────────────────────
Column Name          Type            Constraints
─────────────────────────────────────────────────────────
receipt_id           VARCHAR(50)     PRIMARY KEY
request_id           VARCHAR(50)     NOT NULL, FOREIGN KEY → reimbursement_requests(request_id)
file_path            VARCHAR(500)    NOT NULL
invoice_number       VARCHAR(100)    NOT NULL
is_pwd               BOOLEAN         NOT NULL DEFAULT FALSE
vat_exemption        DECIMAL(10,2)   NULL DEFAULT 0.00
pwd_discount         DECIMAL(10,2)   NULL DEFAULT 0.00
sequence_order       INTEGER         NOT NULL
created_at           TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
updated_at           TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
─────────────────────────────────────────────────────────
INDEXES:
- idx_receipts_request ON (request_id, sequence_order)
- idx_receipts_invoice ON (invoice_number)
```

#### 5.2.5 REQUEST_HISTORY
```sql
TABLE: request_history
─────────────────────────────────────────────────────────
Column Name          Type            Constraints
─────────────────────────────────────────────────────────
history_id           VARCHAR(50)     PRIMARY KEY
request_id           VARCHAR(50)     NOT NULL, FOREIGN KEY → reimbursement_requests(request_id)
action               VARCHAR(50)     NOT NULL CHECK IN ('submitted', 'approved', 'denied', 'updated')
performed_by         VARCHAR(50)     NOT NULL, FOREIGN KEY → employees(employee_id)
previous_status      VARCHAR(20)     NULL
new_status           VARCHAR(20)     NULL
remarks              TEXT            NULL
timestamp            TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
─────────────────────────────────────────────────────────
INDEXES:
- idx_history_request ON (request_id, timestamp DESC)
- idx_history_timestamp ON (timestamp DESC)
```

### 5.3 Database Constraints & Business Rules

#### 5.3.1 Constraint Rules
- Each request must have at least one medicine
- Each request must have at least one receipt
- PWD discount fields (vat_exemption, pwd_discount) can only be non-zero when is_pwd = TRUE
- Total amount calculation: SUM(medicines.subtotal) - SUM(receipts.vat_exemption + receipts.pwd_discount)
- Employee annual limit is ₱10,000.00 per calendar year
- Invoice numbers must be unique per request (but can repeat across different requests)

#### 5.3.2 Validation Rules
- Prescription file must be PDF format
- Receipt files must be PDF or image format (JPG, PNG)
- Medicine quantity must be greater than 0
- Unit price must be greater than 0
- VAT exemption and PWD discount must be >= 0
- Total amount must be greater than 0 after all deductions
- Department must be one of: Product Development, Finance, HR, Admin, IT Helpdesk

---

## 6. Business Rules

### 6.1 Reimbursement Limits
- **BR-001:** Each employee has an annual reimbursement limit of ₱10,000.00
- **BR-002:** Limit resets on January 1st of each year
- **BR-003:** Only approved requests count toward the annual limit
- **BR-004:** Pending and denied requests do not affect the balance

### 6.2 PWD (Person with Disability) Benefits
- **BR-005:** PWD status is tracked per receipt, not per request
- **BR-006:** A single request can have both PWD and non-PWD receipts
- **BR-007:** PWD receipts can have VAT exemption and/or PWD discount
- **BR-008:** PWD deductions are subtracted from the medicines subtotal to calculate final reimbursement
- **BR-009:** Both VAT exemption and PWD discount are optional even when PWD is enabled
- **BR-010:** PWD deductions are displayed separately per receipt in financial summary

### 6.3 Request Submission
- **BR-011:** Employees can submit requests for one prescription with multiple medicines
- **BR-012:** Multiple receipts can be uploaded for a single request (different pharmacies)
- **BR-013:** Each receipt must have a unique invoice number within the request
- **BR-014:** Prescription document is mandatory for all requests
- **BR-015:** At least one receipt is mandatory for all requests
- **BR-016:** At least one medicine must be specified
- **BR-017:** All medicines, quantities, and prices must be filled before submission

### 6.4 Request Review
- **BR-018:** Line-manager sign-off is required before HR/Admin approval or denial
- **BR-019:** HR/Admin personnel can approve or deny requests only when the request is pending and has completed line-manager review
- **BR-020:** Once approved or denied, requests cannot be modified
- **BR-021:** Denial requires a reason (predefined or custom)
- **BR-022:** Approved requests are recorded with approver ID and approval timestamp
- **BR-023:** Denied requests are recorded with reviewer ID, denial reason, and review timestamp
- **BR-024:** Line-manager sign-off is recorded with the line manager ID and timestamp while the request remains pending for HR/Admin review

### 6.5 Department Structure
- **BR-024:** Five departments are supported: Product Development, Finance, HR, Admin, IT Helpdesk
- **BR-025:** Each employee belongs to exactly one department
- **BR-026:** Department analytics aggregate by these five departments only

---

## 7. Non-Functional Requirements

### 7.1 Performance
- **NFR-001:** Page load time shall not exceed 3 seconds under normal conditions
- **NFR-002:** Request submission shall complete within 5 seconds
- **NFR-003:** Medicine reimbursement file uploads (prescription/receipts) shall support files up to 1MB each
- **NFR-004:** Dashboard statistics shall refresh in real-time

### 7.2 Security
- **NFR-005:** All user sessions shall be encrypted using HTTPS
- **NFR-006:** Employees can only view their own requests
- **NFR-007:** Document files shall be stored securely with access controls
- **NFR-008:** User authentication required for all portal access
- **NFR-009:** Role-based access control (RBAC) enforced for all operations
- **NFR-010:** QAT authentication shall use Supabase Auth as the credential and session provider
- **NFR-011:** The later internal-site deployment shall support Windows Active Directory as the authentication provider
- **NFR-012:** Application authorization, ownership, decisions, and audit records shall reference internal user records rather than provider-specific authentication records

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
- **NFR-022:** File uploads shall be validated for format and size
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
- **Approved:** Green background (#16A34A/10%), Green text (#16A34A), Green border, CheckCircle icon
- **Pending:** Yellow background (#CA8A04/10%), Yellow text (#CA8A04), Yellow border, Clock icon
- **Denied:** Red background (#DC2626/10%), Red text (#DC2626), Red border, XCircle icon
- **PWD:** Blue background (#3B82F6/10%), Blue text (#3B82F6), Blue border

### 8.2 Navigation
- **UI-001:** Employee portal shall have 3 tabs: Overview, Profile, My Requests
- **UI-002:** Admin portal shall have 3 tabs: Overview, Requests, Reports
- **UI-003:** Active tab shall be visually distinguished with primary color background
- **UI-004:** Header shall display user name, role, and logout button

### 8.3 Forms
- **UI-005:** Required fields shall be marked with asterisk (*)
- **UI-006:** Form validation errors shall appear inline below fields
- **UI-007:** File upload areas shall show drag-and-drop support
- **UI-008:** Calculated fields (subtotals, totals) shall update in real-time
- **UI-009:** Medicine and receipt cards shall be deletable (if more than 1 exists)

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
│       │   ├── MedicineCard.tsx   # Medicine input card
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

---

## 11. Success Criteria

### 11.1 User Acceptance Criteria
- ✅ Employees can successfully submit reimbursement requests
- ✅ Employees can track request status in real-time
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
| **Reimbursement** | The process of compensating an employee for medical expenses incurred |
| **Annual Limit** | Maximum amount an employee can claim per calendar year (₱10,000.00) |
| **Invoice Number** | Unique identifier on official receipt from pharmacy |
| **Prescription** | Medical document from a licensed physician authorizing medicine purchase |
| **Official Receipt** | Proof of purchase document from pharmacy |
| **Status** | Current state of request (Pending, Approved, Denied) |
| **Department** | Organizational unit: Product Development, Finance, HR, Admin, IT Helpdesk |

---

## 14. Appendices

### Appendix A: Sample Request Flow

```
1. Employee submits request
   ├── Uploads prescription
   ├── Adds medicines (name, qty, price)
   ├── Uploads receipt(s)
   ├── Marks PWD status per receipt
   └── Enters PWD deductions if applicable

2. System validates request
   ├── Checks all required fields
   ├── Validates file formats
   ├── Calculates totals
   └── Creates request record

3. Line Manager reviews request
   ├── Views employee information
   ├── Reviews prescription and receipt summary
   ├── Signs off for HR/Admin review
   └── Or declines with a reason

4. HR/Admin reviews line-manager-approved request
   ├── Views employee information
   ├── Reviews prescription document
   ├── Verifies receipt details
   ├── Checks medicine breakdown
   ├── Validates PWD deductions
   └── Makes decision

5. HR/Admin approves or denies
   ├── If approved: Updates status, records approver, adds remarks
   └── If denied: Selects reason, adds custom text if needed

6. Employee receives update
   ├── Status updated in dashboard
   ├── Can view approval/denial details
   └── Balance updated if approved
```

### Appendix B: Calculation Examples

**Example 1: Simple Request (No PWD)**
```
Medicines:
- Paracetamol 500mg: 30 tablets × ₱15.00 = ₱450.00

Receipt:
- Invoice: INV-2024-0001
- PWD: No

Total Reimbursement: ₱450.00
```

**Example 2: Request with PWD**
```
Medicines:
- Hypertension Medication: 30 tablets × ₱35.00 = ₱1,050.00
- Multivitamins: 60 capsules × ₱12.50 = ₱750.00
Subtotal: ₱1,800.00

Receipt:
- Invoice: INV-2024-8888
- PWD: Yes
- VAT Exemption: ₱150.00
- PWD Discount: ₱90.00
Total Deductions: ₱240.00

Total Reimbursement: ₱1,800.00 - ₱240.00 = ₱1,560.00
```

**Example 3: Request with Multiple Receipts (Mixed PWD)**
```
Medicines:
- Insulin Injections: 10 vials × ₱250.00 = ₱2,500.00
- Blood Glucose Strips: 100 strips × ₱8.00 = ₱800.00
Subtotal: ₱3,300.00

Receipt 1 (Pharmacy A):
- Invoice: INV-2024-5678
- PWD: Yes
- VAT Exemption: ₱200.00
- PWD Discount: ₱150.00

Receipt 2 (Pharmacy B):
- Invoice: INV-2024-5679
- PWD: Yes
- VAT Exemption: ₱100.00
- PWD Discount: ₱50.00

Total PWD Deductions: ₱500.00

Total Reimbursement: ₱3,300.00 - ₱500.00 = ₱2,800.00
```

---

**Document Control:**
- **Author:** MedReimburse Project Team
- **Approved By:** [Pending]
- **Next Review Date:** [To be determined]
- **Change Log:** Version 1.0 - Initial document creation

**End of Business Requirements Document**
