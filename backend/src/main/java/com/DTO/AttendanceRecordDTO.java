package com.HRMSbackend.HRMSbackend.DTO;

import com.HRMSbackend.HRMSbackend.model.Attendance;
import com.HRMSbackend.HRMSbackend.model.User;

import java.time.LocalDate;
import java.time.LocalTime;

public class AttendanceRecordDTO {
    private Long id;
    private Long userId;
    private String employeeName;
    private String departmentName;
    private LocalDate date;
    private LocalTime checkInTime;
    private LocalTime checkOutTime;
    private String status;

    public AttendanceRecordDTO(Attendance attendance) {
        this.id = attendance.getId();
        this.date = attendance.getDate();
        this.checkInTime = attendance.getCheckInTime();
        this.checkOutTime = attendance.getCheckOutTime();
        this.status = attendance.getStatus() != null ? attendance.getStatus().name() : "N/A";

        User user = attendance.getUser();
        if (user != null) {
            this.userId = user.getId();
            this.employeeName = (user.getFirstName() + " " + user.getLastName()).trim();
            this.departmentName = user.getDepartment() != null ? user.getDepartment().getName() : "Unassigned";
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getEmployeeName() { return employeeName; }
    public void setEmployeeName(String employeeName) { this.employeeName = employeeName; }
    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public LocalTime getCheckInTime() { return checkInTime; }
    public void setCheckInTime(LocalTime checkInTime) { this.checkInTime = checkInTime; }
    public LocalTime getCheckOutTime() { return checkOutTime; }
    public void setCheckOutTime(LocalTime checkOutTime) { this.checkOutTime = checkOutTime; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}