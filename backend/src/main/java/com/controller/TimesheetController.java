package com.controller;

import com.DTO.BillingTimeSummaryDTO;
import com.DTO.ProjectTimeSummaryDTO;
import com.DTO.TimesheetEntryDTO;
import com.model.Project;
import com.model.Timesheet;
import com.model.User;
import com.service.TimesheetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

// MODIFICATION: The base path for ALL methods in this controller is now /api/timesheets
@RestController
@RequestMapping("/api/timesheets")
@PreAuthorize("isAuthenticated()")
public class TimesheetController {

    @Autowired
    private TimesheetService timesheetService;

    // This endpoint is for projects, it should ideally be in its own ProjectController,
    // but for now, we will move it here for simplicity.
    @GetMapping("/projects")
    public ResponseEntity<?> getProjects(@AuthenticationPrincipal User user) {
        try {
            List<Project> projects = timesheetService.getActiveProjectsForCompany(user);
            return ResponseEntity.ok(projects);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // MODIFICATION: The path is now just "/current", which combines with the class path
    // Final URL: /api/timesheets/current
    @GetMapping("/current")
    public ResponseEntity<?> getCurrentTimesheet(@AuthenticationPrincipal User user) {
        Timesheet timesheet = timesheetService.getOrCreateCurrentTimesheet(user);
        return ResponseEntity.ok(timesheet);
    }

    // Final URL: /api/timesheets/{id}
    @PostMapping("/{id}")
    public ResponseEntity<?> saveTimesheet(@PathVariable Long id, @RequestBody List<TimesheetEntryDTO> entries, @AuthenticationPrincipal User user) {
        try {
            Timesheet savedTimesheet = timesheetService.saveTimesheet(id, entries, user);
            return ResponseEntity.ok(savedTimesheet);
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Final URL: /api/timesheets/{id}/submit
    @PostMapping("/{id}/submit")
    public ResponseEntity<?> submitTimesheet(@PathVariable Long id, @AuthenticationPrincipal User user) {
        try {
            Timesheet submittedTimesheet = timesheetService.submitTimesheet(id, user);
            return ResponseEntity.ok(submittedTimesheet);
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Final URL: /api/timesheets/approvals
    @GetMapping("/approvals")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> getTimesheetsForApproval(@AuthenticationPrincipal User manager) {
        try {
            List<Timesheet> timesheets = timesheetService.getPendingApprovals(manager);
            return ResponseEntity.ok(timesheets);
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        }
    }

    // Final URL: /api/timesheets/{id}/approve
    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> approveTimesheet(@PathVariable Long id, @AuthenticationPrincipal User manager) {
        try {
            Timesheet approvedTimesheet = timesheetService.approveTimesheet(id, manager);
            return ResponseEntity.ok(approvedTimesheet);
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Final URL: /api/timesheets/{id}/reject
    @PostMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> rejectTimesheet(@PathVariable Long id, @AuthenticationPrincipal User manager) {
        try {
            Timesheet rejectedTimesheet = timesheetService.rejectTimesheet(id, manager);
            return ResponseEntity.ok(rejectedTimesheet);
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Final URL: /api/timesheets/history
    @GetMapping("/history")
    public ResponseEntity<?> getHistory(
            @RequestParam("year") int year,
            @RequestParam("month") int month,
            @AuthenticationPrincipal User user) {
        try {
            List<Timesheet> history = timesheetService.getTimesheetHistory(user, year, month);
            return ResponseEntity.ok(history);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Final URL: /api/timesheets/rejected
    @GetMapping("/rejected")
    public ResponseEntity<?> getRejectedTimesheets(@AuthenticationPrincipal User user) {
        try {
            List<Timesheet> rejected = timesheetService.getRejectedTimesheets(user);
            return ResponseEntity.ok(rejected);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/past-due")
    public ResponseEntity<?> getPastDueTimesheets(@AuthenticationPrincipal User user) {
        try {
            List<Timesheet> pastDue = timesheetService.getPastDueTimesheets(user);
            return ResponseEntity.ok(pastDue);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/recall")
    public ResponseEntity<?> recallTimesheet(@PathVariable Long id, @AuthenticationPrincipal User user) {
        try {
            Timesheet recalledTimesheet = timesheetService.recallTimesheet(id, user);
            return ResponseEntity.ok(recalledTimesheet);
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/summary/by-project")
    public ResponseEntity<?> getProjectSummary(
            @RequestParam("year") int year,
            @RequestParam("month") int month,
            @AuthenticationPrincipal User user) {
        try {
            List<ProjectTimeSummaryDTO> summary = timesheetService.getProjectTimeSummary(user, year, month);
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/summary/by-billing-type")
    public ResponseEntity<?> getBillingSummary(
            @RequestParam("year") int year,
            @RequestParam("month") int month,
            @AuthenticationPrincipal User user) {
        try {
            List<BillingTimeSummaryDTO> summary = timesheetService.getBillingTimeSummary(user, year, month);
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}