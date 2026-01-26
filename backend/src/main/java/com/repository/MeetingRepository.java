package com.HRMSbackend.HRMSbackend.repository;

import com.HRMSbackend.HRMSbackend.model.Meeting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface MeetingRepository extends JpaRepository<Meeting, Long> {

    // This is the correct query and method signature that the DashboardService expects.
    @Query("SELECT DISTINCT m FROM Meeting m LEFT JOIN m.attendees a " +
            "WHERE m.startTime >= :startOfDay AND (m.creator.id = :userId OR a.attendee.id = :userId) " +
            "ORDER BY m.startTime ASC")
    List<Meeting> findUpcomingMeetingsForCreatorOrAttendee(
            @Param("userId") Long userId,
            @Param("startOfDay") Instant startOfDay
    );

}