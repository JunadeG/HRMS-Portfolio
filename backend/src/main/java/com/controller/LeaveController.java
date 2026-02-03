package com.controller;

import com.DTO.LeaveBalanceDTO;
import com.DTO.LeaveRequestCreateDTO;
import com.DTO.LeaveRequestViewDTO;
import com.model.User;
import com.service.LeaveService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime; // Make sure this is imported
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/leave") // Base path for leave-related actions
public class LeaveController {

    private static final Logger log = LoggerFactory.getLogger(LeaveController.class);

    @Autowired
    private LeaveService leaveService;

    // --- User: Request Leave ---
    @PostMapping
    @PreAuthorize("isAuthenticated()") // Any logged-in user can request leave
    public ResponseEntity<?> requestLeave(@Valid @RequestBody LeaveRequestCreateDTO requestDTO,
                                          BindingResult bindingResult, // For DTO validation
                                          @AuthenticationPrincipal User currentUser) {
        // *** ADDED LOGS HERE for debugging date validation ***
        log.info("LeaveController: Received leave request from user: {}", (currentUser != null ? currentUser.getUsername() : "UNKNOWN_USER"));
        log.info("LeaveController: Server current date/time at request entry: {}", LocalDateTime.now());
        log.info("LeaveController: DTO received - StartDate: {}, EndDate: {}, LeaveType: {}, Reason: '{}'",
                requestDTO.getStartDate(), requestDTO.getEndDate(), requestDTO.getLeaveType(), requestDTO.getReason());
        // *** END OF ADDED LOGS ***

        // Check authentication principal
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not authenticated"));
        }
        // Check DTO validation results
        if (bindingResult.hasErrors()) {
            log.warn("Validation failed for leave request by user {}: {}", currentUser.getUsername(), bindingResult.getAllErrors());
            return ResponseEntity.badRequest().body(Map.of("error", "Validation failed", "details", bindingResult.getAllErrors()));
        }
        try {
            LeaveRequestViewDTO createdRequest = leaveService.requestLeave(requestDTO, currentUser);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdRequest);
        } catch (IllegalArgumentException e) {
            // Catch specific errors like invalid date range from service
            log.warn("Leave request validation failed for user {}: {}", currentUser.getUsername(), e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            // Catch unexpected server errors
            log.error("Error creating leave request for user {}: {}", currentUser.getUsername(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Could not process leave request due to an internal error."));
        }
    }

    // --- User: Get My Leave Requests ---
    @GetMapping("/my-requests")
    @PreAuthorize("isAuthenticated()") // Any logged-in user can see their own requests
    public ResponseEntity<?> getMyLeaveRequests(@AuthenticationPrincipal User currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not authenticated"));
        }
        try {
            List<LeaveRequestViewDTO> requests = leaveService.getLeaveRequestsForUser(currentUser);
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            log.error("Error fetching leave requests for user {}: {}", currentUser.getUsername(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Could not retrieve leave requests."));
        }
    }

    // --- User: Get My Leave Balances ---
    @GetMapping("/balances")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getMyLeaveBalances(@AuthenticationPrincipal User currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not authenticated."));
        }
        try {
            LeaveBalanceDTO balances = leaveService.getLeaveBalances(currentUser);
            return ResponseEntity.ok(balances);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error fetching leave balances for user {}: {}", currentUser.getUsername(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Could not retrieve leave balances."));
        }
    }

    // --- User: Cancel My Pending Leave Request ---
    @PostMapping("/{id}/cancel") // Using POST for the cancel action
    @PreAuthorize("isAuthenticated()") // Any authenticated user can attempt to cancel
    public ResponseEntity<?> cancelLeaveRequest(@PathVariable Long id, @AuthenticationPrincipal User currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not authenticated"));
        }
        log.info("User '{}' attempting to cancel leave request ID: {}", currentUser.getUsername(), id);
        try {
            LeaveRequestViewDTO cancelledRequest = leaveService.cancelLeaveRequest(id, currentUser);
            log.info("Leave request ID {} cancelled successfully by user '{}'", id, currentUser.getUsername());
            return ResponseEntity.ok(Map.of("message", "Leave request cancelled successfully.", "request", cancelledRequest));
        } catch (IllegalArgumentException | IllegalStateException e) {
            log.warn("Failed to cancel leave request {} for user {}: {}", id, currentUser.getUsername(), e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        } catch (AccessDeniedException e) {
            log.warn("Access Denied: User '{}' attempted to cancel leave request ID {} belonging to another user.", currentUser.getUsername(), id);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error cancelling leave request {} for user {}: {}", id, currentUser.getUsername(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Could not process cancellation request due to an internal error."));
        }
    }

    // --- Admin: Get Pending Leave Requests ---
    @GetMapping("/admin/pending")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')") // Only admins can view pending requests for their company
    public ResponseEntity<?> getPendingRequestsForAdmin(@AuthenticationPrincipal User adminUser) {
        if (adminUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Admin user not authenticated"));
        }
        try {
            List<LeaveRequestViewDTO> pendingRequests = leaveService.getPendingLeaveRequestsForAdmin(adminUser);
            return ResponseEntity.ok(pendingRequests);
        } catch (Exception e) {
            log.error("Error fetching pending leave requests for admin {}: {}", adminUser.getUsername(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Could not retrieve pending leave requests."));
        }
    }

    // --- Admin: Approve Leave Request ---
    @PostMapping("/admin/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')") // Only admins can approve
    public ResponseEntity<?> approveLeaveRequest(@PathVariable Long id, @AuthenticationPrincipal User adminUser) {
        if (adminUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Admin user not authenticated"));
        }
        try {
            LeaveRequestViewDTO approvedRequest = leaveService.approveLeave(id, adminUser);
            return ResponseEntity.ok(approvedRequest);
        } catch (IllegalArgumentException | IllegalStateException e) {
            log.warn("Failed to approve leave request {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (AccessDeniedException e) {
            log.warn("Access denied for admin {} approving leave request {}", adminUser.getUsername(), id);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error approving leave request {} by admin {}: {}", id, adminUser.getUsername(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Could not approve leave request due to an internal error."));
        }
    }

    // --- Admin: Reject Leave Request ---
    @PostMapping("/admin/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')") // Only admins can reject
    public ResponseEntity<?> rejectLeaveRequest(@PathVariable Long id, @AuthenticationPrincipal User adminUser) {
        if (adminUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Admin user not authenticated"));
        }
        try {
            LeaveRequestViewDTO rejectedRequest = leaveService.rejectLeave(id, adminUser);
            return ResponseEntity.ok(rejectedRequest);
        } catch (IllegalArgumentException | IllegalStateException e) {
            log.warn("Failed to reject leave request {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (AccessDeniedException e) {
            log.warn("Access denied for admin {} rejecting leave request {}", adminUser.getUsername(), id);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error rejecting leave request {} by admin {}: {}", id, adminUser.getUsername(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Could not reject leave request due to an internal error."));
        }
    }
}