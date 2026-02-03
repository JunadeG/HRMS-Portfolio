package com.controller;

import com.model.User;
import com.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/superadmin")
public class SuperAdminController {

    private final UserRepository userRepository;

    // Constructor-based injection for UserRepository
    public SuperAdminController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @PutMapping("/approve-admin/{adminId}")
    public ResponseEntity<String> approveAdmin(@PathVariable Long adminId) {
        Optional<User> optionalUser = userRepository.findById(adminId);

        if (!optionalUser.isPresent()) {
            return ResponseEntity.badRequest().body("User not found.");
        }

        User user = optionalUser.get();

        // Check if the user is an admin and has a status of PENDING_APPROVAL
        if (!user.getRole().equals(User.Role.ADMIN)) {
            return ResponseEntity.badRequest().body("User is not an admin.");
        }

        if (user.getStatus().equals(User.UserStatus.APPROVED)) {
            return ResponseEntity.badRequest().body("User is already approved.");
        }

        // If status is PENDING_APPROVAL, approve the user
        if (user.getStatus().equals(User.UserStatus.PENDING_APPROVAL)) {
            user.setStatus(User.UserStatus.APPROVED);
            userRepository.save(user);
            return ResponseEntity.ok("Admin approved successfully.");
        }

        return ResponseEntity.badRequest().body("User is not pending approval.");
    }
}
