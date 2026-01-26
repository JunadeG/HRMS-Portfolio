// src/main/java/com/HRMSbackend/HRMSbackend/controller/MeetingController.java
package com.HRMSbackend.HRMSbackend.controller;

import com.HRMSbackend.HRMSbackend.DTO.MeetingAttendeeDTO;
import com.HRMSbackend.HRMSbackend.DTO.MeetingCreateDTO;
import com.HRMSbackend.HRMSbackend.model.Meeting;
import com.HRMSbackend.HRMSbackend.model.MeetingAttendee;
import com.HRMSbackend.HRMSbackend.model.MeetingResponseStatus;
import com.HRMSbackend.HRMSbackend.model.User;
import com.HRMSbackend.HRMSbackend.service.MeetingService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/meetings") // Base path for meeting-related actions
public class MeetingController {

    private static final Logger log = LoggerFactory.getLogger(MeetingController.class);

    @Autowired
    private MeetingService meetingService;

    /**
     * Endpoint for creating a new meeting.
     * Requires ADMIN or SUPER_ADMIN role (adjust roles as needed).
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')") // Adjust roles if Managers can create meetings
    public ResponseEntity<?> createMeeting(@Valid @RequestBody MeetingCreateDTO meetingDTO,
                                           BindingResult bindingResult,
                                           @AuthenticationPrincipal User currentUser) {

        // DTO Validation (@NotBlank, @NotNull, @FutureOrPresent etc.)
        if (bindingResult.hasErrors()) {
            Map<String, String> errors = bindingResult.getFieldErrors().stream()
                    .collect(Collectors.toMap(FieldError::getField, FieldError::getDefaultMessage));
            log.warn("Validation errors creating meeting by user {}: {}", currentUser.getUsername(), errors);
            return ResponseEntity.badRequest().body(Map.of("error", "Validation failed", "details", errors));
        }

        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not authenticated"));
        }

        log.info("Received request to create meeting by user: {} for company ID: {}",
                currentUser.getUsername(), currentUser.getCompany() != null ? currentUser.getCompany().getId() : "N/A");

        try {
            Meeting createdMeeting = meetingService.createMeeting(meetingDTO, currentUser);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdMeeting);
        } catch (IllegalArgumentException | IllegalStateException e) {
            log.warn("Error creating meeting for user {}: {}", currentUser.getUsername(), e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error creating meeting for user {}: {}", currentUser.getUsername(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "An unexpected error occurred while creating the meeting."));
        }
    }

    // --- TODO: Add other endpoints for managing meetings ---
    /*
    @GetMapping
    @PreAuthorize("isAuthenticated()") // Example: Any authenticated user can view meetings
    public ResponseEntity<?> getMeetings(@RequestParam(required = false) LocalDate date, @AuthenticationPrincipal User currentUser) {
         // Implementation in MeetingService needed
         // List<Meeting> meetings = meetingService.getMeetingsForCompany(currentUser, date); // Filter by date?
         // return ResponseEntity.ok(meetings);
        return ResponseEntity.ok("GET meetings endpoint not yet implemented");
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')") // Example: Only Admins can update
    public ResponseEntity<?> updateMeeting(...) { ... }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')") // Example: Only Admins can delete
    public ResponseEntity<?> deleteMeeting(...) { ... }*/

    @PostMapping("/{meetingId}/respond")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> respondToMeetingInvitation(
            @PathVariable Long meetingId,
            @RequestBody Map<String, String> payload,
            @AuthenticationPrincipal User currentUser) {

        String responseStr = payload.get("response");
        MeetingResponseStatus responseStatus;
        try {
            responseStatus = MeetingResponseStatus.valueOf(responseStr.toUpperCase());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid response value. Must be ACCEPTED or DECLINED."));
        }

        try {
            // This method now returns a DTO, not an entity
            MeetingAttendeeDTO updatedResponse = meetingService.respondToMeeting(meetingId, currentUser, responseStatus);
            return ResponseEntity.ok(updatedResponse);
        } catch (Exception e) {
            log.warn("Error responding to meeting invitation for user {}: {}", currentUser.getUsername(), e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}


