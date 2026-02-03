package com.repository;

import com.model.Timesheet;
import com.model.TimesheetStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TimesheetRepository extends JpaRepository<Timesheet, Long> {
    Optional<Timesheet> findByUserIdAndWeekStartDate(Long userId, LocalDate weekStartDate);

    @Query("SELECT t FROM Timesheet t WHERE t.user.reportingManager.id = :managerId AND t.status = :status ORDER BY t.submittedDate ASC")
    List<Timesheet> findByManagerAndStatus(@Param("managerId") Long managerId, @Param("status") TimesheetStatus status);

    // MODIFICATION: Add this new method for fetching historical data
    List<Timesheet> findByUserIdAndWeekStartDateBetweenOrderByWeekStartDateDesc(Long userId, LocalDate startDate, LocalDate endDate);
    List<Timesheet> findByUserIdAndStatusOrderByWeekStartDateDesc(Long userId, TimesheetStatus status);
    List<Timesheet> findByUserIdAndStatusAndWeekStartDateBefore(Long userId, TimesheetStatus status, LocalDate beforeDate);

}