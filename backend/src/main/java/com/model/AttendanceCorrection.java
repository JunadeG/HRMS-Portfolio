package com.HRMSbackend.HRMSbackend.model;

import jakarta.persistence.*;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Entity
@Table(name = "attendance_corrections")
public class AttendanceCorrection {

    public enum CorrectionStatus { PENDING, APPROVED, REJECTED }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attendance_record_id", nullable = false)
    private Attendance attendanceRecord;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requester_id", nullable = false)
    private User requester;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approver_id")
    private User approver;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    private LocalTime requestedCheckInTime;
    private LocalTime requestedCheckOutTime;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CorrectionStatus status;

    @Column(nullable = false)
    private LocalDateTime requestDate;

    private LocalDateTime approvalDate;

    @PrePersist
    protected void onCreate() {
        requestDate = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Attendance getAttendanceRecord() { return attendanceRecord; }
    public void setAttendanceRecord(Attendance attendanceRecord) { this.attendanceRecord = attendanceRecord; }
    public User getRequester() { return requester; }
    public void setRequester(User requester) { this.requester = requester; }
    public User getApprover() { return approver; }
    public void setApprover(User approver) { this.approver = approver; }
    public Company getCompany() { return company; }
    public void setCompany(Company company) { this.company = company; }
    public LocalTime getRequestedCheckInTime() { return requestedCheckInTime; }
    public void setRequestedCheckInTime(LocalTime requestedCheckInTime) { this.requestedCheckInTime = requestedCheckInTime; }
    public LocalTime getRequestedCheckOutTime() { return requestedCheckOutTime; }
    public void setRequestedCheckOutTime(LocalTime requestedCheckOutTime) { this.requestedCheckOutTime = requestedCheckOutTime; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public CorrectionStatus getStatus() { return status; }
    public void setStatus(CorrectionStatus status) { this.status = status; }
    public LocalDateTime getRequestDate() { return requestDate; }
    public void setRequestDate(LocalDateTime requestDate) { this.requestDate = requestDate; }
    public LocalDateTime getApprovalDate() { return approvalDate; }
    public void setApprovalDate(LocalDateTime approvalDate) { this.approvalDate = approvalDate; }
}