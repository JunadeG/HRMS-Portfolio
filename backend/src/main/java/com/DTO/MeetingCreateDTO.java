package com.DTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

public class MeetingCreateDTO {

    @NotBlank(message = "Meeting title cannot be blank")
    @Size(max = 255, message = "Title cannot exceed 255 characters")
    private String title;

    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;

    @NotNull(message = "Start time cannot be null.")
    private String startTime;

    private String endTime;

    // --- ADD THIS NEW FIELD ---
    private String meetingLink;

    private List<Long> attendeeUserIds;
    private List<Long> attendeeDepartmentIds;

    // --- Getters and Setters ---
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }
    public String getEndTime() { return endTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }
    public String getMeetingLink() { return meetingLink; }
    public void setMeetingLink(String meetingLink) { this.meetingLink = meetingLink; }
    public List<Long> getAttendeeUserIds() { return attendeeUserIds; }
    public void setAttendeeUserIds(List<Long> attendeeUserIds) { this.attendeeUserIds = attendeeUserIds; }
    public List<Long> getAttendeeDepartmentIds() { return attendeeDepartmentIds; }
    public void setAttendeeDepartmentIds(List<Long> attendeeDepartmentIds) { this.attendeeDepartmentIds = attendeeDepartmentIds; }
}