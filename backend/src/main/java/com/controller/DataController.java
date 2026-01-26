package com.HRMSbackend.HRMSbackend.controller;

import com.HRMSbackend.HRMSbackend.model.Department;
import com.HRMSbackend.HRMSbackend.repository.DepartmentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map; // For error response

@RestController
@RequestMapping("/api") // Base path for this controller
public class DataController {

    private final DepartmentRepository departmentRepository;

    // Constructor Injection
    public DataController(DepartmentRepository departmentRepository) {
        this.departmentRepository = departmentRepository;
    }

    @GetMapping("/departments") // Mapped correctly to the public path
    public ResponseEntity<?> getDepartments() {
        try {
            List<Department> departments = departmentRepository.findAllByOrderByNameAsc();
            // Log if departments list is empty (useful for debugging)
            if (departments.isEmpty()) {
                System.out.println("DataController: getDepartments - No departments found in the database.");
            } else {
                System.out.println("DataController: getDepartments - Found " + departments.size() + " departments.");
            }
            return ResponseEntity.ok(departments);
        } catch (Exception e) {
            System.err.println("Error fetching departments in DataController: " + e.getMessage());
            e.printStackTrace(); // Log the full stack trace
            // Return a structured error response
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to load department list due to an internal server error."));
        }
    }

    // You can add other public data endpoints here later (e.g., public job postings)
}