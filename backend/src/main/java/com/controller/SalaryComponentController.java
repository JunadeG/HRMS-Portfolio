package com.controller;

import com.model.SalaryComponent;
import com.model.User;
import com.service.PayrollService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payroll/components")
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
public class SalaryComponentController {

    private static final Logger log = LoggerFactory.getLogger(SalaryComponentController.class);
    private final PayrollService payrollService;

    public SalaryComponentController(PayrollService payrollService) {
        this.payrollService = payrollService;
    }

    @GetMapping
    public ResponseEntity<?> getCompanySalaryComponents(@AuthenticationPrincipal User adminUser) {
        try {
            List<SalaryComponent> components = payrollService.getSalaryComponentsByCompany(adminUser);
            return ResponseEntity.ok(components);
        } catch (Exception e) {
            log.error("Error fetching salary components for admin {}: {}", adminUser.getUsername(), e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to retrieve salary components."));
        }
    }

    @PostMapping
    public ResponseEntity<?> createSalaryComponent(@RequestBody SalaryComponent component, @AuthenticationPrincipal User adminUser) {
        try {
            SalaryComponent createdComponent = payrollService.createSalaryComponent(component, adminUser);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdComponent);
        } catch (Exception e) {
            log.error("Error creating salary component for admin {}: {}", adminUser.getUsername(), e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to create salary component."));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSalaryComponent(@PathVariable Long id, @AuthenticationPrincipal User adminUser) {
        try {
            payrollService.deleteSalaryComponent(id, adminUser);
            return ResponseEntity.ok(Map.of("message", "Salary component deleted successfully."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error deleting salary component ID {} for admin {}: {}", id, adminUser.getUsername(), e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to delete salary component."));
        }
    }
}