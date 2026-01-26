package com.HRMSbackend.HRMSbackend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "meeting_attendees")
public class MeetingAttendee {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "meeting_id")
    @JsonIgnore
    private Meeting meeting;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User attendee;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MeetingResponseStatus status;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Meeting getMeeting() { return meeting; }
    public void setMeeting(Meeting meeting) { this.meeting = meeting; }
    public User getAttendee() { return attendee; }
    public void setAttendee(User attendee) { this.attendee = attendee; }
    public MeetingResponseStatus getStatus() { return status; }
    public void setStatus(MeetingResponseStatus status) { this.status = status; }

}