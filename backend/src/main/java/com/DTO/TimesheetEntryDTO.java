package com.HRMSbackend.HRMSbackend.DTO;

import com.HRMSbackend.HRMSbackend.model.BillingType;

import java.math.BigDecimal;

// This DTO represents a single row of timesheet data sent from the frontend
public class TimesheetEntryDTO {

    private Long id; // Can be null for new entries
    private Long projectId; // The ID of the selected project
    private String taskDescription;
    private BigDecimal hoursMonday;
    private BigDecimal hoursTuesday;
    private BigDecimal hoursWednesday;
    private BigDecimal hoursThursday;
    private BigDecimal hoursFriday;
    private BigDecimal hoursSaturday;
    private BigDecimal hoursSunday;
    private BillingType billingType;

    // --- Getters and Setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }
    public String getTaskDescription() { return taskDescription; }
    public void setTaskDescription(String taskDescription) { this.taskDescription = taskDescription; }
    public BigDecimal getHoursMonday() { return hoursMonday; }
    public void setHoursMonday(BigDecimal hoursMonday) { this.hoursMonday = hoursMonday; }
    public BigDecimal getHoursTuesday() { return hoursTuesday; }
    public void setHoursTuesday(BigDecimal hoursTuesday) { this.hoursTuesday = hoursTuesday; }
    public BigDecimal getHoursWednesday() { return hoursWednesday; }
    public void setHoursWednesday(BigDecimal hoursWednesday) { this.hoursWednesday = hoursWednesday; }
    public BigDecimal getHoursThursday() { return hoursThursday; }
    public void setHoursThursday(BigDecimal hoursThursday) { this.hoursThursday = hoursThursday; }
    public BigDecimal getHoursFriday() { return hoursFriday; }
    public void setHoursFriday(BigDecimal hoursFriday) { this.hoursFriday = hoursFriday; }
    public BigDecimal getHoursSaturday() { return hoursSaturday; }
    public void setHoursSaturday(BigDecimal hoursSaturday) { this.hoursSaturday = hoursSaturday; }
    public BigDecimal getHoursSunday() { return hoursSunday; }
    public void setHoursSunday(BigDecimal hoursSunday) { this.hoursSunday = hoursSunday; }
    public BillingType getBillingType() { return billingType; }
    public void setBillingType(BillingType billingType) { this.billingType = billingType; }
}