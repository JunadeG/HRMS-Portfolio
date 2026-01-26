// src/main/java/com/HRMSbackend/HRMSbackend/controller/AuthController.java
package com.HRMSbackend.HRMSbackend.controller;

import com.HRMSbackend.HRMSbackend.DTO.*;
import com.HRMSbackend.HRMSbackend.model.Company;
import com.HRMSbackend.HRMSbackend.model.Department;
import com.HRMSbackend.HRMSbackend.model.User;
import com.HRMSbackend.HRMSbackend.repository.CompanyRepository;
import com.HRMSbackend.HRMSbackend.repository.DepartmentRepository;
import com.HRMSbackend.HRMSbackend.repository.UserRepository;
import com.HRMSbackend.HRMSbackend.service.AuthService;
import com.HRMSbackend.HRMSbackend.security.JwtUtil;
import com.HRMSbackend.HRMSbackend.service.EmailService;
import org.slf4j.Logger; // Import Logger
import org.slf4j.LoggerFactory; // Import LoggerFactory
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Collections; // Import Collections
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
public class AuthController {

    // *** Add Logger ***
    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    private final AuthService authService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;
    private final CompanyRepository companyRepository;
    private final DepartmentRepository departmentRepository;

    @Value("${frontend.url}")
    private String frontendUrl;

    @Autowired
    public AuthController(AuthService authService, UserRepository userRepository,
                          PasswordEncoder passwordEncoder, JwtUtil jwtUtil, EmailService emailService,
                          CompanyRepository companyRepository,
                          DepartmentRepository departmentRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.emailService = emailService;
        this.companyRepository = companyRepository;
        this.departmentRepository = departmentRepository;
    }

