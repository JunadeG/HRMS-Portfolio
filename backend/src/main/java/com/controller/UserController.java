package com.HRMSbackend.HRMSbackend.controller;

import com.HRMSbackend.HRMSbackend.DTO.UserProfileDTO;
import com.HRMSbackend.HRMSbackend.DTO.UserProfileUpdateDTO;
import com.HRMSbackend.HRMSbackend.model.User;
import com.HRMSbackend.HRMSbackend.service.FileUploadService;
import com.HRMSbackend.HRMSbackend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.HRMSbackend.HRMSbackend.DTO.MyTeamViewDTO;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final FileUploadService fileUploadService;

    @Autowired
    public UserController(UserService userService, FileUploadService fileUploadService) {
        this.userService = userService;
        this.fileUploadService = fileUploadService;
    }

    @GetMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getUserProfile(@AuthenticationPrincipal User currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not authenticated."));
        }
        // Call the service method that handles the DTO conversion inside a transaction
        UserProfileDTO userProfileDTO = userService.getUserProfileDto(currentUser.getId());
        return ResponseEntity.ok(userProfileDTO);
    }

    @PutMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateUserProfile(@AuthenticationPrincipal User currentUser, @RequestBody UserProfileUpdateDTO updateDTO) {
        if (currentUser == null) { return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not authenticated")); }
        try {
            User updatedUser = userService.updateUserProfile(currentUser, updateDTO);
            // Return the updated DTO after saving
            return ResponseEntity.ok(new UserProfileDTO(updatedUser));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/profile/picture")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> uploadProfilePicture(@AuthenticationPrincipal User currentUser, @RequestParam("profilePicture") MultipartFile file) {
        if (currentUser == null) { return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not authenticated")); }
        if (file == null || file.isEmpty()) { return ResponseEntity.badRequest().body(Map.of("error", "Please select a file to upload.")); }
        try {
            String savedFilePath = fileUploadService.saveProfilePicture(currentUser.getId(), file);
            userService.updateProfilePicturePath(currentUser.getId(), savedFilePath);
            return ResponseEntity.ok(Map.of("message", "Profile picture updated successfully", "profilePicturePath", savedFilePath));
        } catch (IOException | IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/my-team")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getMyTeam(@AuthenticationPrincipal User currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not authenticated."));
        }
        MyTeamViewDTO teamView = userService.getMyTeamView(currentUser);
        return ResponseEntity.ok(teamView);
    }

    @GetMapping("/view/{userId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getPublicUserProfile(@PathVariable Long userId, @AuthenticationPrincipal User requester) {
        if (requester == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not authenticated."));
        }
        try {
            UserProfileDTO userProfileDTO = userService.getPublicUserProfile(userId, requester);
            return ResponseEntity.ok(userProfileDTO);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        }
    }
}