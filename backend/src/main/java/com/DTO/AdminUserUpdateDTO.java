package com.HRMSbackend.HRMSbackend.DTO;

public class AdminUserUpdateDTO {
    private String employeeId;
    private String jobTitle;
    private Long reportingManagerId;
    private Long projectManagerId;

    // Getters and Setters
    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }
    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }
    public Long getReportingManagerId() { return reportingManagerId; }
    public void setReportingManagerId(Long reportingManagerId) { this.reportingManagerId = reportingManagerId; }
    public Long getProjectManagerId() { return projectManagerId; }
    public void setProjectManagerId(Long projectManagerId) { this.projectManagerId = projectManagerId; }
}