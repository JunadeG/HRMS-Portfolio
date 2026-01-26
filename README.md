# WorkWave: Enterprise Human Resource Management System (HRMS)

A full-stack HRMS solution designed to streamline employee management, attendance tracking, payroll, and asset allocation.

## 🚀 Features

*   **Role-Based Access:** Distinct panels for Super Admin, Admin (Company level), and Employees.
*   **Attendance & Timesheets:** Real-time clock-in/out and weekly timesheet submission/approval workflows.
*   **Payroll Automation:** Configurable salary structures, automated tax calculations, and payslip generation.
*   **Asset Management:** Tracking of company assets assigned to employees.
*   **Security:** Secured with Spring Security and JWT Authentication.

---

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed:
*   **Java 21 (JDK)**
*   **Node.js & npm**
*   **PostgreSQL** (Running on port 5432)

---

## ⚙️ Installation & Setup

### 1. Database Setup
1.  Open your PostgreSQL tool (pgAdmin or terminal).
2.  Create a new, empty database named `hrms_db` (or any name you prefer).

### 2. Backend Setup (Spring Boot)
1.  Navigate to the backend folder:
    ```bash
    cd backend
    ```
2.  **Configuration:**
    *   Locate `src/main/resources/application.properties.example`.
    *   Rename it to `application.properties`.
    *   Open the file and **update the following fields** with your local details:
        ```properties
        spring.datasource.url=jdbc:postgresql://localhost:5432/YOUR_DB_NAME_HERE
        spring.datasource.username=YOUR_POSTGRES_USERNAME
        spring.datasource.password=YOUR_POSTGRES_PASSWORD
        
        # (Optional) Add your Mailtrap credentials for email features
        spring.mail.username=YOUR_MAILTRAP_USERNAME
        spring.mail.password=YOUR_MAILTRAP_PASSWORD
        ```
3.  Run the application:
    ```bash
    mvn spring-boot:run
    ```
    *The application will start on `http://localhost:8080`.*

    > **Note on Data Seeding:** On the first run, the application will detect an empty database and automatically seed it with sample Companies, Departments, and Users.

### 3. Frontend Setup (React)
1.  Open a new terminal and navigate to the frontend folder:
    ```bash
    cd frontend
    ```
2.  **Configuration:**
    *   Create a file named `.env.local` in this folder.
    *   Add the following line:
        ```
        REACT_APP_API_BASE_URL=http://localhost:8080
        ```
3.  Install dependencies and start:
    ```bash
    npm install
    npm start
    ```
    *The application will launch at `http://localhost:3000`.*

---

## 🔑 Default Login Credentials

Once the application is running, use these credentials to access different roles. 
**Note:** Ensure you select the correct Company from the dropdown on the login screen.

| Role | Company | Username | Password |
| :--- | :--- | :--- | :--- |
| **Super Admin** | (Any) | `superadmin` | `superadmin123` |
| **Admin** | Innovate Inc. | `admin_innovate` | `admin123` |
| **Employee** | Innovate Inc. | `janesmith` | `user123` |

---

## 🏛️ Project Structure

*   **`/backend`**: Spring Boot application (API, Security, Database Logic).
*   **`/frontend`**: React application (UI, State Management).

## 🛡️ Security Note
This repository contains `example` configuration files. For security reasons, actual API keys, database passwords, and JWT secrets have been removed. You must provide your own in the local `application.properties` file.