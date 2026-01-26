package com.HRMSbackend.HRMSbackend.DTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class AttendanceCorrectionRequestDTO {

    @NotNull(message = "Attendance Record ID is required.")
    private Long attendanceRecordId;

    private String requestedCheckInTime; // Sent as "HH:mm" string
    private String requestedCheckOutTime; // Sent as "HH:mm" string

    @NotBlank(message = "A reason for the correction is required.")
    @Size(min = 10, max = 500, message = "Reason must be between 10 and 500 characters.")
    private String reason;

    // Getters and Setters
    public Long getAttendanceRecordId() { return attendanceRecordId; }
    public void setAttendanceRecordId(Long attendanceRecordId) { this.attendanceRecordId = attendanceRecordId; }
    public String getRequestedCheckInTime() { return requestedCheckInTime; }
    public void setRequestedCheckInTime(String requestedCheckInTime) { this.requestedCheckInTime = requestedCheckInTime; }
    public String getRequestedCheckOutTime() { return requestedCheckOutTime; }
    public void setRequestedCheckOutTime(String requestedCheckOutTime) { this.requestedCheckOutTime = requestedCheckOutTime; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}