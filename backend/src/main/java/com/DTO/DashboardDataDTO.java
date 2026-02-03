package com.DTO;

import java.util.List;
import java.util.Map;

public class DashboardDataDTO {

    // User Info for Header
    private String userFirstName;
    private String userLastName;
    private String companyName;
    private String userJobTitle;
    private String userProfilePicturePath;
    private List<BirthdayDTO> recentBirthdays;

    // Widget Data
    private KpiDTO kpis;
    private EngagementChartDTO engagementChart;
    // This is the single, correct declaration for the meeting list.
    private List<MeetingViewDTO> upcomingMeetings;
    private ActionNeededDTO actionNeeded;
    private List<UserSummaryDTO> notCheckedInUsers;
    private List<NoticeDTO> notices;
    private List<BirthdayDTO> upcomingBirthdays;

    // --- Inner DTOs ---

    public static class KpiDTO {
        public ValueTrendPair employee;
        public ValueTrendPair attendees;
        public ValueTrendPair recruitment;
        // Getters & Setters...
        public ValueTrendPair getEmployee() { return employee; }
        public void setEmployee(ValueTrendPair employee) { this.employee = employee; }
        public ValueTrendPair getAttendees() { return attendees; }
        public void setAttendees(ValueTrendPair attendees) { this.attendees = attendees; }
        public ValueTrendPair getRecruitment() { return recruitment; }
        public void setRecruitment(ValueTrendPair recruitment) { this.recruitment = recruitment; }
    }

    public static class ValueTrendPair {
        public int value;
        public int trend;
        // Getters & Setters...
        public int getValue() { return value; }
        public void setValue(int value) { this.value = value; }
        public int getTrend() { return trend; }
        public void setTrend(int trend) { this.trend = trend; }
    }

    public static class EngagementChartDTO {
        public Map<String, Double> engagementByDepartment;
        // Getters & Setters...
        public Map<String, Double> getEngagementByDepartment() { return engagementByDepartment; }
        public void setEngagementByDepartment(Map<String, Double> engagementByDepartment) { this.engagementByDepartment = engagementByDepartment; }
    }

    // THIS INNER CLASS IS NO LONGER NEEDED because we have MeetingViewDTO
    // We can leave it for now if other parts of the old dashboard use it,
    // but it should eventually be removed. I will remove the problematic
    // getters and setters from it.
    public static class MeetingDTO {
        public Long id;
        public String time;
        public String title;
        // Getters & Setters...
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getTime() { return time; }
        public void setTime(String time) { this.time = time; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
    }

    public static class ActionNeededDTO {
        public String message;
        public String callToActionUrl;
        // Getters & Setters...
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public String getCallToActionUrl() { return callToActionUrl; }
        public void setCallToActionUrl(String url) { this.callToActionUrl = url; }
    }

    public static class UserSummaryDTO {
        public Long id;
        public String name;
        public String designation;
        public String profilePictureUrl;
        // Getters & Setters...
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDesignation() { return designation; }
        public void setDesignation(String d) { this.designation = d; }
        public String getProfilePictureUrl() { return profilePictureUrl; }
        public void setProfilePictureUrl(String url) { this.profilePictureUrl = url; }
    }

    public static class NoticeDTO {
        public String subject;
        public String time;
        public String startDate;
        public String endDate;
        public String priority;
        public String audience;
        // Getters & Setters...
        public String getSubject() { return subject; }
        public void setSubject(String s) { this.subject = s; }
        public String getTime() { return time; }
        public void setTime(String t) { this.time = t; }
        public String getStartDate() { return startDate; }
        public void setStartDate(String d) { this.startDate = d; }
        public String getEndDate() { return endDate; }
        public void setEndDate(String d) { this.endDate = d; }
        public String getPriority() { return priority; }
        public void setPriority(String p) { this.priority = p; }
        public String getAudience() { return audience; }
        public void setAudience(String a) { this.audience = a; }
    }

    // --- Outer Getters & Setters ---
    public String getUserFirstName() { return userFirstName; }
    public void setUserFirstName(String userFirstName) { this.userFirstName = userFirstName; }
    public String getUserLastName() { return userLastName; }
    public void setUserLastName(String userLastName) { this.userLastName = userLastName; }
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
    public String getUserJobTitle() { return userJobTitle; }
    public void setUserJobTitle(String userJobTitle) { this.userJobTitle = userJobTitle; }
    public String getUserProfilePicturePath() { return userProfilePicturePath; }
    public void setUserProfilePicturePath(String userProfilePicturePath) { this.userProfilePicturePath = userProfilePicturePath; }
    public KpiDTO getKpis() { return kpis; }
    public void setKpis(KpiDTO kpis) { this.kpis = kpis; }
    public EngagementChartDTO getEngagementChart() { return engagementChart; }
    public void setEngagementChart(EngagementChartDTO engagementChart) { this.engagementChart = engagementChart; }
    public ActionNeededDTO getActionNeeded() { return actionNeeded; }
    public void setActionNeeded(ActionNeededDTO actionNeeded) { this.actionNeeded = actionNeeded; }
    public List<UserSummaryDTO> getNotCheckedInUsers() { return notCheckedInUsers; }
    public void setNotCheckedInUsers(List<UserSummaryDTO> notCheckedInUsers) { this.notCheckedInUsers = notCheckedInUsers; }
    public List<NoticeDTO> getNotices() { return notices; }
    public void setNotices(List<NoticeDTO> notices) { this.notices = notices; }

    // Correct Getters and Setters for the new upcomingMeetings list
    public List<MeetingViewDTO> getUpcomingMeetings() { return upcomingMeetings; }
    public void setUpcomingMeetings(List<MeetingViewDTO> upcomingMeetings) { this.upcomingMeetings = upcomingMeetings; }

    public List<BirthdayDTO> getUpcomingBirthdays() { return upcomingBirthdays; }
    public void setUpcomingBirthdays(List<BirthdayDTO> upcomingBirthdays) { this.upcomingBirthdays = upcomingBirthdays; }

    public List<BirthdayDTO> getRecentBirthdays() { return recentBirthdays; }
    public void setRecentBirthdays(List<BirthdayDTO> recentBirthdays) { this.recentBirthdays = recentBirthdays; }


}