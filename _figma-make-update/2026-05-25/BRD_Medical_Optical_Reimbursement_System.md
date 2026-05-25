# Business Requirements Document
## Medical and Optical Reimbursement Management System

---

## 1. Overview and Objectives

### Purpose
The Medical and Optical Reimbursement Management System enables employees to submit, track, and process reimbursement claims for medical and optical expenses through a streamlined digital workflow.

### Objectives
- Digitize and automate the reimbursement request and approval process
- Provide role-based dashboards for employees, line managers, and HR administrators
- Ensure timely review and approval of reimbursement claims
- Maintain audit trail and compliance with company policies
- Reduce manual processing time and improve transparency

---

## 2. Scope

### In Scope
- Employee submission of Medical and Optical reimbursement requests
- Two-tier approval workflow (Line Manager → HR Admin)
- Role-based dashboards with filtering and sorting capabilities
- Request status tracking and notifications
- PWD (Person with Disability) discount and VAT deduction support
- Receipt upload and documentation management
- Year-based request filtering and archival
- Export/print functionality for approved requests (Finance processing)

### Out of Scope
- Payment processing and disbursement
- Integration with accounting/finance systems
- Other reimbursement types (travel, education, etc.)
- Mobile application (Phase 1)
- Real-time notifications via email/SMS
- Bulk upload of requests

---

## 3. Key Stakeholders

| Role | Responsibilities |
|------|-----------------|
| **Employee** | Submit reimbursement requests, track status, view history |
| **Line Manager** | Review and approve/deny direct reports' requests |
| **HR Administrator** | Final review and approval, policy compliance validation, system administration |
| **Finance Team** | Process approved and printed requests for payment (external to system) |

---

## 4. End-to-End Process Flow

```
1. EMPLOYEE submits reimbursement request
   ↓
2. LINE MANAGER reviews request
   ├─ Approves → Request moves to HR
   └─ Denies → Request marked as "Denied" (end of workflow)
   ↓
3. HR ADMIN reviews approved request
   ├─ Approves → Request marked as "Approved by HR"
   └─ Denies → Request marked as "Denied" (end of workflow)
   ↓
4. FINANCE processes approved request (manual, outside system)
   - HR Admin exports/prints request for Finance processing
```

### Status Progression
- **Pending** → Awaiting Line Manager review
- **Approved by LM • Pending HR Review** → LM approved, awaiting HR review
- **Approved by HR** → Fully approved, ready for Finance processing
- **Denied** → Rejected by either LM or HR (terminal status)

---

## 5. Status Definitions (Employee View)

| Status | Description | Next Action |
|--------|-------------|-------------|
| **Pending** | Submitted, awaiting Line Manager review | LM action required |
| **Approved by LM • Pending HR Review** | Line Manager approved, waiting for HR | HR action required |
| **Approved by HR** | Fully approved, ready for payment processing | Finance processing |
| **Denied** | Rejected by approver (LM or HR) | No further action |

---

## 6. Functional Requirements

### 6.1 Employee Dashboard & Capabilities

**Dashboard Features:**
- View all submitted reimbursement requests
- Filter by:
  - Request type (Medical, Optical, All Types)
  - Status (Pending, Approved by LM, Approved by HR, Denied, All Status)
  - Year (current and historical)
- Display pending request count badges
- Requests sorted by status priority (Pending → Approved by LM → Approved by HR → Denied)
- Visual indicators: colored left borders (Purple for Medical, Blue for Optical)

**Submission Features:**
- Create new Medical or Optical reimbursement request
- Input fields:
  - Patient name
  - Relationship to employee
  - Claim amount
  - Receipt upload (with preview)
  - Remarks/notes
- **PWD (Person with Disability) Toggle:**
  - If enabled, display additional fields:
    - VAT deduction amount
    - PWD discount amount
- Save draft or submit request
- View request details and status
- Cancel pending requests (before LM review)

### 6.2 Line Manager Dashboard & Capabilities

