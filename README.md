# Enterprise Human Resource Management System (HRMS)

![Java](https://img.shields.io/badge/Java_17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot_3.3.3-F2F4F9?style=for-the-badge&logo=spring-boot)
![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)

## 📖 Overview

A comprehensive, full-stack Human Resource Management System designed to streamline enterprise-level organizational workflows. This production-ready system goes beyond basic CRUD operations, implementing sophisticated business logic for **multi-tenant deployments**, **salary processing with tax integration**, **attendance tracking with correction workflows**, **asset lifecycle management**, and **granular role-based access control (RBAC)**.

The platform supports multiple companies operating independently within a single instance, each with customizable salary structures, leave policies, and approval workflows.

## ✨ Key Features

### 🏢 Core HR & Employee Management
- **Onboarding Workflow:** Multi-stage employee lifecycle tracking (*Pending Approval* → *Document Verification* → *Active*)
- **KYC Verification:** Secure document uploads (Passport, ID, Certificates) with admin verification system
- **Employee Profiles:** Comprehensive employee information (personal details, contact, blood group, marital status, etc.)
- **Organizational Structure:** Department-based hierarchy with manager/peer/direct report relationships
- **User Role Management:** Multiple roles (Super Admin, Admin, Manager, Employee) with hierarchical access control

### 💰 Payroll & Financial Management
- **Configurable Salary Structures:** Department-specific salary templates with customizable components
  - Basic salary, allowances, deductions, taxes per employee
  - Multi-currency support per company/department
- **Salary Components:** Flexible system for defining company-wide compensation elements
- **Automated Payslip Generation:** Bulk monthly payslip creation with automatic calculations
- **Salary Disbursement:** Admin-controlled payment finalization with status tracking
- **Expense Reimbursement:** Receipt-based expense claims with multi-level approval workflows and audit trails

### ⏱️ Time & Attendance Management
- **Real-Time Attendance:** Clock in/out functionality with time tracking widgets
- **Attendance Corrections:** Request-approval workflow for missed or incorrect punch records
- **Timesheet Management:** Weekly project-based time logging with status tracking (Draft, Submitted, Approved, Rejected)
- **Leave Management:** 
  - Multiple leave types (Sick, Paid, Floater, etc.)
  - Automated leave balance calculation and tracking
  - Leave request workflow with approval chains
  - Leave status tracking (Pending, Approved, Rejected, Cancelled)

### 📊 Reporting & Analytics
- **Dashboard Analytics:** Visual widgets showing attendance trends, leave balances, and upcoming leaves
- **Leave Balance Charts:** Graphical representation of employee leave utilization
- **Payslip Portal:** Employee access to historical payslip records
- **Search Palette:** Global search functionality across employees and company data

### 💼 Project & Task Management
- **Project Management:** Company-wide project creation and allocation
- **Project Allocation:** Assign employees to projects with allocation tracking
- **Task Management:** Personal task lists with assignment and status tracking (Available, In Progress, Completed, etc.)
- **Timesheet Integration:** Link timesheet entries to specific projects

### 🛠️ Asset Management
- **Asset Tracking:** Complete asset lifecycle management with allocation and return workflows
- **Asset Allocation:** Track which employees hold which assets and when
- **Asset Status:** Monitor asset conditions and availability

### 📢 Internal Communication & Tools
- **Meeting Scheduler:** Create meetings with automated email invitations via SMTP
- **Meeting Responses:** Attendee acceptance/decline/maybe status tracking
- **Noticeboard:** Priority-based company announcements and news distribution
- **Help Desk Ticketing:** Internal support ticketing system with ticket categories and comments
  - Ticket status tracking (Open, In Progress, Resolved, Closed)
  - Comment threads for detailed communication
  - Ticket category classification

### 📋 Administrative Capabilities
- **Multi-Company Management:** Administer multiple independent companies from one instance
- **Department Management:** Organizational structure setup and hierarchy
- **User & Access Control:** Employee creation, role assignment, and permission management
- **Batch Operations:** Bulk payslip generation and data management

## 🎯 System Requirements & Architecture

### Deployment Architecture
- **Frontend:** Node.js development server (development) or static hosting (production)
- **Backend:** Spring Boot application server
- **Database:** PostgreSQL database server
- **Email Service:** SMTP server (Mailtrap for development/testing)
- **File Storage:** Local filesystem for document uploads and profile pictures

### Performance Considerations
- RESTful API for efficient client-server communication
- Pagination support for large data sets
- Indexed database queries for common search operations
- Session-based authentication with JWT tokens

---

## ⚙️ Installation & Setup Guide

**Important:**  
This application includes an automatic **Data Seeder**. On first run, the backend detects an empty database and populates it with demo data automatically, including demo companies, employees, and sample transactions.

### 1️⃣ Prerequisites
- **Java 17 (JDK)** – Required for Spring Boot 3.3.3 compilation and runtime
- **Apache Maven** – Build tool for Java project
- **Node.js v16+** & **npm v8+** – JavaScript runtime and package manager
- **PostgreSQL 12+** – Relational database (Port 5432)
- **Mailtrap Account** (Free) – For email testing and development
- **Git** – Version control (optional, for cloning repository)

### 2️⃣ Database Setup

Create an empty database:

```sql
CREATE DATABASE "HRMSbackenddb";
```

### 3️⃣ Backend Setup (Spring Boot 3.3.3)

#### Step 1: Navigate to Backend Resources
```bash
cd backend/src/main/resources/
```

#### Step 2: Configure Application Properties
Rename `application.properties.example` to `application.properties`:
```bash
# Windows
rename application.properties.example application.properties

# macOS/Linux
mv application.properties.example application.properties
```

#### Step 3: Update Configuration Values
Edit `application.properties` with your environment-specific credentials:

```properties
# ============================================
# DATABASE CONFIGURATION
# ============================================
spring.datasource.url=jdbc:postgresql://localhost:5432/HRMSbackenddb
spring.datasource.username=YOUR_POSTGRES_USERNAME
spring.datasource.password=YOUR_POSTGRES_PASSWORD
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA/Hibernate Configuration
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.format_sql=true

# ============================================
# JWT SECURITY CONFIGURATION
# ============================================
jwt.secret=YOUR_RANDOM_SECRET_KEY_HERE_MINIMUM_32_CHARACTERS_RECOMMENDED
jwt.expiration=86400000

# ============================================
# EMAIL CONFIGURATION (Mailtrap)
# ============================================
spring.mail.host=smtp.mailtrap.io
spring.mail.port=2525
spring.mail.username=YOUR_MAILTRAP_USERNAME
spring.mail.password=YOUR_MAILTRAP_PASSWORD
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.starttls.required=true

# ============================================
# FILE UPLOAD CONFIGURATION
# ============================================
upload.dir.profile-pics=./hrms-uploads/profile-pics
upload.dir.documents=./hrms-uploads/documents
file.upload.max-size=5242880

# ============================================
# SERVER CONFIGURATION
# ============================================
server.port=8080
server.servlet.context-path=/
spring.application.name=HRMS-Backend
```

#### Step 4: Build and Run Backend
From the `backend/` directory:

```bash
# Option 1: Using Maven wrapper (included in project)
mvn clean install
mvn spring-boot:run

# Option 2: Using Maven command (if Maven is installed globally)
mvn clean install
mvn spring-boot:run
```

**Wait for startup message:**
```
========================================
Starting HrmsBackendApplication
Application started in X.XXX seconds
========================================
```

The API will be available at `http://localhost:8080`

### 4️⃣ Frontend Setup (React 18)

#### Step 1: Navigate to Frontend Directory
```bash
cd frontend
```

#### Step 2: Create Environment Configuration
Create `.env.local` file in the frontend root directory:

```env
REACT_APP_API_BASE_URL=http://localhost:8080
REACT_APP_ENV=development
```

#### Step 3: Install Dependencies
```bash
npm install
```

This installs all required packages including:
- React 18.2.0 – UI framework
- React Router DOM 6.25.1 – Client-side routing
- Axios 1.8.3 – HTTP client for API calls
- Chart.js & React ChartJS-2 – Data visualization
- React DatePicker – Date input component
- Styled Components – CSS-in-JS styling
- React Icons – Icon library

#### Step 4: Start Development Server
```bash
npm start
```

The application will open automatically in your browser at:
```
http://localhost:3000
```

**Hot reload is enabled:** Changes to React components will refresh automatically without full page reload.

---

## 🔐 Login Credentials & Demo Data

**Note:** Demo data is automatically seeded on first run. Select the correct company from the login dropdown.

### Demo Users

| Role | Company | Email/Username | Password | Features Access |
|------|---------|---|---|---|
| **Super Admin** | Global | superadmin | superadmin123 | Full system control, all companies, super admin dashboard |
| **Company Admin** | Innovate Inc. | admin_innovate | admin123 | Company management, admin dashboards, payroll, approvals |
| **Manager** | Innovate Inc. | manager_name | user123 | Team management, approval workflows, reports |
| **Employee** | Innovate Inc. | janesmith | user123 | Personal dashboard, leave requests, expense claims, timesheets |
| **Employee** | Global Solutions | peterjones | user123 | Personal dashboard, leave requests, expense claims, timesheets |

### Demo Scenarios to Test

#### 1. **Employee Onboarding**
```
1. Login as: admin_innovate / admin123
2. Navigate: Admin Panel → User Management → Add Employee
3. Fill employee details and submit
4. Status starts as "Pending Approval"
5. Upload documents via Document Verification
6. Approve to activate employee
```

#### 2. **Attendance & Time Tracking**
```
1. Login as: janesmith / user123
2. Navigate: Dashboard → Click "Clock In"
3. Verify attendance record is created
4. Request correction if needed: Dashboard → Attendance Corrections
5. Admin approves corrections
```

#### 3. **Leave Management**
```
1. Login as: janesmith / user123
2. Navigate: Leave Management → Request Leave
3. Select leave type, dates, and submit
4. Manager/Admin approves request
5. Dashboard shows updated leave balance
```

#### 4. **Payroll Processing**
```
1. Login as: admin_innovate / admin123
2. Navigate: Payroll → Salary Configuration
3. Define salary components if needed
4. Click: Generate Payslips (monthly)
5. Review and Disburse
6. Employee can download payslip on Payslip page
```

#### 5. **Expense Reimbursement**
```
1. Login as: janesmith / user123
2. Navigate: Expenses → Submit Claim
3. Upload receipt and provide details
4. Manager/Admin reviews and approves
5. Status updates to "Approved" or "Rejected"
```

#### 6. **Help Desk Support**
```
1. Login as: janesmith / user123
2. Navigate: Help Desk → Create Ticket
3. Select category and describe issue
4. Add comments to existing tickets
5. Admin responds and resolves tickets
```

#### 7. **Email Testing (Forgot Password)**
```
1. On Login page → Click "Forgot Password"
2. Enter email address
3. Check Mailtrap inbox for password reset email
4. Click reset link and set new password
```

---

## 📊 Application Structure

## � Application Structure

### Backend Architecture (Spring Boot)

#### Project Organization
```
backend/
├── src/main/java/com/
│   ├── config/              # Configuration classes (Security, JPA, CORS)
│   ├── controller/          # REST API endpoints (20+ controllers)
│   ├── service/             # Business logic layer (23 services)
│   ├── model/               # JPA entities (44+ domain models)
│   ├── repository/          # Data access layer (Spring Data JPA)
│   ├── security/            # JWT, authentication, authorization
│   ├── DTO/                 # Data Transfer Objects
│   └── HrmSbackendApplication.java
├── src/main/resources/
│   └── application.properties  # Configuration file
└── pom.xml                  # Maven dependencies
```

#### Key Components

**Controllers (20+):** REST API endpoints for all features
- `AuthController` – Login, registration, authentication
- `UserController` – Employee management
- `PayrollController` – Salary and payslip management
- `AttendanceController` – Attendance tracking
- `LeaveController` – Leave request processing
- `ExpenseController` – Expense claim handling
- `AdminController` – Administrative operations
- `DashboardController` – Analytics and widgets
- And 12+ more specialized controllers...

**Services (23):** Business logic implementation
- `AuthService` – User authentication and JWT
- `PayrollService` – Salary calculations and processing
- `AttendanceService` – Attendance tracking logic
- `LeaveService` – Leave balance and request handling
- `EmailService` – SMTP email sending
- `FileUploadService` – Document and image uploads
- `DataSeeder` – Demo data initialization
- And 16+ more services...

**Models (44+):** Domain entities
- **User Management:** `User`, `Employee`, `Role`, `Company`, `Department`
- **Payroll:** `Payslip`, `PayslipItem`, `SalaryComponent`, `EmployeeSalaryComponent`
- **Attendance:** `Attendance`, `AttendanceCorrection`
- **Leave:** `LeaveRequest`, `LeaveType`, `LeaveStatus`
- **Financial:** `ExpenseClaim`, `ExpenseClaimStatus`
- **Communication:** `Meeting`, `MeetingAttendee`, `Notice`, `Ticket`, `TicketComment`
- **Projects:** `Project`, `ProjectAllocation`, `Task`, `Timesheet`, `TimesheetEntry`
- **Assets:** `Asset`, `AssetAllocation`
- And supporting enums and value objects...

**Security Architecture:**
- JWT token-based authentication
- Role-Based Access Control (RBAC)
- Password encryption with bcrypt
- CORS configuration for frontend communication
- Method-level security annotations

### Frontend Architecture (React)

#### Project Organization
```
frontend/
├── public/                  # Static assets
│   └── index.html          # HTML entry point
├── src/
│   ├── components/         # Reusable React components
│   │   ├── admin/         # Admin-specific components
│   │   ├── Dashboard/     # Dashboard and widgets
│   │   └── [other shared components]
│   ├── pages/             # Full page components (22 pages)
│   │   ├── AdminAssetManagementPage.jsx
│   │   ├── AdminAttendanceCorrectionsPage.jsx
│   │   ├── AdminAttendancePage.jsx
│   │   ├── AdminDocumentVerificationPage.jsx
│   │   ├── AdminExpenseApprovalPage.jsx
│   │   ├── AdminHelpDesk.jsx
│   │   ├── AdminLeaveApprovalPage.jsx
│   │   ├── AdminPayrollConfiguration.jsx
│   │   ├── AdminProjectManagementPage.jsx
│   │   ├── AdminSalaryManagement.jsx
│   │   ├── AdminTimesheetApprovalPage.jsx
│   │   ├── AttendancePage.jsx
│   │   ├── ExpensePage.jsx
│   │   ├── HelpDeskPage.jsx
│   │   ├── Home.jsx (Dashboard)
│   │   ├── LeaveManagementPage.jsx
│   │   ├── MyTasksPage.jsx
│   │   ├── MyTeamPage.jsx
│   │   ├── PayrollConfigurationPage.jsx
│   │   ├── PayslipPage.jsx
│   │   ├── ProfilePage.jsx
│   │   └── TimesheetPage.jsx
│   ├── services/
│   │   └── apiService.js   # Axios instance for API calls
│   ├── styles/             # Global and component styles
│   ├── assets/             # Images and static resources
│   ├── App.jsx             # Root component with routing
│   └── index.js            # React DOM render
└── package.json            # NPM dependencies and scripts
```

#### Key Technologies
- **React 18.2** – Component-based UI framework
- **React Router 6.25** – Client-side routing and navigation
- **Axios 1.8** – HTTP client for API communication
- **Chart.js & React ChartJS-2** – Interactive charts and graphs
- **React DatePicker** – Date selection component
- **React Select** – Customizable dropdown/select component
- **Styled Components** – CSS-in-JS for component styling
- **React Icons** – Icon library for UI elements

#### Frontend Features
- Responsive design for desktop and tablet
- Real-time form validation
- Multi-step workflows (onboarding, approvals)
- Data visualization with charts
- Modal dialogs for confirmations and forms
- Pagination for large data sets
- Search and filter capabilities
- Role-based view rendering

---

## 🔄 Data Flow

### Authentication Flow
```
React Frontend
    ↓ (credentials)
POST /api/auth/login → AuthController
    ↓
AuthService.authenticate()
    ↓ (verifies password)
CustomUserDetailsService
    ↓
JWT Token Generated
    ↓ (returns token)
React Frontend stores token
    ↓
All subsequent requests include Authorization header
```

### Employee Onboarding Flow
```
Admin Creates Employee → UserController
    ↓
UserService.createEmployee()
    ↓
Employee entity created with status: PENDING_APPROVAL
    ↓
Admin uploads documents → DocumentController
    ↓
DocumentService validates files
    ↓
Admin verifies documents → AdminController
    ↓
Status updated: DOCUMENT_VERIFICATION → ACTIVE
    ↓
Employee can now login and use system
```

### Payroll Processing Flow
```
Admin configures salary structure → PayrollController
    ↓
SalaryComponent stored for each department
    ↓
Click "Generate Payslips" → PayrollController
    ↓
PayrollService:
  - Iterates all employees in payroll period
  - Calculates gross salary from components
  - Applies taxes and deductions
  - Creates Payslip entity
    ↓
Admin reviews payslips
    ↓
Click "Disburse" → PayrollController
    ↓
Payslip status updated: GENERATED → DISBURSED
    ↓
Employee can download payslip
```

### Leave Request Flow
```
Employee requests leave → LeaveController
    ↓
LeaveService validates:
  - Leave balance available
  - Dates valid
  - No overlapping requests
    ↓
LeaveRequest created with status: PENDING
    ↓
Manager/Admin receives notification
    ↓
Admin approves/rejects → LeaveController
    ↓
Status updated: PENDING → APPROVED or REJECTED
    ↓
Employee balance automatically updated if approved
```

---

## 🛡️ Security Architecture

### Authentication & Authorization
- **JWT Tokens:** Stateless authentication using JSON Web Tokens
- **Password Security:** Bcrypt encryption with salt rounds
- **Role-Based Access Control:** RBAC with 4 role levels:
  - **SUPER_ADMIN** – System-wide access
  - **ADMIN** – Company-level management
  - **MANAGER** – Team and department management
  - **EMPLOYEE** – Personal data and requests only
- **Method-Level Security:** Spring Security annotations protect sensitive operations
- **CORS Configuration:** Cross-Origin Resource Sharing properly configured for frontend

### Data Protection
- **Database:** PostgreSQL with encrypted sensitive fields
- **File Uploads:** Stored outside web root, accessed via service
- **Session Management:** Server-side validation of all actions
- **Input Validation:** DTOs and constraints prevent malicious input
- **Sensitive Data:** Never logged or exposed in error messages

### Secure File Upload
- File type validation (whitelist allowed formats)
- File size limits enforced
- Files stored with generated names (not user input)
- Access controlled through service layer

---

## 📡 API Documentation

### Base URL
```
http://localhost:8080
```

### Authentication Endpoints

**Login**
```
POST /api/auth/login
Content-Type: application/json

Request:
{
  "username": "janesmith",
  "password": "user123",
  "companyId": 1
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... },
  "expiresIn": 86400000
}
```

### Employee Endpoints

**Get All Employees**
```
GET /api/users?page=0&size=20
Authorization: Bearer {token}
```

**Get Employee by ID**
```
GET /api/users/{id}
Authorization: Bearer {token}
```

**Create Employee**
```
POST /api/users/create
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "departmentId": 1,
  "roleId": 3,
  ...
}
```

### Payroll Endpoints

**Get All Payslips (Employee)**
```
GET /api/payroll/my-payslips
Authorization: Bearer {token}
```

**Generate Payslips (Admin)**
```
POST /api/payroll/generate-payslips
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "month": 1,
  "year": 2024,
  "companyId": 1
}
```

**Get Salary Structure**
```
GET /api/payroll/salary-structure/{departmentId}
Authorization: Bearer {token}
```

### Attendance Endpoints

**Clock In**
```
POST /api/attendance/clock-in
Authorization: Bearer {token}
```

**Clock Out**
```
POST /api/attendance/clock-out
Authorization: Bearer {token}
```

**Request Attendance Correction**
```
POST /api/attendance/correction-request
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "attendanceId": 123,
  "reason": "Forgot to clock in"
}
```

### Leave Endpoints

**Request Leave**
```
POST /api/leave/request
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "leaveTypeId": 1,
  "startDate": "2024-02-05",
  "endDate": "2024-02-07",
  "reason": "Vacation"
}
```

**Approve Leave (Manager)**
```
PUT /api/leave/{leaveRequestId}/approve
Authorization: Bearer {token}
```

**Get Leave Balance**
```
GET /api/leave/balance
Authorization: Bearer {token}
```

### Dashboard Endpoints

**Get Dashboard Analytics**
```
GET /api/dashboard/analytics
Authorization: Bearer {token}
```

**Get Widget Data**
```
GET /api/dashboard/widgets/{widgetId}
Authorization: Bearer {token}
```

---

## 🐛 Troubleshooting

### Backend Issues

**Port 8080 Already in Use**
```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID {PID} /F

# macOS/Linux
lsof -i :8080
kill -9 {PID}
```

**Database Connection Failed**
- Verify PostgreSQL is running: `psql -U postgres`
- Check credentials in `application.properties`
- Ensure database exists: `CREATE DATABASE "HRMSbackenddb";`

**JWT Secret Not Set**
- Set `jwt.secret` in `application.properties`
- Use a random string minimum 32 characters

**Mailtrap Email Not Working**
- Verify Mailtrap credentials in `application.properties`
- Check inbox/spam folder
- Ensure email service is enabled in backend

### Frontend Issues

**Port 3000 Already in Use**
```bash
npm start -- --port 3001
```

**API Connection Failed**
- Verify backend is running on port 8080
- Check `REACT_APP_API_BASE_URL` in `.env.local`
- Check browser console for CORS errors

**Blank Dashboard or Missing Data**
- Clear browser cache and localStorage
- Check Network tab in DevTools for API errors
- Verify JWT token is valid

**npm install Errors**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 🌐 Multi-Tenancy Architecture

The system supports multiple independent companies with isolated data:

- **Company Isolation:** Each employee belongs to one company
- **Department Structure:** Departments are company-specific
- **Payroll Independence:** Salary structures vary per company/department
- **Leave Policies:** Different leave types per company
- **Admin Scope:** Company admins manage only their company
- **Super Admin:** Has visibility across all companies

---

## 📈 Performance Optimization

- **Database Indexing:** Key fields indexed for query performance
- **Lazy Loading:** Related entities loaded on demand
- **Pagination:** Large lists paginated (default 20 items per page)
- **Caching:** Frequently accessed data cached where appropriate
- **Efficient Queries:** DTOs used to fetch only needed fields
- **Connection Pooling:** HikariCP manages database connections

---

## 🛠️ Development Tools & Scripts

### Backend Build Scripts

**Windows PowerShell** (`backend/scripts/fix_packages_cmd.ps1`)
- Fixes package dependencies automatically
- Run: `.\fix_packages_cmd.ps1`

**Python Script** (`backend/scripts/fix_packages.py`)
- Alternative dependency fix script
- Run: `python fix_packages.py`

### Maven Commands
```bash
# Clean and build
mvn clean install

# Run tests
mvn test

# Skip tests during build
mvn clean install -DskipTests

# Run specific test class
mvn test -Dtest=HrmSbackendApplicationTests
```

### NPM Commands
```bash
# Install dependencies
npm install

# Start development server with debugging
npm start

# Build for production
npm build

# Run tests
npm test

# Eject configuration (not recommended)
npm eject
```

---

## 📝 File Upload Configuration

### Supported File Types
- **Documents:** PDF, DOC, DOCX, JPG, PNG
- **Profile Pictures:** JPG, JPEG, PNG, GIF
- **Receipts:** JPG, PNG, PDF

### Upload Limits
- Maximum file size: 5MB (configurable in `application.properties`)
- Storage location: `./hrms-uploads/` directory

### Upload Directories
```
hrms-uploads/
├── profile-pics/    # Employee profile pictures
└── documents/       # Employee documents (KYC, etc.)
```

---

## 🛡️ Security Notes

### Sensitive Files Not Committed
This repository uses `.gitignore` to exclude:
- `application.properties` – Database and API credentials
- `.env.local` – Frontend environment variables
- `/node_modules/` – Dependencies (reinstall with npm install)
- `/target/` – Compiled Java classes
- `.idea/` – IDE configuration files

### Best Practices
- **Never commit credentials** – Use `.example` template files
- **Use strong JWT secret** – Minimum 32 characters, random
- **Update Mailtrap credentials** – Use free tier for development
- **Rotate passwords regularly** – Especially demo account passwords
- **HTTPS in Production** – Use SSL/TLS certificates
- **Environment-specific config** – Different credentials per environment

---

## 📚 Database Schema

### Key Relationships
- **User ↔ Employee:** One-to-one mapping
- **Employee ↔ Department:** Many-to-one relationship
- **Employee ↔ Project:** Many-to-many via ProjectAllocation
- **Employee ↔ Asset:** Many-to-many via AssetAllocation
- **Department ↔ SalaryComponent:** Many-to-many via DepartmentSalaryStructure
- **Payslip ↔ PayslipItem:** One-to-many (salary breakdown)
- **Leave/Attendance ↔ Employee:** Many-to-one relationships

### Audit Fields
Most entities include:
- `createdAt` – Timestamp of creation
- `createdBy` – User who created record
- `updatedAt` – Last modification timestamp
- `updatedBy` – User who last modified record

---

## 🚀 Deployment Considerations

### Production Checklist
- [ ] Change all demo credentials
- [ ] Set strong JWT secret (32+ characters)
- [ ] Configure production database
- [ ] Set up SMTP server (SendGrid, AWS SES, etc.)
- [ ] Configure HTTPS/SSL certificates
- [ ] Set up file backup strategy
- [ ] Configure database backups
- [ ] Enable audit logging
- [ ] Set up monitoring and alerting
- [ ] Configure load balancing if needed

### Recommended Hosting
- **Backend:** AWS EC2, Heroku, DigitalOcean, or Azure App Service
- **Frontend:** Vercel, Netlify, AWS S3 + CloudFront
- **Database:** AWS RDS, Azure Database for PostgreSQL, DigitalOcean
- **Email:** SendGrid, AWS SES, Mailtrap (production-ready)
- **File Storage:** AWS S3, Azure Blob Storage, or local with CDN

---

## 📖 Additional Resources

- **Spring Boot Documentation:** https://spring.io/projects/spring-boot
- **React Documentation:** https://react.dev
- **PostgreSQL Documentation:** https://www.postgresql.org/docs/
- **JWT Introduction:** https://jwt.io/introduction
- **REST API Best Practices:** https://restfulapi.net/

---

## 👤 Author

**Junade Govender**

---

## 📄 License

This project is provided as-is for educational and portfolio purposes.

---

## 🎯 Project Status

**Current Version:** 0.0.1-SNAPSHOT  
**Status:** Active Development  
**Last Updated:** February 2026

---

## 📞 Support & Contribution

For questions, issues, or contributions, please refer to the project documentation and codebase comments.
