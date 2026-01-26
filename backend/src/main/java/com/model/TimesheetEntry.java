package com.HRMSbackend.HRMSbackend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "timesheet_entries")
public class TimesheetEntry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "timesheet_id", nullable = false)
    @JsonIgnore
    private Timesheet timesheet;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(length = 500)
    private String taskDescription;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BillingType billingType;

    @Column(precision = 4, scale = 2)
    private BigDecimal hoursMonday;
    @Column(precision = 4, scale = 2)
    private BigDecimal hoursTuesday;
    @Column(precision = 4, scale = 2)
    private BigDecimal hoursWednesday;
    @Column(precision = 4, scale = 2)
    private BigDecimal hoursThursday;
    @Column(precision = 4, scale = 2)
    private BigDecimal hoursFriday;
    @Column(precision = 4, scale = 2)
    private BigDecimal hoursSaturday;
    @Column(precision = 4, scale = 2)
    private BigDecimal hoursSunday;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Timesheet getTimesheet() { return timesheet; }
    public void setTimesheet(Timesheet timesheet) { this.timesheet = timesheet; }
    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }
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