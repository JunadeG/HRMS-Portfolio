package com.controller;


import com.model.User;
import com.service.AuthService;
import com.service.AdminService;
import com.DTO.RegistrationRequest;
import com.DTO.AdminUserUpdateDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
public class AdminController {

    private static final Logger log = LoggerFactory.getLogger(AdminController.class);

    private final AuthService authService;
    private final AdminService adminService;

    @Autowired
    public AdminController(AuthService authService, AdminService adminService) {
        this.authService = authService;
        this.adminService = adminService;
    }

    @GetMapping("/pending-approvals")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> getPendingApprovals(@AuthenticationPrincipal User currentUser) {
        log.info("AdminController.getPendingApprovals: Request received for admin: {}", (currentUser != null ? currentUser.getUsername() : "UNKNOWN_USER"));
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User authentication details not available. Please log in again."));
        }
        try {
            List<User> pendingUsers = authService.getPendingUsersForAdminScope(currentUser);
            log.info("AdminController.getPendingApprovals: Found {} pending users for admin {}'s scope.", pendingUsers.size(), currentUser.getUsername());
            return ResponseEntity.ok(pendingUsers);
        } catch (Exception e) {
            log.error("AdminController.getPendingApprovals: Error fetching pending approvals for admin {}: {}", currentUser.getUsername(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to retrieve pending approvals."));
        }
    }

    @DeleteMapping("/reject/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> rejectUser(@PathVariable Long id, @AuthenticationPrincipal User currentUser) {
        log.info("AdminController.rejectUser: Admin {} attempting to reject user ID: {}", (currentUser != null ? currentUser.getUsername() : "UNKNOWN_USER"), id);
        try {
            authService.rejectUser(id, currentUser);
            return ResponseEntity.ok(Map.of("message", "User rejected and removed successfully."));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/approve/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> approveUser(@PathVariable Long id, @AuthenticationPrincipal User currentUser) {
        log.info("AdminController.approveUser: Admin {} attempting to approve user ID: {}", (currentUser != null ? currentUser.getUsername() : "UNKNOWN_USER"), id);
        try {
            User approvedUser = authService.approveUser(id, currentUser);
            return ResponseEntity.ok(approvedUser);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/users")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> addUserByAdmin(@RequestBody RegistrationRequest registrationRequest, @AuthenticationPrincipal User adminUser) {
        log.info("AdminController.addUserByAdmin: Admin {} attempting to add user: {}", (adminUser != null ? adminUser.getUsername() : "UNKNOWN_USER"), registrationRequest.getUsername());
        try {
            User newUser = adminService.createUser(registrationRequest, adminUser);
            return ResponseEntity.status(HttpStatus.CREATED).body(newUser);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/users/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> deleteUserByAdmin(@PathVariable Long userId, @AuthenticationPrincipal User adminUser) {
        log.info("AdminController.deleteUserByAdmin: Admin {} attempting to delete user ID: {}", (adminUser != null ? adminUser.getUsername() : "UNKNOWN_USER"), userId);
        try {
            adminService.deleteUser(userId, adminUser);
            return ResponseEntity.ok(Map.of("message", "User deleted successfully."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/users/{userId}/department")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> updateUserDepartment(@PathVariable Long userId, @RequestBody Map<String, String> payload, @AuthenticationPrincipal User adminUser) {
        log.info("AdminController.updateUserDepartment: Admin {} updating department for user ID: {}", (adminUser != null ? adminUser.getUsername() : "UNKNOWN_USER"), userId);
        String newDepartmentName = payload.get("department");
        if (newDepartmentName == null || newDepartmentName.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing or empty 'department' field name."));
        }
        try {
            User updatedUser = adminService.updateUserDepartment(userId, newDepartmentName.trim(), adminUser);
            return ResponseEntity.ok(updatedUser);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/users")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> getUsersByAdminCompany(@AuthenticationPrincipal User adminUser) {
        log.info("AdminController.getUsersByAdminCompany: Admin {} requesting user list for their company.", (adminUser != null ? adminUser.getUsername() : "UNKNOWN_USER"));
        try {
            List<User> users = adminService.getUsersByAdminCompany(adminUser);
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Internal error retrieving users."));
        }
    }

    @PutMapping("/users/{userId}/details")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> updateUserDetailsByAdmin(@PathVariable Long userId, @RequestBody AdminUserUpdateDTO dto, @AuthenticationPrincipal User adminUser) {
        try {
            User updatedUser = adminService.updateUserDetailsByAdmin(userId, dto, adminUser);
            return ResponseEntity.ok(updatedUser);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Internal error updating user details for userId {}: {}", userId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "An internal error occurred while updating user details."));
        }
    }

    @PostMapping("/users/backfill-work-emails")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> backfillWorkEmails(@AuthenticationPrincipal User adminUser) {
        try {
            String resultMessage = adminService.backfillMissingWorkEmails(adminUser);
            return ResponseEntity.ok(Map.of("message", resultMessage));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error during Work Email backfill process: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "An unexpected error occurred during the data migration."));
        }
    }


    @GetMapping("/users/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> getUserById(@PathVariable Long userId, @AuthenticationPrincipal User adminUser) {
        try {
            User user = adminService.findUserByIdByAdmin(userId, adminUser);
            return ResponseEntity.ok(user);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/users/{userId}/complete-onboarding")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> completeUserOnboarding(@PathVariable Long userId, @AuthenticationPrincipal User adminUser) {
        try {
            User updatedUser = adminService.completeOnboarding(userId, adminUser);
            return ResponseEntity.ok(updatedUser);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        }
    }
}