package com.HRMSbackend.HRMSbackend.service;

import com.HRMSbackend.HRMSbackend.model.Company;
import com.HRMSbackend.HRMSbackend.model.Department;
import com.HRMSbackend.HRMSbackend.model.User;
import com.HRMSbackend.HRMSbackend.repository.CompanyRepository;
import com.HRMSbackend.HRMSbackend.repository.DepartmentRepository;
import com.HRMSbackend.HRMSbackend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    @Autowired private UserRepository userRepository;
    @Autowired private CompanyRepository companyRepository;
    @Autowired private DepartmentRepository departmentRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // We only seed data if the database is completely empty
        if (companyRepository.count() == 0 && departmentRepository.count() == 0 && userRepository.count() == 0) {
            log.info("Empty database detected. Seeding initial data...");

            // === Create Companies ===
            Company company1 = createCompany("Innovate Inc.", "innovate.com");
            Company company2 = createCompany("Global Solutions", "globalsol.com");

            // === Create Departments ===
            Department hr = createDepartment("Human Resources");
            Department engineering = createDepartment("Engineering");
            Department sales = createDepartment("Sales");
            Department marketing = createDepartment("Marketing");

            // Create an unassigned department for special cases
            createDepartment("Unassigned");

            // === Create Users ===
            // 1. A Super Admin (not tied to any company)
            createUser("superadmin", "Super", "Admin", "superadmin123", User.Role.SUPER_ADMIN, null, null);

            // 2. An Admin for Innovate Inc.
            createUser("admin_innovate", "Admin", "User", "admin123", User.Role.ADMIN, company1, hr);

            // 3. A regular User for Innovate Inc.
            createUser("janesmith", "Jane", "Smith", "user123", User.Role.USER, company1, engineering);

            // 4. Another regular User in a different department
            createUser("johndoe", "John", "Doe", "user123", User.Role.USER, company1, sales);

            // 5. A user in the second company to demonstrate multi-tenancy
            createUser("peterjones", "Peter", "Jones", "user123", User.Role.USER, company2, engineering);


            log.info("Database seeding complete!");
        } else {
            log.info("Database is not empty. Skipping data seeding.");
        }
    }

    private Company createCompany(String name, String domain) {
        Company company = new Company();
        company.setName(name);
        company.setEmailDomain(domain);
        return companyRepository.save(company);
    }

    private Department createDepartment(String name) {
        Department dept = new Department();
        dept.setName(name);
        return departmentRepository.save(dept);
    }

    private void createUser(String username, String firstName, String lastName, String password, User.Role role, Company company, Department department) {
        User user = new User();
        user.setUsername(username);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(role);
        user.setStatus(User.UserStatus.APPROVED); // Pre-approve all seeded users
        user.setCompany(company);
        user.setDepartment(department);
        userRepository.save(user);
    }
}