package com.service;

import com.model.Company;
import com.model.User;
import com.repository.CompanyRepository;
import com.repository.UserRepository;
import org.apache.commons.lang3.RandomStringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
// Removed: import org.springframework.beans.factory.annotation.Value; // Not needed for companyEmailDomain anymore

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final CompanyRepository companyRepository; // Keep companyRepository if it's used elsewhere

    private static final int MIN_PASSWORD_LENGTH = 5;

    // Removed: @Value("${hrms.company.email.domain}") // This is no longer needed
    // private String companyEmailDomain;

    @Autowired
    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       CompanyRepository companyRepository, // Keep this if used for other methods
                       EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.companyRepository = companyRepository; // Initialize it
        this.emailService = emailService;
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
    public void save(User user) {
        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public User authenticate(String username, String password, Long companyId, String loginAs) {
        String normalizedUsername = username.trim().toLowerCase();
        Optional<User> userOptional = userRepository.findByUsername(normalizedUsername);

        if (userOptional.isEmpty()) {
            log.warn("Authentication failed: User '{}' not found.", normalizedUsername);
            throw new RuntimeException("Invalid credentials");
        }

        User user = userOptional.get();

        // --- COMPANY CHECK LOGIC (Fixed for Super Admin) ---
        // If the user is NOT a Super Admin, we must verify they belong to the selected company.
        // Super Admins bypass this check because they aren't tied to a specific company.
        if (user.getRole() != User.Role.SUPER_ADMIN) {
            if (user.getCompany() == null || !user.getCompany().getId().equals(companyId)) {
                log.warn("Authentication failed for user '{}': Incorrect company selected. User's company ID: {}, Provided company ID: {}",
                        normalizedUsername, (user.getCompany() != null ? user.getCompany().getId() : "null"), companyId);
                throw new RuntimeException("Incorrect company selected");
            }
        }

        // --- ROLE / TOGGLE CHECK LOGIC ---
        // 1. If trying to log in as "Admin", user MUST be ADMIN or SUPER_ADMIN
        if ("admin".equalsIgnoreCase(loginAs) && user.getRole() != User.Role.ADMIN && user.getRole() != User.Role.SUPER_ADMIN) {
            log.warn("Authentication failed for user '{}': Attempted admin login but role is {}", normalizedUsername, user.getRole());
            throw new RuntimeException("User is not authorized for admin access");
        }

        // 2. If trying to log in as "User", user MUST NOT be ADMIN or SUPER_ADMIN
        // (This forces Admins to use the Admin toggle, keeping the portals separate)
        if ("user".equalsIgnoreCase(loginAs) && (user.getRole() == User.Role.ADMIN || user.getRole() == User.Role.SUPER_ADMIN)) {
            log.warn("Authentication failed for admin/super_admin user '{}': Must log in via admin portal", normalizedUsername);
            throw new RuntimeException("Admins/Super Admins must log in via the admin portal");
        }

        // --- PASSWORD CHECK ---
        if (!passwordEncoder.matches(password, user.getPassword())) {
            log.warn("Authentication failed for user '{}': Password mismatch.", normalizedUsername);
            throw new RuntimeException("Invalid credentials");
        }

        // --- STATUS CHECK ---
        if (user.getStatus() != User.UserStatus.APPROVED) {
            log.warn("Authentication failed for user '{}': Account status is {}", normalizedUsername, user.getStatus());
            if (user.getStatus() == User.UserStatus.PENDING_APPROVAL) {
                throw new RuntimeException("User not approved. Awaiting admin activation.");
            } else {
                throw new RuntimeException("User account is inactive or rejected.");
            }
        }

        log.info("User '{}' authenticated successfully with role {}", normalizedUsername, user.getRole());
        return user;
    }

    @Transactional(readOnly = true)
    public User findByUsername(String username) {
        return userRepository.findByUsername(username.trim().toLowerCase()).orElse(null);
    }

    @Transactional(readOnly = true)
    public Optional<User> findByUsernameAndCompany(String username, Long companyId) {
        if (username == null || companyId == null) {
            return Optional.empty();
        }
        return userRepository.findByUsernameAndCompanyId(username.trim().toLowerCase(), companyId);
    }

    @Transactional(readOnly = true)
    public List<User> getUsersByStatus(User.UserStatus status) {
        log.debug("AuthService.getUsersByStatus: Fetching all users with status {}", status);
        return userRepository.findByStatus(status);
    }

    @Transactional(readOnly = true)
    public List<User> getPendingUsersForAdminScope(User adminUser) {
        if (adminUser == null) {
            log.warn("AuthService.getPendingUsersForAdminScope: adminUser is null, cannot fetch pending users.");
            return Collections.emptyList();
        }

        if (adminUser.getRole() == User.Role.SUPER_ADMIN) {
            log.info("AuthService.getPendingUsersForAdminScope: SUPER_ADMIN {} fetching all pending users.", adminUser.getUsername());
            return userRepository.findByStatus(User.UserStatus.PENDING_APPROVAL);
        } else if (adminUser.getRole() == User.Role.ADMIN) {
            if (adminUser.getCompany() == null || adminUser.getCompany().getId() == null) {
                log.warn("AuthService.getPendingUsersForAdminScope: ADMIN {} has no associated company, cannot fetch company-specific pending users.", adminUser.getUsername());
                return Collections.emptyList();
            }
            Long companyId = adminUser.getCompany().getId();
            log.info("AuthService.getPendingUsersForAdminScope: ADMIN {} fetching pending users for company ID: {}", adminUser.getUsername(), companyId);
            return userRepository.findByCompanyIdAndStatus(companyId, User.UserStatus.PENDING_APPROVAL);
        } else {
            log.warn("AuthService.getPendingUsersForAdminScope: User {} with role {} is not authorized to fetch pending users.", adminUser.getUsername(), adminUser.getRole());
            return Collections.emptyList();
        }
    }

    @Transactional
    public void rejectUser(Long id, User currentUser) {
        log.info("AuthService.rejectUser: Admin {} attempting to reject user ID: {}", currentUser.getUsername(), id);
        if (currentUser == null || (currentUser.getRole() != User.Role.ADMIN && currentUser.getRole() != User.Role.SUPER_ADMIN)) {
            throw new SecurityException("Unauthorized: You do not have permission to reject users.");
        }

        User userToReject = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));

        if (currentUser.getRole() == User.Role.ADMIN) {
            if (currentUser.getCompany() == null) {
                throw new SecurityException("Admin configuration error: No company associated with your account.");
            }
            if (userToReject.getCompany() == null || !userToReject.getCompany().getId().equals(currentUser.getCompany().getId())) {
                throw new SecurityException("Admins can only reject users within their own company.");
            }
        }

        if (userToReject.getStatus() != User.UserStatus.PENDING_APPROVAL) {
            throw new RuntimeException("Cannot reject user. User status is not PENDING_APPROVAL.");
        }

        userRepository.delete(userToReject);
        log.info("AuthService.rejectUser: Rejected (deleted) user {} by admin {}", userToReject.getUsername(), currentUser.getUsername());
    }

    @Transactional
    public User approveUser(Long id, User currentUser) {
        log.info("AuthService.approveUser: Admin {} attempting to approve user ID: {}", currentUser.getUsername(), id);
        if (currentUser == null || (currentUser.getRole() != User.Role.ADMIN && currentUser.getRole() != User.Role.SUPER_ADMIN)) {
            throw new SecurityException("Unauthorized: You do not have permission to approve users.");
        }

        User userToApprove = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));

        if (currentUser.getRole() == User.Role.ADMIN) {
            if (currentUser.getCompany() == null) {
                throw new SecurityException("Admin configuration error: No company associated with your account.");
            }
            if (userToApprove.getCompany() == null || !userToApprove.getCompany().getId().equals(currentUser.getCompany().getId())) {
                throw new SecurityException("Admins can only approve users within their own company.");
            }
        }

        // Updated logic starts here
        if(userToApprove.getStatus() == User.UserStatus.PENDING_APPROVAL) {
            userToApprove.setStatus(User.UserStatus.APPROVED);

            // Set the initial onboarding status
            userToApprove.setOnboardingStatus(User.OnboardingStatus.PENDING_DOCUMENTS);

            if (!StringUtils.hasText(userToApprove.getEmployeeId())) {
                String newEmployeeId = generateUniqueEmployeeId();
                userToApprove.setEmployeeId(newEmployeeId);
                log.info("AuthService.approveUser: Assigned new Employee ID {} to user {}", newEmployeeId, userToApprove.getUsername());
            }

            if (!StringUtils.hasText(userToApprove.getWorkEmail())) {
                Company userCompany = userToApprove.getCompany();
                if (userCompany != null && StringUtils.hasText(userCompany.getEmailDomain())) {
                    String workEmail = userToApprove.getUsername().toLowerCase() + "@" + userCompany.getEmailDomain();
                    userToApprove.setWorkEmail(workEmail);
                    log.info("AuthService.approveUser: Assigned new Work Email {} to user {}", workEmail, userToApprove.getUsername());
                } else {
                    log.warn("AuthService.approveUser: Could not generate work email for {}. User's company or its email domain is not configured.", userToApprove.getUsername());
                }
            }

            if (!StringUtils.hasText(userToApprove.getJobTitle())) {
                userToApprove.setJobTitle("Employee");
            }
            if (userToApprove.getStartDate() == null) {
                userToApprove.setStartDate(LocalDate.now());
            }

            if (userToApprove.getPaidLeaveBalance() == null || userToApprove.getPaidLeaveBalance() == 0.0) {
                userToApprove.setPaidLeaveBalance(15.0);
            }
            if (userToApprove.getSickLeaveBalance() == null || userToApprove.getSickLeaveBalance() == 0.0) {
                userToApprove.setSickLeaveBalance(10.0);
            }
            if (userToApprove.getFloaterLeaveBalance() == null || userToApprove.getFloaterLeaveBalance() == 0.0) {
                userToApprove.setFloaterLeaveBalance(2.0);
            }

            User savedUser = userRepository.save(userToApprove);
            log.info("AuthService.approveUser: User {} (ID: {}) approved by admin {}. Onboarding status set to PENDING_DOCUMENTS.",
                    savedUser.getUsername(), id, currentUser.getUsername());
            return savedUser;

        } else {
            throw new RuntimeException("User is not pending approval (Current status: " + userToApprove.getStatus() + ")");
        }
    }

    @Transactional
    public String generateResetToken(User user) {
        String token = UUID.randomUUID().toString();
        user.setResetToken(token);
        user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(15));
        userRepository.save(user);
        log.info("Generated reset token for user: {}", user.getUsername());
        return token;
    }

    @Transactional(readOnly = true)
    public boolean verifyPasswordResetToken(User user, String token) {
        boolean isValid = user.getResetToken() != null &&
                user.getResetToken().equals(token) &&
                user.getResetTokenExpiry() != null &&
                user.getResetTokenExpiry().isAfter(LocalDateTime.now());
        if (!isValid) {
            log.warn("Password reset token verification failed for user: {}", user.getUsername());
        }
        return isValid;
    }

    @Transactional
    public void clearPasswordResetToken(User user) {
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);
        log.info("Cleared reset token for user: {}", user.getUsername());
    }

    @Transactional
    public void resetPassword(User user, String newPassword) {
        if (!validatePasswordComplexity(newPassword)) {
            throw new IllegalArgumentException("Password does not meet complexity requirements.");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        clearPasswordResetToken(user);
        log.info("Password reset successfully for user: {}", user.getUsername());
    }

    public boolean validatePasswordComplexity(String password) {
        if (password == null || password.length() < MIN_PASSWORD_LENGTH) {
            log.warn("Password validation failed: Too short (less than {} characters).", MIN_PASSWORD_LENGTH);
            return false;
        }
        if (password.contains(" ")) {
            log.warn("Password validation failed: Contains whitespace.");
            return false;
        }


        return true;
    }

}
