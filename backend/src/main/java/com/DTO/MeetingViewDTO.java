package com.DTO;

import com.model.MeetingResponseStatus;

import java.time.Instant;
import java.util.Set;

public class MeetingViewDTO {
    private Long id;
    private String title;
    private String description;
    private Instant startTime;
    private Instant endTime;
    private String creatorName;
    private Long creatorId; // NEW
    private MeetingResponseStatus currentUserStatus; // NEW: The status of the person viewing the dashboard
    private Set<AttendeeDTO> attendees; // CHANGE: Use AttendeeDTO

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Instant getStartTime() { return startTime; }
    public void setStartTime(Instant startTime) { this.startTime = startTime; }
    public Instant getEndTime() { return endTime; }
    public void setEndTime(Instant endTime) { this.endTime = endTime; }
    public String getCreatorName() { return creatorName; }
    public void setCreatorName(String creatorName) { this.creatorName = creatorName; }
    public Long getCreatorId() { return creatorId; }
    public void setCreatorId(Long creatorId) { this.creatorId = creatorId; }
    public MeetingResponseStatus getCurrentUserStatus() { return currentUserStatus; }
    public void setCurrentUserStatus(MeetingResponseStatus currentUserStatus) { this.currentUserStatus = currentUserStatus; }
    public Set<AttendeeDTO> getAttendees() { return attendees; }
    public void setAttendees(Set<AttendeeDTO> attendees) { this.attendees = attendees; }
}