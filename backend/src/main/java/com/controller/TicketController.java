package com.HRMSbackend.HRMSbackend.controller;

import com.HRMSbackend.HRMSbackend.DTO.TicketCommentDTO;
import com.HRMSbackend.HRMSbackend.DTO.TicketDTO;
import com.HRMSbackend.HRMSbackend.DTO.TicketDetailDTO;
import com.HRMSbackend.HRMSbackend.model.TicketCategory;
import com.HRMSbackend.HRMSbackend.model.TicketStatus;
import com.HRMSbackend.HRMSbackend.model.User;
import com.HRMSbackend.HRMSbackend.service.TicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
@PreAuthorize("isAuthenticated()")
public class TicketController {

    @Autowired
    private TicketService ticketService;

    @PostMapping
    public ResponseEntity<?> createTicket(@RequestBody Map<String, String> payload, @AuthenticationPrincipal User user) {
        try {
            String subject = payload.get("subject");
            String description = payload.get("description");
            TicketCategory category = TicketCategory.valueOf(payload.get("category"));
            TicketDTO newTicket = ticketService.createTicket(user, subject, description, category);
            return new ResponseEntity<>(newTicket, HttpStatus.CREATED);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/my-tickets")
    public ResponseEntity<List<TicketDTO>> getMyTickets(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ticketService.getMyTickets(user));
    }

    // <<< --- THIS IS THE CORRECTED METHOD SIGNATURE --- >>>
    @GetMapping("/admin/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<List<TicketDTO>> getCompanyTickets(@AuthenticationPrincipal User adminUser) {
        return ResponseEntity.ok(ticketService.getCompanyTickets(adminUser));
    }

    @GetMapping("/{ticketId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> getTicketDetails(@PathVariable Long ticketId, @AuthenticationPrincipal User adminUser) {
        try {
            TicketDetailDTO ticket = ticketService.getTicketByIdForAdmin(ticketId, adminUser);
            return ResponseEntity.ok(ticket);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{ticketId}/comments")
    public ResponseEntity<?> addComment(@PathVariable Long ticketId, @RequestBody Map<String, String> payload, @AuthenticationPrincipal User user) {
        try {
            TicketCommentDTO newComment = ticketService.addCommentToTicket(ticketId, payload.get("content"), user);
            return new ResponseEntity<>(newComment, HttpStatus.CREATED);
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{ticketId}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> updateStatus(@PathVariable Long ticketId, @RequestBody Map<String, String> payload, @AuthenticationPrincipal User adminUser) {
        try {
            TicketStatus status = TicketStatus.valueOf(payload.get("status"));
            TicketDetailDTO updatedTicket = ticketService.updateTicketStatus(ticketId, status, adminUser);
            return ResponseEntity.ok(updatedTicket);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid status or permission denied."));
        }
    }

    @PutMapping("/{ticketId}/assign")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> assignTicket(@PathVariable Long ticketId, @RequestBody Map<String, Long> payload, @AuthenticationPrincipal User adminUser) {
        try {
            TicketDetailDTO updatedTicket = ticketService.assignTicket(ticketId, payload.get("assigneeId"), adminUser);
            return ResponseEntity.ok(updatedTicket);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid assignee ID or permission denied."));
        }
    }

    @GetMapping("/admin/assignable-users")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<List<User>> getAssignableUsers(@AuthenticationPrincipal User adminUser) {
        return ResponseEntity.ok(ticketService.getAssignableUsers(adminUser));
    }
}