**Dashboard Features:**
- View all reimbursement requests from direct reports
- Filter by:
  - Request type (Medical, Optical, All Types)
  - Status (Pending, Approved, Denied, All Status)
  - Year
- Display pending request count (requires LM action)
- Requests sorted by status priority

**Review Features:**
- View full request details (patient info, amount, receipts, PWD details)
- Approve or Deny request
- Add comments/justification when denying
- View request history and timeline

### 6.3 HR Admin Dashboard & Capabilities

**Dashboard Features:**
- View all reimbursement requests across the organization
- Filter by:
  - Request type (Medical, Optical, All Types)
  - Status (Pending HR Review, Approved by HR, Denied, All Status)
  - Year
  - Employee/Department (optional)
- Display pending HR review count
- Requests sorted by status priority

**Review Features:**
- View full request details including LM approval
- Approve or Deny requests (final approval)
- Add comments/justification
- Export/print approved requests for Finance processing
- View complete audit trail

**Admin Features:**
- User management (Employee, LM, Admin role assignment)
- View system-wide analytics and reports

---

## 7. Data Management Scenarios

### Scenario A: Manual Entry and Maintenance
- **User Management:** HR Admin manually creates and maintains user accounts
- **Hierarchy Management:** HR Admin manually assigns Line Manager relationships
- **Updates:** Manual updates when org structure changes

**Requirements:**
- User creation form (Name, Employee ID, Role, Line Manager assignment)
- Bulk upload via CSV (optional)
- Edit/deactivate user accounts

### Scenario B: HRIS Integration (Future Phase)
- **Auto-sync:** User data and reporting hierarchy automatically synced from HRIS
- **Real-time updates:** Org structure changes reflected automatically
- **SSO integration:** Single sign-on authentication

**Requirements:**
- API integration with HRIS system
- Scheduled sync jobs (daily/hourly)
- Conflict resolution rules
- Fallback to manual entry if sync fails

---

## 8. Key Business Rules

### Eligibility
- All permanent employees are eligible to submit reimbursement requests
- Medical reimbursements cover employee and immediate family members
- Optical reimbursements cover employee and immediate family members

### Submission Rules
- Employees must submit requests within **60 days** of expense date
- Original or digital copy of receipt required
- One receipt per request (no batch submissions in Phase 1)
- PWD discount and VAT deduction mutually exclusive to claim amount (calculation logic to be defined)

### Approval Logic
- **Line Manager:** Must approve/deny within **5 business days**
- **HR Admin:** Must approve/deny within **3 business days**
- Denied requests cannot be resubmitted (employee must create new request)
- Only requests with status "Approved by HR" can be processed for payment

### Data Retention
- All requests retained for **7 years** minimum (compliance requirement)
- Historical requests viewable via year filter

---

## 9. Assumptions and Dependencies

### Assumptions
- Users have access to web browsers (desktop/laptop preferred)
- Employees can upload digital copies/photos of receipts
- Line Manager assignments are maintained accurately
- Finance team operates outside this system for payment processing

### Dependencies
- **User Authentication:** Existing company authentication system or new login module
- **File Storage:** Secure storage for receipt uploads (cloud or on-premise)
- **HRIS Integration (Phase 2):** Availability of HRIS API and documentation
- **Browser Compatibility:** Modern browsers (Chrome, Firefox, Safari, Edge)

### Technical Dependencies
- React-based frontend framework
- Tailwind CSS for UI styling
- Secure backend API for data management
- Database for storing request and user data

---

## 10. Success Metrics

- **Process Efficiency:** Average approval time reduced by 50% compared to manual process
- **User Adoption:** 90% of employees submit requests digitally within 6 months
- **Approval SLA:** 95% of requests reviewed within defined timeframes
- **User Satisfaction:** Minimum 4/5 rating from employee feedback surveys

---

## Document Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-05-22 | System Analyst | Initial BRD based on Figma design and requirements |

---

**Approval Sign-off:**

| Stakeholder | Role | Signature | Date |
|-------------|------|-----------|------|
| ___________ | HR Director | | |
| ___________ | Finance Manager | | |
| ___________ | IT Director | | |

