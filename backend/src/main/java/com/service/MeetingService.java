package com.service;

import com.DTO.MeetingAttendeeDTO;
import com.DTO.MeetingCreateDTO;
import com.model.*;
import com.repository.MeetingAttendeeRepository;
import com.repository.MeetingRepository;
import com.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.format.DateTimeParseException;
import java.util.HashSet;
import java.util.List; // This was here, kept it
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class MeetingService {

    private static final Logger log = LoggerFactory.getLogger(MeetingService.class);

    private final MeetingRepository meetingRepository;
    private final UserRepository userRepository;
    private final MeetingAttendeeRepository meetingAttendeeRepository;
    private final EmailService emailService;

    @Autowired
    public MeetingService(MeetingRepository meetingRepository, UserRepository userRepository,
                          MeetingAttendeeRepository meetingAttendeeRepository, EmailService emailService) {
        this.meetingRepository = meetingRepository;
        this.userRepository = userRepository;
        this.meetingAttendeeRepository = meetingAttendeeRepository;
        this.emailService = emailService;
    }

    @Transactional
    public Meeting createMeeting(MeetingCreateDTO dto, User creator) {
        if (creator.getCompany() == null) {
            throw new IllegalStateException("User must belong to a company to create meetings.");
        }
        Instant startInstant;
        try {
            startInstant = Instant.parse(dto.getStartTime());
        } catch (DateTimeParseException e) {
            throw new IllegalArgumentException("Invalid start time format.");
        }

        Instant endInstant = dto.getEndTime() != null && !dto.getEndTime().isEmpty() ? Instant.parse(dto.getEndTime()) : null;

        Meeting meeting = new Meeting();
        meeting.setTitle(dto.getTitle().trim());
        meeting.setDescription(dto.getDescription());
        meeting.setStartTime(startInstant);
        meeting.setEndTime(endInstant);
        meeting.setCreator(creator);
        meeting.setCompany(creator.getCompany());

        // --- ADD THIS LINE ---
        meeting.setMeetingLink(dto.getMeetingLink());

        Set<User> invitedUsers = new HashSet<>();
        Long companyId = creator.getCompany().getId();

        if (dto.getAttendeeUserIds() != null && !dto.getAttendeeUserIds().isEmpty()) {
            invitedUsers.addAll(userRepository.findAllById(dto.getAttendeeUserIds()));
        }
        if (dto.getAttendeeDepartmentIds() != null && !dto.getAttendeeDepartmentIds().isEmpty()) {
            invitedUsers.addAll(userRepository.findByCompanyIdAndDepartmentIdIn(companyId, dto.getAttendeeDepartmentIds()));
        }

        Set<MeetingAttendee> attendees = invitedUsers.stream()
                .filter(user -> user.getCompany().getId().equals(companyId))
                .map(user -> {
                    MeetingAttendee attendee = new MeetingAttendee();
                    attendee.setMeeting(meeting);
                    attendee.setAttendee(user);
                    if (user.getId().equals(creator.getId())) {
                        attendee.setStatus(MeetingResponseStatus.ACCEPTED);
                    } else {
                        attendee.setStatus(MeetingResponseStatus.PENDING);
                    }
                    return attendee;
                }).collect(Collectors.toSet());

        meeting.setAttendees(attendees);
        log.info("Creating meeting '{}' with {} attendees.", meeting.getTitle(), attendees.size());

        Meeting savedMeeting = meetingRepository.save(meeting);

        try {
            for (MeetingAttendee attendee : savedMeeting.getAttendees()) {
                if (!attendee.getAttendee().getId().equals(creator.getId())) {
                    emailService.sendMeetingInvitationEmail(attendee.getAttendee(), savedMeeting);
                }
            }
        } catch (Exception e) {
            log.error("Meeting {} created, but failed to send email notifications: {}", savedMeeting.getId(), e.getMessage());
        }

        return savedMeeting;
    }

    @Transactional
    public MeetingAttendeeDTO respondToMeeting(Long meetingId, User user, MeetingResponseStatus response) {
        MeetingAttendee meetingAttendee = meetingAttendeeRepository.findByMeetingIdAndAttendeeId(meetingId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("You are not invited to this meeting."));

        meetingAttendee.setStatus(response);
        MeetingAttendee updatedAttendee = meetingAttendeeRepository.save(meetingAttendee);

        // Convert the final entity to a DTO before returning
        return convertToMeetingAttendeeDTO(updatedAttendee);
    }

    // Helper method for DTO conversion
    private MeetingAttendeeDTO convertToMeetingAttendeeDTO(MeetingAttendee entity) {
        MeetingAttendeeDTO dto = new MeetingAttendeeDTO();
        dto.setId(entity.getId());
        dto.setMeetingId(entity.getMeeting().getId());
        dto.setUserId(entity.getAttendee().getId());
        dto.setStatus(entity.getStatus());
        return dto;
    }
}