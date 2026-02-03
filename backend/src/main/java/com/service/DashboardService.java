package com.service;

import com.DTO.AttendeeDTO;
import com.DTO.BirthdayDTO;
import com.DTO.DashboardDataDTO;
import com.DTO.MeetingViewDTO;
import com.model.*;
import com.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private static final Logger log = LoggerFactory.getLogger(DashboardService.class);

    @Autowired private UserRepository userRepository;
    @Autowired private AttendanceRepository attendanceRepository;
    @Autowired private RecruitmentRepository recruitmentRepository;
    @Autowired private MeetingRepository meetingRepository;
    @Autowired private NoticeRepository noticeRepository;
    @Autowired private LeaveRequestRepository leaveRequestRepository;
    @Autowired private TimesheetRepository timesheetRepository;

    private static final ZoneId SERVER_ZONE = ZoneId.systemDefault();

    @Transactional(readOnly = true)
    public DashboardDataDTO getDashboardData(User currentUser) {
        if (currentUser == null || currentUser.getCompany() == null) {
            log.error("DashboardService Error: User or user's company is null. User: {}", currentUser);
            throw new IllegalArgumentException("User must be authenticated and associated with a company.");
        }

        Company company = currentUser.getCompany();
        Long companyId = company.getId();
        LocalDate today = LocalDate.now(SERVER_ZONE);
        log.info("Generating dashboard data for user '{}', companyId={}", currentUser.getUsername(), companyId);

        DashboardDataDTO data = new DashboardDataDTO();
        data.setKpis(new DashboardDataDTO.KpiDTO());
        data.setEngagementChart(new DashboardDataDTO.EngagementChartDTO());
        data.setActionNeeded(null);
        data.setUserFirstName(currentUser.getFirstName());
        data.setUserLastName(currentUser.getLastName());
        data.setCompanyName(company.getName());
        data.setUserJobTitle(currentUser.getJobTitle());
        data.setUserProfilePicturePath(currentUser.getProfilePicturePath());

        try {
            data.setKpis(calculateKpis(companyId, today));
            data.setEngagementChart(calculateEngagementData(companyId));
            data.setUpcomingMeetings(getUpcomingMeetingsForUser(currentUser, today));
            data.setActionNeeded(getPendingActions(currentUser));
            data.setNotCheckedInUsers(getNotCheckedInUsers(companyId, today));
            data.setNotices(getActiveNotices(companyId, today));
            data.setUpcomingBirthdays(getUpcomingBirthdays(companyId, currentUser.getId(), today));
            data.setRecentBirthdays(getRecentBirthdays(companyId, currentUser.getId(), today));
        } catch (Exception e) {
            log.error("Error during widget data fetching for companyId {}: {}", companyId, e.getMessage(), e);
            data.setUpcomingMeetings(Collections.emptyList());
            data.setNotCheckedInUsers(Collections.emptyList());
            data.setNotices(Collections.emptyList());
        }
        return data;
    }

    private DashboardDataDTO.KpiDTO calculateKpis(Long companyId, LocalDate today) {
        DashboardDataDTO.KpiDTO kpis = new DashboardDataDTO.KpiDTO();
        kpis.employee = new DashboardDataDTO.ValueTrendPair();
        kpis.attendees = new DashboardDataDTO.ValueTrendPair();
        kpis.recruitment = new DashboardDataDTO.ValueTrendPair();
        kpis.employee.setValue((int) userRepository.countByCompanyIdAndStatus(companyId, User.UserStatus.APPROVED));
        kpis.attendees.setValue((int) attendanceRepository.countByUserCompanyIdAndDateAndCheckInTimeIsNotNull(companyId, today));
        kpis.recruitment.setValue((int) recruitmentRepository.countByCompanyIdAndStatus(companyId, Recruitment.RecruitmentStatus.OPEN));
        return kpis;
    }

    private List<BirthdayDTO> getRecentBirthdays(Long companyId, Long currentUserId, LocalDate today) {
        LocalDate sevenDaysAgo = today.minusDays(7);
        int startDoy = sevenDaysAgo.getDayOfYear();
        int endDoy = today.getDayOfYear() - 1; // -1 to exclude today

        if (endDoy < startDoy) { // Handle year wrap (e.g., today is Jan 3rd)
            endDoy = today.getDayOfYear(); // On wrap, today is the end
        }

        List<User> usersWithBirthdays;
        if (startDoy <= endDoy) {
            usersWithBirthdays = userRepository.findUpcomingBirthdays(companyId, currentUserId, startDoy, endDoy);
        } else { // Wraps around the new year
            List<User> thisYear = userRepository.findUpcomingBirthdays(companyId, currentUserId, 1, endDoy);
            List<User> lastYear = userRepository.findUpcomingBirthdays(companyId, currentUserId, startDoy, 366);
            usersWithBirthdays = new ArrayList<>(thisYear);
            usersWithBirthdays.addAll(lastYear);
        }

        // Sort descending to show the most recent first
        usersWithBirthdays.sort(Comparator.comparingInt(user -> ((User) user).getDateOfBirth().getDayOfYear()).reversed());

        return usersWithBirthdays.stream()
                .map(user -> new BirthdayDTO(
                        (user.getFirstName() + " " + user.getLastName()).trim(),
                        user.getDateOfBirth()
                ))
                .limit(5)
                .collect(Collectors.toList());
    }

    private DashboardDataDTO.EngagementChartDTO calculateEngagementData(Long companyId) {
        DashboardDataDTO.EngagementChartDTO chartData = new DashboardDataDTO.EngagementChartDTO();
        List<User> activeUsers = userRepository.findByCompanyIdAndStatusIn(companyId, List.of(User.UserStatus.APPROVED));
        Map<String, Long> counts = activeUsers.stream()
                .collect(Collectors.groupingBy(
                        user -> Optional.ofNullable(user.getDepartment()).map(Department::getName).orElse("Unassigned"),
                        Collectors.counting()
                ));
        Map<String, Double> engagementMap = new HashMap<>();
        counts.forEach((dept, count) -> engagementMap.put(dept, count.doubleValue()));
        chartData.setEngagementByDepartment(engagementMap);
        return chartData;
    }

    private List<MeetingViewDTO> getUpcomingMeetingsForUser(User currentUser, LocalDate today) {
        Instant startOfToday = today.atStartOfDay(SERVER_ZONE).toInstant();
        List<Meeting> meetings = meetingRepository.findUpcomingMeetingsForCreatorOrAttendee(currentUser.getId(), startOfToday);

        return meetings.stream()
                .limit(5)
                .map(meeting -> convertToMeetingViewDTO(meeting, currentUser.getId()))
                .collect(Collectors.toList());
    }

    private MeetingViewDTO convertToMeetingViewDTO(Meeting meeting, Long currentUserId) {
        MeetingViewDTO dto = new MeetingViewDTO();
        dto.setId(meeting.getId());
        dto.setTitle(meeting.getTitle());
        dto.setDescription(meeting.getDescription());
        dto.setStartTime(meeting.getStartTime());
        dto.setEndTime(meeting.getEndTime());

        if (meeting.getCreator() != null) {
            dto.setCreatorId(meeting.getCreator().getId());
            dto.setCreatorName((meeting.getCreator().getFirstName() + " " + meeting.getCreator().getLastName()).trim());
        }

        if (meeting.getAttendees() != null) {
            Set<AttendeeDTO> attendeeDTOs = meeting.getAttendees().stream()
                    .map(attendee -> {
                        User user = attendee.getAttendee();
                        return new AttendeeDTO(user.getId(), (user.getFirstName() + " " + user.getLastName()).trim(), attendee.getStatus());
                    })
                    .collect(Collectors.toSet());
            dto.setAttendees(attendeeDTOs);

            meeting.getAttendees().stream()
                    .filter(a -> a.getAttendee().getId().equals(currentUserId))
                    .findFirst()
                    .ifPresent(a -> dto.setCurrentUserStatus(a.getStatus()));
        }
        return dto;
    }

    // <<< --- THIS METHOD IS UPDATED --- >>>
    private DashboardDataDTO.ActionNeededDTO getPendingActions(User currentUser) {
        if (currentUser.getRole() != User.Role.ADMIN && currentUser.getRole() != User.Role.SUPER_ADMIN) {
            return null; // Only show for admins
        }

        Long companyId = currentUser.getCompany().getId();
        long pendingUserApprovals = userRepository.countByCompanyIdAndStatus(companyId, User.UserStatus.PENDING_APPROVAL);
        long pendingLeaveRequests = leaveRequestRepository.countByCompanyIdAndStatus(companyId, LeaveStatus.PENDING);
        // Count submitted timesheets where the manager is the current admin
        long pendingTimesheetApprovals = timesheetRepository.findByManagerAndStatus(currentUser.getId(), TimesheetStatus.SUBMITTED).size();

        List<String> messages = new ArrayList<>();
        if (pendingUserApprovals > 0) {
            messages.add(pendingUserApprovals + " user approval" + (pendingUserApprovals > 1 ? "s" : ""));
        }
        if (pendingLeaveRequests > 0) {
            messages.add(pendingLeaveRequests + " leave request" + (pendingLeaveRequests > 1 ? "s" : ""));
        }
        if (pendingTimesheetApprovals > 0) {
            messages.add(pendingTimesheetApprovals + " timesheet" + (pendingTimesheetApprovals > 1 ? "s" : ""));
        }

        if (messages.isEmpty()) {
            return null; // No actions needed
        }

        DashboardDataDTO.ActionNeededDTO action = new DashboardDataDTO.ActionNeededDTO();
        action.setMessage("You have " + String.join(", ", messages) + " needing attention.");

        // Set a smart URL based on priority
        if (pendingUserApprovals > 0) {
            action.setCallToActionUrl("/admin/pending-approvals");
        } else if (pendingLeaveRequests > 0) {
            action.setCallToActionUrl("/admin/leave-approvals");
        } else {
            action.setCallToActionUrl("/admin/timesheet-approvals");
        }

        return action;
    }

    private List<DashboardDataDTO.UserSummaryDTO> getNotCheckedInUsers(Long companyId, LocalDate today) {
        List<User> allActiveUsers = userRepository.findByCompanyIdAndStatusIn(companyId, List.of(User.UserStatus.APPROVED));
        Set<Long> checkedInUserIdsSet = new HashSet<>(attendanceRepository.findUserIdsByCompanyIdAndDateAndCheckInTimeIsNotNull(companyId, today));
        return allActiveUsers.stream()
                .filter(user -> !checkedInUserIdsSet.contains(user.getId()))
                .limit(7)
                .map(user -> {
                    DashboardDataDTO.UserSummaryDTO dto = new DashboardDataDTO.UserSummaryDTO();
                    dto.setId(user.getId());
                    dto.setName((user.getFirstName() + " " + user.getLastName()).trim());
                    dto.setDesignation(user.getJobTitle() != null ? user.getJobTitle() : "N/A");
                    dto.setProfilePictureUrl(user.getProfilePicturePath());
                    return dto;
                }).collect(Collectors.toList());
    }

    private List<DashboardDataDTO.NoticeDTO> getActiveNotices(Long companyId, LocalDate today) {
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("hh:mm a");
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
        return noticeRepository.findActiveNoticesForCompany(companyId, today).stream()
                .limit(5)
                .map(notice -> {
                    DashboardDataDTO.NoticeDTO dto = new DashboardDataDTO.NoticeDTO();
                    dto.setSubject(notice.getSubject());
                    dto.setTime(Optional.ofNullable(notice.getTime()).map(timeFormatter::format).orElse(""));
                    dto.setStartDate(Optional.ofNullable(notice.getStartDate()).map(dateFormatter::format).orElse(""));
                    dto.setEndDate(Optional.ofNullable(notice.getEndDate()).map(dateFormatter::format).orElse(""));
                    dto.setPriority(Optional.ofNullable(notice.getPriority()).map(Enum::name).orElse(""));
                    dto.setAudience(notice.getAudience());
                    return dto;
                }).collect(Collectors.toList());
    }

    private List<BirthdayDTO> getUpcomingBirthdays(Long companyId, Long currentUserId, LocalDate today) {
        int startDoy = today.getDayOfYear();
        int endDoy = today.plusDays(30).getDayOfYear();

        List<User> usersWithBirthdays;
        if (startDoy <= endDoy) {
            usersWithBirthdays = userRepository.findUpcomingBirthdays(companyId, currentUserId, startDoy, endDoy);
        } else {
            List<User> thisYear = userRepository.findUpcomingBirthdays(companyId, currentUserId, startDoy, 366);
            List<User> nextYear = userRepository.findUpcomingBirthdays(companyId, currentUserId, 1, endDoy);
            usersWithBirthdays = new ArrayList<>(thisYear);
            usersWithBirthdays.addAll(nextYear);
        }

        // Sort the combined list by the actual day of the year
        usersWithBirthdays.sort(Comparator.comparingInt(user -> ((User) user).getDateOfBirth().getDayOfYear()));

        return usersWithBirthdays.stream()
                .map(user -> new BirthdayDTO(
                        (user.getFirstName() + " " + user.getLastName()).trim(),
                        user.getDateOfBirth()
                ))
                .limit(5)
                .collect(Collectors.toList());
    }
}