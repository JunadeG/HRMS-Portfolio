package com.controller;

import com.DTO.ProjectAllocationCreateDTO;
import com.DTO.TaskCreateDTO;
import com.model.User;
import com.service.ProjectManagementService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.model.Task.TaskStatus;

import java.util.Map;

@RestController
@RequestMapping("/api/project-management")
@PreAuthorize("isAuthenticated()")
public class ProjectManagementController {

    @Autowired
    private ProjectManagementService projectManagementService;

    @GetMapping("/my-tasks")
    public ResponseEntity<?> getMyTasks(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(projectManagementService.getMyTasks(currentUser));
    }

    @GetMapping("/my-allocations")
    public ResponseEntity<?> getMyAllocations(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(projectManagementService.getMyAllocations(currentUser));
    }

    @PostMapping("/tasks")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> createTask(@Valid @RequestBody TaskCreateDTO taskDTO, @AuthenticationPrincipal User creator) {
        try {
            return ResponseEntity.status(201).body(projectManagementService.createTask(taskDTO, creator));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/allocations")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> createAllocation(@Valid @RequestBody ProjectAllocationCreateDTO allocationDTO, @AuthenticationPrincipal User creator) {
        try {
            return ResponseEntity.status(201).body(projectManagementService.createAllocation(allocationDTO, creator));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }


    @PutMapping("/tasks/{taskId}/status")
    public ResponseEntity<?> updateTaskStatus(
            @PathVariable Long taskId,
            @RequestBody Map<String, String> payload,
            @AuthenticationPrincipal User currentUser) {
        try {
            TaskStatus newStatus = TaskStatus.valueOf(payload.get("status").toUpperCase());
            return ResponseEntity.ok(projectManagementService.updateTaskStatus(taskId, newStatus, currentUser));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}