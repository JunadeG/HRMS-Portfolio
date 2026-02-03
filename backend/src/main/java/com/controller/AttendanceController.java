package com.controller;

import com.DTO.AttendanceCorrectionRequestDTO;
import com.DTO.AttendanceRecordDTO;
import com.DTO.MonthlyAttendanceSummaryDTO;
import com.model.Attendance;
import com.model.User;
import com.service.AttendanceService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.AccessDeniedException;

//import java.nio.file.AccessDeniedException;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
@PreAuthorize("isAuthenticated()")
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    @PostMapping("/clock-in")
    public ResponseEntity<?> clockIn(@AuthenticationPrincipal User currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not authenticated"));
        }
        try {
            Attendance attendance = attendanceService.clockIn(currentUser);
            return ResponseEntity.ok(attendance);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to record clock-in."));
        }
    }

    @PostMapping("/clock-out")
    public ResponseEntity<?> clockOut(@AuthenticationPrincipal User currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not authenticated"));
        }
        try {
            Attendance attendance = attendanceService.clockOut(currentUser);
            return ResponseEntity.ok(attendance);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to record clock-out."));
        }
    }

    @GetMapping("/status")
    public ResponseEntity<?> getCurrentStatus(@AuthenticationPrincipal User currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not authenticated"));
        }
        try {
            Map<String, Object> status = attendanceService.getCurrentStatus(currentUser);
            return ResponseEntity.ok(status);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to retrieve attendance status."));
        }
    }

    @GetMapping("/summary")
    public ResponseEntity<?> getMonthlySummary(
            @AuthenticationPrincipal User currentUser,
            @RequestParam int year,
            @RequestParam int month) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not authenticated"));
        }
        try {
            MonthlyAttendanceSummaryDTO summary = attendanceService.getMonthlyAttendanceSummary(currentUser, year, month);
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to retrieve attendance summary."));
        }
    }

    @PostMapping("/request-correction")
    public ResponseEntity<?> submitCorrectionRequest(
            @Valid @RequestBody AttendanceCorrectionRequestDTO dto,
            @AuthenticationPrincipal User currentUser) {
        try {
            attendanceService.requestCorrection(dto, currentUser);
            return ResponseEntity.ok(Map.of("message", "Correction request submitted successfully."));
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // --- ADMIN ENDPOINTS ---

    @GetMapping("/admin/daily")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> getCompanyAttendanceForDate(
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @AuthenticationPrincipal User adminUser) {
        try {
            List<AttendanceRecordDTO> records = attendanceService.getCompanyAttendanceForDate(date, adminUser);
            return ResponseEntity.ok(records);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/admin/history/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> getEmployeeAttendanceHistory(
            @PathVariable Long employeeId,
            @AuthenticationPrincipal User adminUser) {
        try {
            List<AttendanceRecordDTO> history = attendanceService.getEmployeeAttendanceHistory(employeeId, adminUser);
            return ResponseEntity.ok(history);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/admin/corrections/pending")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> getPendingCorrections(@AuthenticationPrincipal User adminUser) {
        return ResponseEntity.ok(attendanceService.getPendingCorrectionsForAdmin(adminUser));
    }

    @PostMapping("/admin/corrections/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> approveCorrection(@PathVariable Long id, @AuthenticationPrincipal User adminUser) {
        try {
            attendanceService.approveCorrection(id, adminUser);
            return ResponseEntity.ok(Map.of("message", "Correction approved successfully."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/admin/corrections/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> rejectCorrection(@PathVariable Long id, @AuthenticationPrincipal User adminUser) {
        try {
            attendanceService.rejectCorrection(id, adminUser);
            return ResponseEntity.ok(Map.of("message", "Correction rejected successfully."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}