package com.HRMSbackend.HRMSbackend.controller;

import com.HRMSbackend.HRMSbackend.model.ExpenseClaim;
import com.HRMSbackend.HRMSbackend.model.User;
import com.HRMSbackend.HRMSbackend.service.ExpenseService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    private final ExpenseService expenseService;

    public ExpenseController(ExpenseService expenseService) { this.expenseService = expenseService; }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> submitClaim(@RequestParam("purpose") String purpose,
                                         @RequestParam("amount") BigDecimal amount,
                                         @RequestParam(value = "receipt", required = false) MultipartFile receipt,
                                         @AuthenticationPrincipal User user) {
        try {
            ExpenseClaim claim = expenseService.submitClaim(user, purpose, amount, receipt);
            return ResponseEntity.status(HttpStatus.CREATED).body(claim);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/my-claims")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getMyClaims(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(expenseService.getMyClaims(user));
    }

    @GetMapping("/admin/pending")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> getPendingClaims(@AuthenticationPrincipal User adminUser) {
        return ResponseEntity.ok(expenseService.getPendingClaimsForAdmin(adminUser));
    }

    @PostMapping("/admin/{claimId}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> approveClaim(@PathVariable Long claimId, @AuthenticationPrincipal User adminUser) {
        try {
            return ResponseEntity.ok(expenseService.approveClaim(claimId, adminUser));
        } catch (Exception e) { return ResponseEntity.badRequest().body(Map.of("error", e.getMessage())); }
    }

    @PostMapping("/admin/{claimId}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> rejectClaim(@PathVariable Long claimId, @AuthenticationPrincipal User adminUser) {
        try {
            return ResponseEntity.ok(expenseService.rejectClaim(claimId, adminUser));
        } catch (Exception e) { return ResponseEntity.badRequest().body(Map.of("error", e.getMessage())); }
    }
}