package com.DTO;

import com.model.MeetingResponseStatus;

public class MeetingAttendeeDTO {
    private Long id;
    private Long meetingId;
    private Long userId;
    private MeetingResponseStatus status;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getMeetingId() { return meetingId; }
    public void setMeetingId(Long meetingId) { this.meetingId = meetingId; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public MeetingResponseStatus getStatus() { return status; }
    public void setStatus(MeetingResponseStatus status) { this.status = status; }
}