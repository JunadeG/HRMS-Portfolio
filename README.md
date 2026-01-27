# Enterprise Human Resource Management System (HRMS)

![Java](https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-F2F4F9?style=for-the-badge&logo=spring-boot)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

## 📖 Overview

This is a comprehensive, full-stack HRMS designed to handle complex organizational workflows. Unlike simple management apps, this system implements real-world business logic including **salary disbursement**, **taxation structures**, **attendance tracking**, and **role-based security**.

It supports multi-tenancy (multiple companies), making it suitable for large-scale deployment.

---

## ✨ Key Features

*   **Role-Based Access:** Distinct portals for Super Admin, Company Admin, and Employees.
*   **Onboarding & KYC:** Complete workflow from "Pending" to "Verified" with document uploads.
*   **Payroll System:** Configurable salary structures per department, automated payslip generation, and disbursement tracking.
*   **Attendance & Timesheets:** Real-time clock-in/out, attendance correction requests, and weekly timesheet approvals.
*   **Communication:** Internal help desk ticketing system and email notifications (via SMTP).
*   **Asset Management:** Tracking of company devices and allocation to employees.

---

## ⚙️ Installation & Setup Guide

**Note:** This application includes an automatic **Data Seeder**. You do not need to manually insert users to test the application. Follow the steps below, and the system will populate itself with demo data on the first run.

### 1. Prerequisites
*   **Java 21** (JDK)
*   **Node.js** (v16 or higher)
*   **PostgreSQL** (Running on port 5432)
*   **Mailtrap Account** (Required to test email features without sending real emails)

### 2. Database Setup
Open your PostgreSQL tool (pgAdmin or terminal) and run this single command to create the empty container:
```sql
CREATE DATABASE "HRMSbackenddb";