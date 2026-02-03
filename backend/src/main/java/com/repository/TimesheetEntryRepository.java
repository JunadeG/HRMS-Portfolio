package com.repository;

import com.DTO.BillingTimeSummaryDTO;
import com.DTO.ProjectTimeSummaryDTO;
import com.model.TimesheetEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TimesheetEntryRepository extends JpaRepository<TimesheetEntry, Long> {

    // This query is for the "Project Timesheets" tab.
        @Query("SELECT new com.DTO.ProjectTimeSummaryDTO(" +
            "   e.project.id, " +
            "   e.project.name, " +
            "   CAST(SUM(e.hoursMonday + e.hoursTuesday + e.hoursWednesday + e.hoursThursday + e.hoursFriday + e.hoursSaturday + e.hoursSunday) AS double)" + // <-- MODIFICATION HERE
            ") " +
            "FROM TimesheetEntry e " +
            "WHERE e.timesheet.user.id = :userId " +
            "AND e.timesheet.weekStartDate BETWEEN :startDate AND :endDate " +
            "GROUP BY e.project.id, e.project.name " +
            "ORDER BY e.project.name ASC")
    List<ProjectTimeSummaryDTO> getProjectHoursSummaryForUser(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    // This query is for the "Time Summary" tab.
        @Query("SELECT new com.DTO.BillingTimeSummaryDTO(" +
            "   e.billingType, " +
            "   CAST(SUM(e.hoursMonday + e.hoursTuesday + e.hoursWednesday + e.hoursThursday + e.hoursFriday + e.hoursSaturday + e.hoursSunday) AS double)" +
            ") " +
            "FROM TimesheetEntry e " +
            "WHERE e.timesheet.user.id = :userId " +
            "AND e.timesheet.weekStartDate BETWEEN :startDate AND :endDate " +
            "GROUP BY e.billingType")
    List<BillingTimeSummaryDTO> getBillingHoursSummaryForUser(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
}