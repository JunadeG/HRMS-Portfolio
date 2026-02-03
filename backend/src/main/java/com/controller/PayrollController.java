package com.controller;

import com.DTO.*;
import com.model.EmployeeSalaryComponent;
import com.model.User;
import com.service.PayrollService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payroll")
public class PayrollController {

    private static final Logger log = LoggerFactory.getLogger(PayrollController.class);

    private final PayrollService payrollService;

    @Autowired
    public PayrollController(PayrollService payrollService) {
        this.payrollService = payrollService;
    }

    // --- Department Salary Structure Endpoints ---

    @GetMapping("/structures")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> getDepartmentSalaryStructures(@AuthenticationPrincipal User currentUser) {
        try {
            List<DepartmentSalaryStructureDTO> structures = payrollService.getDepartmentSalaryStructuresByCompany(currentUser);
            return ResponseEntity.ok(structures);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/structures")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> saveDepartmentSalaryStructure(@Valid @RequestBody DepartmentSalaryStructureDTO dto, @AuthenticationPrincipal User currentUser) {
        try {
            DepartmentSalaryStructureDTO savedStructure = payrollService.saveDepartmentSalaryStructure(dto, currentUser);
            return ResponseEntity.ok(savedStructure);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/structures/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> deleteDepartmentSalaryStructure(@PathVariable Long id, @AuthenticationPrincipal User currentUser) {
        try {
            payrollService.deleteDepartmentSalaryStructure(id, currentUser);
            return ResponseEntity.ok(Map.of("message", "Salary structure deleted successfully."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    // --- User Payroll Details Endpoint ---

    @PutMapping("/users/{userId}/payroll-details")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> updateUserPayrollDetails(@PathVariable Long userId, @Valid @RequestBody UserPayrollUpdateDTO dto, @AuthenticationPrincipal User currentUser) {
        try {
            User updatedUser = payrollService.updateUserPayrollDetails(userId, dto, currentUser);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // --- Salary Component Endpoints ---

    @GetMapping("/users/{userId}/components")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> getEmployeeSalaryComponents(@PathVariable Long userId, @AuthenticationPrincipal User adminUser) {
        try {
            List<EmployeeSalaryComponent> components = payrollService.getEmployeeSalaryComponents(userId, adminUser);
            return ResponseEntity.ok(components);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/users/{userId}/components")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> assignComponentToEmployee(@PathVariable Long userId, @Valid @RequestBody AssignSalaryComponentDTO dto, @AuthenticationPrincipal User adminUser) {
        try {
            EmployeeSalaryComponent assignedComponent = payrollService.assignComponentToEmployee(userId, dto.getComponentId(), dto.getValue(), adminUser);
            return ResponseEntity.status(HttpStatus.CREATED).body(assignedComponent);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/users/components/{employeeComponentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> removeComponentFromEmployee(@PathVariable Long employeeComponentId, @AuthenticationPrincipal User adminUser) {
        try {
            payrollService.removeComponentFromEmployee(employeeComponentId, adminUser);
            return ResponseEntity.ok(Map.of("message", "Component assignment removed successfully."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // --- Payslip Generation and Viewing ---

    @PostMapping("/generate")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> generatePayslips(@RequestBody Map<String, String> payload, @AuthenticationPrincipal User adminUser) {
        try {
            LocalDate payPeriod = LocalDate.parse(payload.get("payPeriod"));
            payrollService.generatePayslipsForCompany(payPeriod, adminUser);
            return ResponseEntity.ok(Map.of("message", "Payslip generation process initiated for " + payPeriod.getMonth() + " " + payPeriod.getYear()));
        } catch (Exception e) {
            log.error("Error initiating payslip generation: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/my-payslips")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getMyPayslips(
            @AuthenticationPrincipal User user,
            @RequestParam("year") int year,
            @RequestParam("month") int month) {
        try {
            List<PayslipDTO> payslips = payrollService.getPayslipsForUser(user, year, month);
            return ResponseEntity.ok(payslips);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{payslipId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getPayslipDetails(@PathVariable Long payslipId, @AuthenticationPrincipal User user) {
        try {
            PayslipDTO payslip = payrollService.getPayslipDetails(payslipId, user);
            return ResponseEntity.ok(payslip);
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/calculate-preview")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> calculatePayrollPreview(@AuthenticationPrincipal User currentUser) {
        try {
            List<CalculatedPayrollItemDTO> payrollPreview = payrollService.calculateGrossPayrollPreview(currentUser);
            return ResponseEntity.ok(payrollPreview);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }
}