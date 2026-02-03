package com.DTO;

import com.model.AttendanceCorrection;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public class AttendanceCorrectionAdminViewDTO {

    private Long correctionId;
    private Long attendanceRecordId;
    private String requesterName;
    private LocalDate attendanceDate;
    private LocalTime originalCheckIn;
    private LocalTime originalCheckOut;
    private LocalTime requestedCheckIn;
    private LocalTime requestedCheckOut;
    private String reason;
    private LocalDateTime requestDate;

    public Long getCorrectionId() {
        return correctionId;
    }

    public Long getAttendanceRecordId() {
        return attendanceRecordId;
    }

    public String getRequesterName() {
        return requesterName;
    }

    public LocalDate getAttendanceDate() {
        return attendanceDate;
    }

    public LocalTime getOriginalCheckIn() {
        return originalCheckIn;
    }

    public LocalTime getOriginalCheckOut() {
        return originalCheckOut;
    }

    public LocalTime getRequestedCheckIn() {
        return requestedCheckIn;
    }

    public LocalTime getRequestedCheckOut() {
        return requestedCheckOut;
    }

    public String getReason() {
        return reason;
    }

    public LocalDateTime getRequestDate() {
        return requestDate;
    }

    public AttendanceCorrectionAdminViewDTO(AttendanceCorrection correction) {
        this.correctionId = correction.getId();
        this.attendanceRecordId = correction.getAttendanceRecord().getId();
        this.requesterName = (correction.getRequester().getFirstName() + " " + correction.getRequester().getLastName()).trim();
        this.attendanceDate = correction.getAttendanceRecord().getDate();
        this.originalCheckIn = correction.getAttendanceRecord().getCheckInTime();
        this.originalCheckOut = correction.getAttendanceRecord().getCheckOutTime();
        this.requestedCheckIn = correction.getRequestedCheckInTime();
        this.requestedCheckOut = correction.getRequestedCheckOutTime();
        this.reason = correction.getReason();
        this.requestDate = correction.getRequestDate();
    }

    // Getters and Setters
    // ... (generate for all fields)
}