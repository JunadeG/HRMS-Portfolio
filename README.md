# Enterprise Human Resource Management System (HRMS)

![Java](https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-F2F4F9?style=for-the-badge&logo=spring-boot)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)

## 📖 Overview

This is a comprehensive, full-stack Human Resource Management System designed to streamline complex organizational workflows. Unlike simple CRUD applications, this system implements real-world business logic including **salary disbursement**, **dynamic taxation structures**, **attendance tracking with correction workflows**, and **granular role-based security**.

The system is built to support **multi-tenancy** (multiple companies within one instance), making it suitable for large-scale deployment.

## ✨ Key Features

### 🏢 Core HR & Employee Management
- **Onboarding Workflow:** Automated status tracking from *Pending Approval* → *Document Verification* → *Active*
- **KYC Verification:** Secure document uploads (Passport, ID) with admin verification
- **Organizational Structure:** Visual hierarchy of managers, peers, and direct reports

### 💰 Payroll & Financials
- **Configurable Salary Structures:** Define salaries and currencies per department
- **Automated Payslip Generation:** Monthly bulk payslip creation
- **Salary Disbursement:** Admin-controlled payment finalization
- **Expense Reimbursement:** Receipt-based claims with approval audit trails

### ⏱️ Time & Attendance
- **Real-Time Tracking:** Clock-in/clock-out dashboard widgets
- **Correction Requests:** Approval workflow for missed or incorrect punches
- **Timesheets:** Weekly project-based time logging
- **Leave Management:** Automated leave balance tracking (Sick, Paid, Floater)

### 📢 Communication & Tools
- **Meeting Scheduler:** Email invitations via SMTP
- **Help Desk:** Internal ticketing system
- **Noticeboard:** Priority-based company announcements
- **Asset Management:** Employee asset lifecycle tracking

## ⚙️ Installation & Setup Guide

**Important:**  
This application includes an automatic **Data Seeder**. On first run, the backend detects an empty database and populates it with demo data automatically.

### 1️⃣ Prerequisites
- **Java 21 (JDK)**
- **Node.js v16+ & npm**
- **PostgreSQL** (Port 5432)
- **Mailtrap Account** (for email testing)

### 2️⃣ Database Setup

Create an empty database:

```sql
CREATE DATABASE "HRMSbackenddb";
```

### 3️⃣ Backend Setup (Spring Boot)

Navigate to:

```
backend/src/main/resources/
```

Rename:

```
application.properties.example → application.properties
```

Update credentials:

```properties
# --- Database Credentials ---
spring.datasource.username=YOUR_POSTGRES_USERNAME
spring.datasource.password=YOUR_POSTGRES_PASSWORD

# --- JWT Secret ---
jwt.secret=YOUR_RANDOM_SECRET_KEY_HERE

# --- Mailtrap Credentials ---
spring.mail.username=YOUR_MAILTRAP_USERNAME
spring.mail.password=YOUR_MAILTRAP_PASSWORD

# --- File Upload Paths ---
upload.dir.profile-pics=./uploads/profiles
```

Start the backend:

```bash
cd backend
mvn spring-boot:run
```

Wait until you see:

```
Started HrmsBackendApplication
```

### 4️⃣ Frontend Setup (React)

Navigate to the frontend folder.

Create `.env.local`:

```env
REACT_APP_API_BASE_URL=http://localhost:8080
```

Install and run:

```bash
npm install
npm start
```

The application will be available at:

```
http://localhost:3000
```

## 🔐 Login Credentials (Demo Data)

Note: Select the correct company from the dropdown when logging in.

| Role | Company | Username | Password | Access Level |
|------|---------|----------|----------|--------------|
| Super Admin | Global | superadmin | superadmin123 | Full System Control |
| Admin | Innovate Inc. | admin_innovate | admin123 | Company Management |
| Employee | Innovate Inc. | janesmith | user123 | Employee Portal |
| Employee | Global Solutions | peterjones | user123 | Employee Portal |

## 🧪 Testing Scenarios

- **Onboarding:** Admin → User Management → Add Employee → Pending approval
- **Attendance:** Employee (janesmith) → Dashboard → Clock In
- **Payroll:** Admin → Payroll Config → Generate Payslips → Disbursement
- **Emails:** Login → Forgot Password → Check Mailtrap inbox

## 🛡️ Security Note

This repository uses `.gitignore` to exclude sensitive files such as:

- `application.properties`
- `.env.local`

Never commit real credentials or API keys. Use `.example` files as templates.

## 👤 Author

Junade Govender
