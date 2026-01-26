package com.HRMSbackend.HRMSbackend.service;

import com.HRMSbackend.HRMSbackend.DTO.AdminUserUpdateDTO;
import com.HRMSbackend.HRMSbackend.DTO.RegistrationRequest;
import com.HRMSbackend.HRMSbackend.model.Company;
import com.HRMSbackend.HRMSbackend.model.Department;
import com.HRMSbackend.HRMSbackend.model.User;
import com.HRMSbackend.HRMSbackend.repository.DepartmentRepository;
import com.HRMSbackend.HRMSbackend.repository.UserRepository;
import org.apache.commons.lang3.RandomStringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.Comparator;
import java.util.List;

@Service
public class AdminService {

    private static final Logger log = LoggerFactory.getLogger(AdminService.class);
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthService authService;
    private final DepartmentRepository departmentRepository;

    @Autowired
    public AdminService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                        AuthService authService, DepartmentRepository departmentRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authService = authService;
        this.departmentRepository = departmentRepository;
    }

    private String generateUniqueEmployeeId() {
        String employeeId;
        final int idLength = 8;
        do {
            employeeId = RandomStringUtils.randomAlphanumeric(idLength).toUpperCase();
        } while (userRepository.existsByEmployeeId(employeeId));
        return employeeId;
    }

    @Transactional
    public User createUser(RegistrationRequest request, User adminUser) {
        if (request.getUsername() == null || request.getUsername().trim().isEmpty() ||
                request.getPassword() == null || request.getPassword().isEmpty() ||
                request.getFirstName() == null || request.getFirstName().trim().isEmpty() ||
                request.getLastName() == null || request.getLastName().trim().isEmpty() ||
                request.getDepartment() == null || request.getDepartment().trim().isEmpty()) {
            throw new IllegalArgumentException("Missing required fields (username, password, first name, last name, department).");
        }
        if (!authService.validatePasswordComplexity(request.getPassword())) {
            throw new IllegalArgumentException("Password must be at least 5 characters long and contain no spaces.");
        }
        String normalizedUsername = request.getUsername().trim().toLowerCase();
        if (userRepository.existsByUsername(normalizedUsername)) {
            throw new IllegalArgumentException("Username already exists.");
        }

        String requestedDepartmentName = request.getDepartment().trim();
        Department selectedDepartment = departmentRepository.findByNameIgnoreCase(requestedDepartmentName)
                .orElseThrow(() -> new IllegalArgumentException("Invalid department specified: " + requestedDepartmentName));

        User newUser = new User();
        newUser.setFirstName(request.getFirstName().trim());
        newUser.setLastName(request.getLastName().trim());
        newUser.setUsername(normalizedUsername);
        newUser.setMobileNumber(request.getMobileNumber());
        newUser.setPassword(passwordEncoder.encode(request.getPassword()));

        // Assign the company of the admin creating the user
        Company adminCompany = adminUser.getCompany();
        newUser.setCompany(adminCompany);
        newUser.setDepartment(selectedDepartment);
        newUser.setEmployeeId(generateUniqueEmployeeId()); // Auto-generate ID

        // Dynamically get the email domain from the admin's company
        if (adminCompany != null && StringUtils.hasText(adminCompany.getEmailDomain())) {
            newUser.setWorkEmail(newUser.getUsername().toLowerCase() + "@" + adminCompany.getEmailDomain());
            log.info("Generated work email '{}' for new user {}", newUser.getWorkEmail(), newUser.getUsername());
        } else {
            log.warn("Could not generate work email for new user {}. Admin's company or its email domain is not configured.", newUser.getUsername());
        }


        try {
            newUser.setRole(User.Role.USER);
            System.out.println("Admin (" + adminUser.getUsername() + ") creating USER: " + newUser.getUsername());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid role specified internally. Contact support.");
        }

        newUser.setStatus(User.UserStatus.APPROVED);
        return userRepository.save(newUser);
    }

    @Transactional
    public void deleteUser(Long userIdToDelete, User adminUser) {
        User userToDelete = userRepository.findById(userIdToDelete)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userIdToDelete));

        checkAdminCompanyPermission(userToDelete.getCompany(), adminUser, "delete");

        if (userToDelete.getId().equals(adminUser.getId())) {
            throw new SecurityException("Admin cannot delete themselves.");
        }

        if (userToDelete.getRole() == User.Role.ADMIN || userToDelete.getRole() == User.Role.SUPER_ADMIN) {
            throw new SecurityException("Cannot delete admin or super admin users via this method.");
        }

        userRepository.delete(userToDelete);
        System.out.println("Admin " + adminUser.getUsername() + " deleted user " + userToDelete.getUsername() + " (ID: " + userIdToDelete + ")");
    }

    @Transactional
    public User updateUserDepartment(Long userIdToUpdate, String newDepartmentName, User adminUser) {
        if (!StringUtils.hasText(newDepartmentName)) {
            throw new IllegalArgumentException("New department name cannot be blank.");
        }
        User userToUpdate = userRepository.findById(userIdToUpdate)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userIdToUpdate));

        checkAdminCompanyPermission(userToUpdate.getCompany(), adminUser, "update");

        Department newDepartment = departmentRepository.findByNameIgnoreCase(newDepartmentName.trim())
                .orElseThrow(() -> new IllegalArgumentException("Invalid department specified: " + newDepartmentName));
        userToUpdate.setDepartment(newDepartment);
        return userRepository.save(userToUpdate);
    }

    @Transactional(readOnly = true)
    public List<User> getUsersByAdminCompany(User adminUser) {
        if (adminUser == null || adminUser.getCompany() == null) {
            System.err.println("Attempt to fetch users for admin with null adminUser or company.");
            return List.of();
        }
        Long companyId = adminUser.getCompany().getId();
        List<User> users = userRepository.findByCompanyId(companyId);
        users.sort(Comparator.comparing(User::getId));
        return users;
    }

    @Transactional
    public User updateUserDetailsByAdmin(Long userId, AdminUserUpdateDTO dto, User adminUser) {
        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));

        checkAdminCompanyPermission(targetUser.getCompany(), adminUser, "update user details for");

        if (StringUtils.hasText(dto.getEmployeeId())) {
            targetUser.setEmployeeId(dto.getEmployeeId().trim());
        }

        if (StringUtils.hasText(dto.getJobTitle())) {
            targetUser.setJobTitle(dto.getJobTitle().trim());
        }

        if (dto.getReportingManagerId() != null) {
            if (dto.getReportingManagerId().equals(userId)) {
                throw new IllegalArgumentException("User cannot report to themselves.");
            }
            User reportingManager = userRepository.findById(dto.getReportingManagerId())
                    .orElseThrow(() -> new IllegalArgumentException("Reporting Manager not found with ID: " + dto.getReportingManagerId()));
            targetUser.setReportingManager(reportingManager);
        } else {
            targetUser.setReportingManager(null);
        }

        if (dto.getProjectManagerId() != null) {
            if (dto.getProjectManagerId().equals(userId)) {
                throw new IllegalArgumentException("User cannot be their own project manager.");
            }
            User projectManager = userRepository.findById(dto.getProjectManagerId())
                    .orElseThrow(() -> new IllegalArgumentException("Project Manager not found with ID: " + dto.getProjectManagerId()));
            targetUser.setProjectManager(projectManager);
        } else {
            targetUser.setProjectManager(null);
        }

        return userRepository.save(targetUser);
    }

    @Transactional
    public String backfillMissingEmployeeIds(User adminUser) {
        if (adminUser.getRole() != User.Role.SUPER_ADMIN) {
            throw new SecurityException("This operation is restricted to Super Administrators only.");
        }
        List<User> usersToUpdate = userRepository.findByStatusAndEmployeeIdIsNullOrEmployeeIdIs(User.UserStatus.APPROVED, "");

        if (usersToUpdate.isEmpty()) {
            return "No approved users found missing an Employee ID. Data is up-to-date.";
        }

        int count = 0;
        for (User user : usersToUpdate) {
            String newEmployeeId = generateUniqueEmployeeId();
            user.setEmployeeId(newEmployeeId);
            userRepository.save(user);
            count++;
            log.info("Backfilled Employee ID {} for user {}", newEmployeeId, user.getUsername());
        }
        return String.format("Successfully assigned unique Employee IDs to %d existing user(s).", count);
    }


    @Transactional
    public String backfillMissingWorkEmails(User adminUser) {
        // This powerful operation is restricted to SUPER_ADMIN only for safety.
        if (adminUser.getRole() != User.Role.SUPER_ADMIN) {
            throw new SecurityException("This operation is restricted to Super Administrators only.");
        }

        // Find all approved users who are missing a work email.
        List<User> usersToUpdate = userRepository.findByStatusAndWorkEmailIsNullOrWorkEmailIs(User.UserStatus.APPROVED, "");

        if (usersToUpdate.isEmpty()) {
            return "No approved users found missing a work email. All users are up-to-date.";
        }

        int count = 0;
        int skipped = 0;
        for (User user : usersToUpdate) {
            Company userCompany = user.getCompany();
            // Check if the user's company and its domain are properly configured before generating email.
            if (userCompany != null && StringUtils.hasText(userCompany.getEmailDomain())) {
                String workEmail = user.getUsername().toLowerCase() + "@" + userCompany.getEmailDomain();
                user.setWorkEmail(workEmail);
                userRepository.save(user);
                count++;
                log.info("Backfilled Work Email {} for user {}", workEmail, user.getUsername());
            } else {
                // If the company's domain isn't set, skip this user and log a warning.
                skipped++;
                log.warn("Skipping work email backfill for user {}. Reason: Company or company email domain is not configured.", user.getUsername());
            }
        }

        String responseMessage = String.format("Successfully assigned work emails to %d existing user(s).", count);
        if (skipped > 0) {
            responseMessage += String.format(" Skipped %d user(s) due to missing company domain configuration.", skipped);
        }
        return responseMessage;
    }

    @Transactional(readOnly = true)
    public User findUserByIdByAdmin(Long userId, User adminUser) {
        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));

        // Use the existing helper to ensure the admin has permission to view this user
        checkAdminCompanyPermission(targetUser.getCompany(), adminUser, "view user");

        return targetUser;
    }

    private void checkAdminCompanyPermission(Company targetCompany, User adminUser, String action) {
        if (adminUser.getRole() == User.Role.SUPER_ADMIN) {
            return;
        }
        if (targetCompany == null || adminUser.getCompany() == null || !targetCompany.getId().equals(adminUser.getCompany().getId())) {
            throw new SecurityException("Admin cannot " + action + " users from other companies.");
        }
    }


    @Transactional
    public User completeOnboarding(Long userId, User adminUser) {
        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));

        checkAdminCompanyPermission(targetUser.getCompany(), adminUser, "complete onboarding for");

        if (targetUser.getOnboardingStatus() == User.OnboardingStatus.COMPLETED) {
            throw new IllegalStateException("Onboarding for this user has already been completed.");
        }

        targetUser.setOnboardingStatus(User.OnboardingStatus.COMPLETED);
        log.info("Onboarding for user '{}' marked as COMPLETED by admin '{}'", targetUser.getUsername(), adminUser.getUsername());
        return userRepository.save(targetUser);
    }
}