package com.HRMSbackend.HRMSbackend.service;

import com.HRMSbackend.HRMSbackend.DTO.BillingTimeSummaryDTO;
import com.HRMSbackend.HRMSbackend.DTO.ProjectTimeSummaryDTO;
import com.HRMSbackend.HRMSbackend.DTO.TimesheetEntryDTO;
import com.HRMSbackend.HRMSbackend.model.*;
import com.HRMSbackend.HRMSbackend.repository.ProjectRepository;
import com.HRMSbackend.HRMSbackend.repository.TimesheetEntryRepository;
import com.HRMSbackend.HRMSbackend.repository.TimesheetRepository;
import com.HRMSbackend.HRMSbackend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class TimesheetService {

    private static final Logger log = LoggerFactory.getLogger(TimesheetService.class);

    // All repositories are declared as final.
    private final TimesheetRepository timesheetRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final TimesheetEntryRepository timesheetEntryRepository;

    // A single constructor for all dependencies. This is the correct pattern.
    @Autowired
    public TimesheetService(TimesheetRepository timesheetRepository,
                            ProjectRepository projectRepository,
                            UserRepository userRepository,
                            TimesheetEntryRepository timesheetEntryRepository) {
        this.timesheetRepository = timesheetRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.timesheetEntryRepository = timesheetEntryRepository;
    }

    @Transactional
    public Timesheet getOrCreateCurrentTimesheet(User user) {
        if (user == null) {
            throw new IllegalStateException("User cannot be null.");
        }
        LocalDate today = LocalDate.now();
        LocalDate weekStartDate = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));

        return timesheetRepository.findByUserIdAndWeekStartDate(user.getId(), weekStartDate)
                .orElseGet(() -> createNewDraftTimesheet(user, weekStartDate));
    }

    private Timesheet createNewDraftTimesheet(User user, LocalDate weekStartDate) {
        if (user.getCompany() == null) {
            log.error("CRITICAL: Cannot create timesheet for user '{}' (ID: {}) because they are not associated with a company.", user.getUsername(), user.getId());
            throw new IllegalStateException("Your user account is not linked to a company. Please contact an administrator to resolve this issue.");
        }

        Timesheet newTimesheet = new Timesheet();
        newTimesheet.setUser(user);
        newTimesheet.setCompany(user.getCompany());
        newTimesheet.setWeekStartDate(weekStartDate);
        newTimesheet.setStatus(TimesheetStatus.DRAFT);
        newTimesheet.setTotalHours(BigDecimal.ZERO);
        log.info("Creating new DRAFT timesheet for user '{}' for week starting {}", user.getUsername(), weekStartDate);
        return timesheetRepository.save(newTimesheet);
    }

    @Transactional
    public Timesheet saveTimesheet(Long timesheetId, List<TimesheetEntryDTO> entryDTOs, User user) {
        Timesheet timesheet = timesheetRepository.findById(timesheetId)
                .orElseThrow(() -> new IllegalArgumentException("Timesheet not found"));

        if (!timesheet.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You can only save your own timesheet.");
        }
        if (timesheet.getStatus() != TimesheetStatus.DRAFT && timesheet.getStatus() != TimesheetStatus.REJECTED) {
            throw new IllegalStateException("Can only save timesheets that are in DRAFT or REJECTED status.");
        }

        timesheet.getEntries().clear(); // Clear old entries to replace them
        BigDecimal totalHours = BigDecimal.ZERO;
        List<TimesheetEntry> newEntries = new ArrayList<>();

        for (TimesheetEntryDTO dto : entryDTOs) {
            if (dto.getProjectId() == null) {
                log.warn("Skipping a timesheet entry for user {} because projectId was null.", user.getUsername());
                continue;
            }
            Project project = projectRepository.findById(dto.getProjectId())
                    .orElseThrow(() -> new IllegalArgumentException("Invalid Project ID submitted: " + dto.getProjectId()));

            TimesheetEntry entry = new TimesheetEntry();
            entry.setTimesheet(timesheet);
            entry.setProject(project);
            entry.setTaskDescription(dto.getTaskDescription());
            entry.setBillingType(dto.getBillingType() != null ? dto.getBillingType() : BillingType.NON_BILLABLE);
            entry.setHoursMonday(Optional.ofNullable(dto.getHoursMonday()).orElse(BigDecimal.ZERO));
            entry.setHoursTuesday(Optional.ofNullable(dto.getHoursTuesday()).orElse(BigDecimal.ZERO));
            entry.setHoursWednesday(Optional.ofNullable(dto.getHoursWednesday()).orElse(BigDecimal.ZERO));
            entry.setHoursThursday(Optional.ofNullable(dto.getHoursThursday()).orElse(BigDecimal.ZERO));
            entry.setHoursFriday(Optional.ofNullable(dto.getHoursFriday()).orElse(BigDecimal.ZERO));
            entry.setHoursSaturday(Optional.ofNullable(dto.getHoursSaturday()).orElse(BigDecimal.ZERO));
            entry.setHoursSunday(Optional.ofNullable(dto.getHoursSunday()).orElse(BigDecimal.ZERO));

            newEntries.add(entry);

            totalHours = totalHours.add(entry.getHoursMonday()).add(entry.getHoursTuesday()).add(entry.getHoursWednesday())
                    .add(entry.getHoursThursday()).add(entry.getHoursFriday()).add(entry.getHoursSaturday()).add(entry.getHoursSunday());
        }

        timesheet.getEntries().addAll(newEntries);
        timesheet.setTotalHours(totalHours);
        // If a rejected timesheet is saved, it goes back to draft
        if(timesheet.getStatus() == TimesheetStatus.REJECTED) {
            timesheet.setStatus(TimesheetStatus.DRAFT);
        }

        log.info("Saving DRAFT timesheet ID: {} for user '{}' with total hours: {}", timesheet.getId(), user.getUsername(), totalHours);
        return timesheetRepository.save(timesheet);
    }

    @Transactional
    public Timesheet submitTimesheet(Long timesheetId, User user) {
        Timesheet timesheet = timesheetRepository.findById(timesheetId)
                .orElseThrow(() -> new IllegalArgumentException("Timesheet not found"));

        if (!timesheet.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You can only submit your own timesheet.");
        }
        if (timesheet.getStatus() != TimesheetStatus.DRAFT) {
            throw new IllegalStateException("Can only submit timesheets that are in DRAFT status.");
        }

        timesheet.setStatus(TimesheetStatus.SUBMITTED);
        timesheet.setSubmittedDate(LocalDateTime.now());
        log.info("Submitting timesheet ID: {} for user '{}'", timesheet.getId(), user.getUsername());
        return timesheetRepository.save(timesheet);
    }

    @Transactional(readOnly = true)
    public List<Timesheet> getPendingApprovals(User manager) {
        if (manager == null) {
            throw new AccessDeniedException("Must be authenticated to view approvals.");
        }
        return timesheetRepository.findByManagerAndStatus(manager.getId(), TimesheetStatus.SUBMITTED);
    }

    @Transactional
    public Timesheet approveTimesheet(Long timesheetId, User manager) {
        Timesheet timesheet = timesheetRepository.findById(timesheetId)
                .orElseThrow(() -> new IllegalArgumentException("Timesheet not found."));

        if (timesheet.getUser().getReportingManager() == null || !timesheet.getUser().getReportingManager().getId().equals(manager.getId())) {
            throw new AccessDeniedException("You are not authorized to approve this timesheet.");
        }
        if (timesheet.getStatus() != TimesheetStatus.SUBMITTED) {
            throw new IllegalStateException("This timesheet is not in a submitted state.");
        }

        timesheet.setStatus(TimesheetStatus.APPROVED);
        timesheet.setApprover(manager);
        timesheet.setApprovedDate(LocalDateTime.now());
        log.info("Timesheet ID {} approved by manager '{}'", timesheetId, manager.getUsername());
        return timesheetRepository.save(timesheet);
    }

    @Transactional
    public Timesheet rejectTimesheet(Long timesheetId, User manager) {
        Timesheet timesheet = timesheetRepository.findById(timesheetId)
                .orElseThrow(() -> new IllegalArgumentException("Timesheet not found."));

        if (timesheet.getUser().getReportingManager() == null || !timesheet.getUser().getReportingManager().getId().equals(manager.getId())) {
            throw new AccessDeniedException("You are not authorized to reject this timesheet.");
        }
        if (timesheet.getStatus() != TimesheetStatus.SUBMITTED) {
            throw new IllegalStateException("This timesheet is not in a submitted state.");
        }

        timesheet.setStatus(TimesheetStatus.REJECTED);
        timesheet.setApprover(manager);
        timesheet.setApprovedDate(LocalDateTime.now());
        log.info("Timesheet ID {} rejected by manager '{}'", timesheetId, manager.getUsername());
        return timesheetRepository.save(timesheet);
    }

    @Transactional
    public Timesheet recallTimesheet(Long timesheetId, User user) {
        Timesheet timesheet = timesheetRepository.findById(timesheetId)
                .orElseThrow(() -> new IllegalArgumentException("Timesheet not found with ID: " + timesheetId));

        if (!timesheet.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You do not have permission to recall this timesheet.");
        }
        if (timesheet.getStatus() != TimesheetStatus.SUBMITTED) {
            throw new IllegalStateException("This timesheet cannot be recalled. Current status: " + timesheet.getStatus());
        }

        timesheet.setStatus(TimesheetStatus.DRAFT);
        timesheet.setSubmittedDate(null);
        log.info("User '{}' recalled timesheet ID {}", user.getUsername(), timesheetId);
        return timesheetRepository.save(timesheet);
    }

    @Transactional(readOnly = true)
    public List<Project> getActiveProjectsForCompany(User user) {
        if (user.getCompany() == null) {
            throw new IllegalStateException("User is not associated with a company.");
        }
        return projectRepository.findByCompanyIdAndStatusOrderByNameAsc(user.getCompany().getId(), ProjectStatus.ACTIVE);
    }

    @Transactional(readOnly = true)
    public List<Timesheet> getTimesheetHistory(User user, int year, int month) {
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
        return timesheetRepository.findByUserIdAndWeekStartDateBetweenOrderByWeekStartDateDesc(user.getId(), startDate, endDate);
    }

    @Transactional(readOnly = true)
    public List<Timesheet> getRejectedTimesheets(User user) {
        return timesheetRepository.findByUserIdAndStatusOrderByWeekStartDateDesc(user.getId(), TimesheetStatus.REJECTED);
    }

    @Transactional(readOnly = true)
    public List<Timesheet> getPastDueTimesheets(User user) {
        LocalDate startOfCurrentWeek = LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        return timesheetRepository.findByUserIdAndStatusAndWeekStartDateBefore(user.getId(), TimesheetStatus.DRAFT, startOfCurrentWeek);
    }

    @Transactional(readOnly = true)
    public List<ProjectTimeSummaryDTO> getProjectTimeSummary(User user, int year, int month) {
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
        log.info("Fetching project time summary for user '{}' for period {} to {}", user.getUsername(), startDate, endDate);
        return timesheetEntryRepository.getProjectHoursSummaryForUser(user.getId(), startDate, endDate);
    }

    @Transactional(readOnly = true)
    public List<BillingTimeSummaryDTO> getBillingTimeSummary(User user, int year, int month) {
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
        log.info("Fetching billing time summary for user '{}' for period {} to {}", user.getUsername(), startDate, endDate);
        return timesheetEntryRepository.getBillingHoursSummaryForUser(user.getId(), startDate, endDate);
    }
}