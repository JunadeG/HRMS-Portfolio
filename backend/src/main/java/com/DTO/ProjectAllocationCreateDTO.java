package com.HRMSbackend.HRMSbackend.DTO;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public class ProjectAllocationCreateDTO {

    @NotNull(message = "Start date cannot be null")
    private LocalDate startDate;

    @NotNull(message = "End date cannot be null")
    private LocalDate endDate;

    @NotNull(message = "Allocated hours cannot be null")
    @DecimalMin(value = "0.0", inclusive = false, message = "Allocated hours must be positive")
    private BigDecimal allocatedHoursPerWeek;

    @NotNull(message = "Project ID cannot be null")
    private Long projectId;

    @NotNull(message = "User ID cannot be null")
    private Long userId;

    // Getters and Setters
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    public BigDecimal getAllocatedHoursPerWeek() { return allocatedHoursPerWeek; }
    public void setAllocatedHoursPerWeek(BigDecimal allocatedHoursPerWeek) { this.allocatedHoursPerWeek = allocatedHoursPerWeek; }
    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
}