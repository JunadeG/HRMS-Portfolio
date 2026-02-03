package com.DTO;

import java.util.List;

public class MonthlyAttendanceSummaryDTO {
    private String totalHoursWorked;
    private long totalLateDays;
    private long totalAbsentDays;
    private String averageCheckIn;
    private String averageCheckOut;
    private List<AttendanceRecordDTO> records; // The detailed daily log for the month

    // Getters and Setters
    public String getTotalHoursWorked() { return totalHoursWorked; }
    public void setTotalHoursWorked(String totalHoursWorked) { this.totalHoursWorked = totalHoursWorked; }
    public long getTotalLateDays() { return totalLateDays; }
    public void setTotalLateDays(long totalLateDays) { this.totalLateDays = totalLateDays; }
    public long getTotalAbsentDays() { return totalAbsentDays; }
    public void setTotalAbsentDays(long totalAbsentDays) { this.totalAbsentDays = totalAbsentDays; }
    public String getAverageCheckIn() { return averageCheckIn; }
    public void setAverageCheckIn(String averageCheckIn) { this.averageCheckIn = averageCheckIn; }
    public String getAverageCheckOut() { return averageCheckOut; }
    public void setAverageCheckOut(String averageCheckOut) { this.averageCheckOut = averageCheckOut; }
    public List<AttendanceRecordDTO> getRecords() { return records; }
    public void setRecords(List<AttendanceRecordDTO> records) { this.records = records; }
}