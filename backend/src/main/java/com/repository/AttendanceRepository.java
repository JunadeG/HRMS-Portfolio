package com.repository;

import com.model.Attendance;
import com.model.User; // Import User
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional; // Import Optional

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    // Find attendance record for a specific user on a specific date
    Optional<Attendance> findByUserAndDate(User user, LocalDate date);

    // Find attendance records for a user within a date range
    List<Attendance> findByUserAndDateBetweenOrderByDateDesc(User user, LocalDate startDate, LocalDate endDate);

    // Find all attendance records for a user (potentially large result)
    List<Attendance> findByUserOrderByDateDesc(User user);

    // --- KEEP existing methods needed by DashboardService ---
    long countByUserCompanyIdAndDateAndCheckInTimeIsNotNull(Long companyId, LocalDate date);

    @Query("SELECT a.user.id FROM Attendance a WHERE a.user.company.id = :companyId AND a.date = :date AND a.checkInTime IS NOT NULL")
    List<Long> findUserIdsByCompanyIdAndDateAndCheckInTimeIsNotNull(Long companyId, LocalDate date);

    // Fetch all attendance records for a given company on a specific date, also fetching user details.
    @Query("SELECT a FROM Attendance a JOIN FETCH a.user WHERE a.user.company.id = :companyId AND a.date = :date ORDER BY a.user.firstName ASC")
    List<Attendance> findByCompanyIdAndDateWithUser(Long companyId, LocalDate date);
}