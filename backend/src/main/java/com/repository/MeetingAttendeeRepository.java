package com.HRMSbackend.HRMSbackend.repository;

import com.HRMSbackend.HRMSbackend.model.MeetingAttendee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MeetingAttendeeRepository extends JpaRepository<MeetingAttendee, Long> {
    Optional<MeetingAttendee> findByMeetingIdAndAttendeeId(Long meetingId, Long attendeeId);
}