    // --- Registration Endpoint --- (Keep existing)
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegistrationRequest registrationRequest) {
        // ... (existing registration logic - no changes needed for revert) ...
        if (registrationRequest.getUsername() == null || registrationRequest.getUsername().trim().isEmpty() ||
                registrationRequest.getPassword() == null || registrationRequest.getPassword().isEmpty() ||
                registrationRequest.getCompanyId() == null ||
                registrationRequest.getDepartment() == null || registrationRequest.getDepartment().trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse("Missing required fields (username, password, companyId, department)"));
        }
        String normalizedUsername = registrationRequest.getUsername().trim().toLowerCase();
        if (userRepository.existsByUsername(normalizedUsername)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse("Username already exists"));
        }
        if (!authService.validatePasswordComplexity(registrationRequest.getPassword())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse("Password must be at least 5 characters long and contain no spaces."));
        }
        Optional<Company> companyOptional = companyRepository.findById(registrationRequest.getCompanyId());
        if (companyOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse("Selected company not found"));
        }
        Company selectedCompany = companyOptional.get();
        Department selectedDepartment;
        String requestedDepartmentName = registrationRequest.getDepartment().trim();
        Optional<Department> departmentOptional = departmentRepository.findByNameIgnoreCase(requestedDepartmentName);
        if (departmentOptional.isPresent()) {
            selectedDepartment = departmentOptional.get();
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse("Invalid department specified: '" + requestedDepartmentName + "'. Please choose from the list."));
        }
        User user = new User();
        user.setFirstName(registrationRequest.getFirstName());
        user.setLastName(registrationRequest.getLastName());
        user.setUsername(normalizedUsername);
        user.setMobileNumber(registrationRequest.getMobileNumber());
        user.setPassword(passwordEncoder.encode(registrationRequest.getPassword()));
        user.setCompany(selectedCompany);
        user.setDepartment(selectedDepartment);
        user.setRole(User.Role.USER);
        user.setStatus(User.UserStatus.PENDING_APPROVAL);
        try {
            userRepository.save(user);
            log.info("User registered successfully (pending approval): {}", user.getUsername());
            return ResponseEntity.ok(Map.of("message", "User registered successfully. Account is pending administrator approval."));
        } catch (Exception e) {
            log.error("Error saving registered user: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponse("Failed to save user registration."));
        }
    }

    // --- LOGIN Endpoint --- (Keep existing)
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginRequest loginRequest) {
        // ... (existing login logic - no changes needed for revert) ...
        try {
            User user = authService.authenticate(
                    loginRequest.getUsername(),
                    loginRequest.getPassword(),
                    loginRequest.getCompanyId(),
                    loginRequest.getLoginAs()
            );
            final String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());
            LoginResponse loginResponse = new LoginResponse(user.getUsername(), user.getRole().name(), token);
            log.info("Login successful for user: {} with role: {}", user.getUsername(), user.getRole().name());
            return ResponseEntity.ok(loginResponse);
        } catch (RuntimeException e) {
            log.error("Login failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected login error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("An internal server error occurred during login."));
        }
    }

    // --- Get Companies Endpoint --- (With corrected logging)
    @GetMapping("/companies")
    public ResponseEntity<?> getCompanies() {
        log.info("Received request for /auth/companies"); // Log request entry
        try {
            List<Company> companies = companyRepository.findAll();
            if (companies == null) { // Check for null explicitly
                log.warn("/auth/companies: companyRepository.findAll() returned null!");
                companies = Collections.emptyList(); // Ensure we always have a list
            }

            if (companies.isEmpty()) {
                log.info("/auth/companies: No companies found in the database. Returning empty list.");
            } else {
                companies.sort(Comparator.comparing(Company::getName, String.CASE_INSENSITIVE_ORDER));
                log.info("/auth/companies: Found {} companies. Returning list.", companies.size());
            }
            // *** Log the list just before returning ***
            log.debug("/auth/companies: Returning companies data: {}", companies);
            return ResponseEntity.ok(companies); // Return the list directly

        } catch (Exception e) {
            // Log the specific exception
            log.error("Error fetching companies in AuthController: {}", e.getMessage(), e);
            // Return a structured JSON error
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to load company list due to an internal server error."));
        }
    }

    // --- Forgot Password Endpoint --- (Keep existing)
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, Object> payload) {
        // ... (existing forgot password logic - no changes needed for revert) ...
        String username = (String) payload.get("username");
        Long companyId = payload.get("companyId") != null ? ((Number) payload.get("companyId")).longValue() : null;
        if (username == null || username.trim().isEmpty() || companyId == null) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Username and companyId are required."));
        }
        String normalizedUsername = username.trim().toLowerCase();
        Optional<User> userOptional = authService.findByUsernameAndCompany(normalizedUsername, companyId);
        String genericMessage = "If an account exists for this username and company, password reset instructions have been processed.";
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            try {
                String token = authService.generateResetToken(user);
                String resetUrl = UriComponentsBuilder.fromHttpUrl(frontendUrl)
                        .pathSegment("reset-password", token)
                        .queryParam("username", user.getUsername())
                        .build()
                        .toUriString();
                String mailtrapRecipientAddress = user.getUsername() + "@mailtrap.example";
                log.info("Attempting to send reset instructions via Mailtrap TO: {} (derived from username: {})", mailtrapRecipientAddress, user.getUsername());
                emailService.sendPasswordResetLink(mailtrapRecipientAddress, resetUrl);
                log.info("Call to emailService.sendPasswordResetLink completed for username {}", user.getUsername());
            } catch (Exception e) {
                log.error("FAILED to process password reset for user {}. Error: {}", normalizedUsername, e.getMessage(), e);
            }
        } else {
            log.info("Password reset requested for non-existent user/company combination: {} / Company ID {}", normalizedUsername, companyId);
        }
        return ResponseEntity.ok(Map.of("message", genericMessage));
    }

    // --- Reset Password Endpoint --- (Keep existing)
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        // ... (existing reset password logic - no changes needed for revert) ...
        String username = request.getUsername();
        String token = request.getToken();
        String newPassword = request.getNewPassword();
        if (username == null || token == null || newPassword == null || username.trim().isEmpty() || token.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Username, token, and new password are required."));
        }
        Optional<User> userOptional = userRepository.findByUsername(username.trim().toLowerCase());
        if (userOptional.isEmpty()) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Invalid username or token."));
        }
        User user = userOptional.get();
        if (!authService.verifyPasswordResetToken(user, token)) {
            authService.clearPasswordResetToken(user);
            return ResponseEntity.badRequest().body(new ErrorResponse("Invalid or expired reset token. Please request a new one."));
        }
        try {
            authService.resetPassword(user, newPassword);
            return ResponseEntity.ok(Map.of("message", "Password has been reset successfully. You can now log in."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            log.error("Error during password reset: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponse("An internal error occurred. Please try again later."));
        }
    }

    // --- Error Response Class ---
    static class ErrorResponse {
        private String error;
        public ErrorResponse(String error) { this.error = error; }
        public String getError() { return error; }
        // Need setter if Jackson needs it (usually not for deserialization only)
        // public void setError(String error) { this.error = error; }
    }
}