package com.DTO;

import com.model.MeetingResponseStatus;

public class AttendeeDTO {
    private Long userId;
    private String name;
    private MeetingResponseStatus status;

    public AttendeeDTO(Long userId, String name, MeetingResponseStatus status) {
        this.userId = userId;
        this.name = name;
        this.status = status;
    }
    // Getters and Setters
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public MeetingResponseStatus getStatus() { return status; }
    public void setStatus(MeetingResponseStatus status) { this.status = status; }
}