package com.controller;

import com.DTO.NoticeCreateDTO;
import com.model.Notice;
import com.model.User;
import com.service.NoticeService;
import jakarta.validation.Valid; // For DTO validation
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.BindingResult; // To catch validation errors
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notices") // Base path for notice-related actions
public class NoticeController {

    private static final Logger log = LoggerFactory.getLogger(NoticeController.class);

    @Autowired
    private NoticeService noticeService;

    /**
     * Endpoint for creating a new notice.
     * Requires ADMIN or SUPER_ADMIN role.
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')") // Only Admins/SuperAdmins can create
    public ResponseEntity<?> createNotice(@Valid @RequestBody NoticeCreateDTO noticeDTO,
                                          BindingResult bindingResult, // Inject BindingResult for validation errors
                                          @AuthenticationPrincipal User currentUser) {

        // Check for DTO validation errors defined by annotations (@NotBlank, @NotNull etc.)
        if (bindingResult.hasErrors()) {
            // Collect validation errors into a readable string or map
            Map<String, String> errors = bindingResult.getFieldErrors().stream()
                    .collect(Collectors.toMap(FieldError::getField, FieldError::getDefaultMessage));
            log.warn("Validation errors creating notice by user {}: {}", currentUser.getUsername(), errors);
            return ResponseEntity.badRequest().body(Map.of("error", "Validation failed", "details", errors));
        }

        // Redundant check due to PreAuthorize, but safe
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not authenticated"));
        }

        log.info("Received request to create notice by user: {} for company ID: {}",
                currentUser.getUsername(), currentUser.getCompany() != null ? currentUser.getCompany().getId() : "N/A");

        try {
            Notice createdNotice = noticeService.createNotice(noticeDTO, currentUser);
            // Return 201 Created status with the created notice object
            return ResponseEntity.status(HttpStatus.CREATED).body(createdNotice);
        } catch (IllegalArgumentException | IllegalStateException e) {
            // Handle specific validation or state errors from the service
            log.warn("Error creating notice for user {}: {}", currentUser.getUsername(), e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            // Catch any other unexpected errors
            log.error("Unexpected error creating notice for user {}: {}", currentUser.getUsername(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "An unexpected error occurred while creating the notice."));
        }
    }

    // --- TODO: Add other endpoints for managing notices ---
    /*
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')") // Example: Only admins can list all manageable notices
    public ResponseEntity<?> getAllNotices(@AuthenticationPrincipal User currentUser) {
        // Implementation in NoticeService needed
        // List<Notice> notices = noticeService.getAllNoticesForCompany(currentUser);
        // return ResponseEntity.ok(notices);
        return ResponseEntity.ok("GET all notices endpoint not yet implemented");
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> updateNotice(@PathVariable Long id, @Valid @RequestBody NoticeUpdateDTO dto, BindingResult bindingResult, @AuthenticationPrincipal User currentUser) {
         // Implementation in NoticeService needed
         // ... validation ...
         // Notice updatedNotice = noticeService.updateNotice(id, dto, currentUser);
         // return ResponseEntity.ok(updatedNotice);
        return ResponseEntity.ok("PUT notice endpoint not yet implemented");
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> deleteNotice(@PathVariable Long id, @AuthenticationPrincipal User currentUser) {
         // Implementation in NoticeService needed
         // noticeService.deleteNotice(id, currentUser);
         // return ResponseEntity.noContent().build(); // 204 No Content on successful delete
         return ResponseEntity.ok("DELETE notice endpoint not yet implemented");
    }
    */

}