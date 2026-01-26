package com.HRMSbackend.HRMSbackend.DTO;

import java.math.BigDecimal;

public class ProjectTimeSummaryDTO {
    private Long projectId;
    private String projectName;
    private BigDecimal totalHours;

    public ProjectTimeSummaryDTO() {}

    // This constructor correctly expects a Double
    public ProjectTimeSummaryDTO(Long projectId, String projectName, Double totalHours) {
        this.projectId = projectId;
        this.projectName = projectName;
        this.totalHours = totalHours != null ? BigDecimal.valueOf(totalHours) : BigDecimal.ZERO;
    }

    // Getters and Setters...
    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }
    public String getProjectName() { return projectName; }
    public void setProjectName(String projectName) { this.projectName = projectName; }
    public BigDecimal getTotalHours() { return totalHours; }
    public void setTotalHours(BigDecimal totalHours) { this.totalHours = totalHours; }
}