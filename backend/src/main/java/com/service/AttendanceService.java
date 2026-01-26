package com.HRMSbackend.HRMSbackend.service;

import com.HRMSbackend.HRMSbackend.DTO.AttendanceCorrectionAdminViewDTO;
import com.HRMSbackend.HRMSbackend.DTO.AttendanceCorrectionRequestDTO;
import com.HRMSbackend.HRMSbackend.DTO.AttendanceRecordDTO;
import com.HRMSbackend.HRMSbackend.DTO.MonthlyAttendanceSummaryDTO;
import com.HRMSbackend.HRMSbackend.model.Attendance;
import com.HRMSbackend.HRMSbackend.model.AttendanceCorrection;
import com.HRMSbackend.HRMSbackend.model.User;
import com.HRMSbackend.HRMSbackend.repository.AttendanceCorrectionRepository;
import com.HRMSbackend.HRMSbackend.repository.AttendanceRepository;
import com.HRMSbackend.HRMSbackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AttendanceService {

    // All repositories are declared as final.
    private final AttendanceRepository attendanceRepository;
    private final UserRepository userRepository;
    private final AttendanceCorrectionRepository correctionRepository;

    // A single, correct constructor for dependency injection.
    @Autowired
    public AttendanceService(AttendanceRepository attendanceRepository,
                             UserRepository userRepository,
                             AttendanceCorrectionRepository correctionRepository) {
        this.attendanceRepository = attendanceRepository;
        this.userRepository = userRepository;
        this.correctionRepository = correctionRepository;
    }

    private Optional<Attendance> findTodaysAttendance(User user) {
        return attendanceRepository.findByUserAndDate(user, LocalDate.now());
    }

    @Transactional
    public Attendance clockIn(User user) {
        LocalDate today = LocalDate.now();
        Optional<Attendance> existingAttendanceOpt = findTodaysAttendance(user);

        if (existingAttendanceOpt.isPresent()) {
            Attendance existingAttendance = existingAttendanceOpt.get();
            if (existingAttendance.getCheckInTime() != null) {
                throw new IllegalStateException("User has already clocked in today at " + existingAttendance.getCheckInTime());
            }
            existingAttendance.setCheckInTime(LocalTime.now());
            existingAttendance.setStatus(Attendance.AttendanceStatus.PRESENT);
            return attendanceRepository.save(existingAttendance);

        } else {
            Attendance newAttendance = new Attendance();
            newAttendance.setUser(user);
            newAttendance.setDate(today);
            newAttendance.setCheckInTime(LocalTime.now());
            newAttendance.setStatus(Attendance.AttendanceStatus.PRESENT);
            return attendanceRepository.save(newAttendance);
        }
    }

    @Transactional
    public Attendance clockOut(User user) {
        Attendance attendance = findTodaysAttendance(user)
                .orElseThrow(() -> new IllegalStateException("Cannot clock out. No clock-in record found for today."));

        if (attendance.getCheckInTime() == null) {
            throw new IllegalStateException("Cannot clock out. User has not clocked in today.");
        }
        if (attendance.getCheckOutTime() != null) {
            throw new IllegalStateException("User has already clocked out today at " + attendance.getCheckOutTime());
        }

        attendance.setCheckOutTime(LocalTime.now());
        return attendanceRepository.save(attendance);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getCurrentStatus(User user) {
        Optional<Attendance> attendanceOpt = findTodaysAttendance(user);
        Map<String, Object> status = new HashMap<>();
        status.put("date", LocalDate.now().toString());

        if (attendanceOpt.isPresent()) {
            Attendance attendance = attendanceOpt.get();
            status.put("checkInTime", attendance.getCheckInTime() != null ? attendance.getCheckInTime().toString() : null);
            status.put("checkOutTime", attendance.getCheckOutTime() != null ? attendance.getCheckOutTime().toString() : null);
            status.put("status", attendance.getStatus() != null ? attendance.getStatus().name() : "UNKNOWN");
            status.put("clockedIn", attendance.getCheckInTime() != null && attendance.getCheckOutTime() == null);
        } else {
            status.put("checkInTime", null);
            status.put("checkOutTime", null);
            status.put("status", "ABSENT");
            status.put("clockedIn", false);
        }
        return status;
    }

    @Transactional(readOnly = true)
    public MonthlyAttendanceSummaryDTO getMonthlyAttendanceSummary(User user, int year, int month) {
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());

        List<Attendance> monthlyRecords = attendanceRepository.findByUserAndDateBetweenOrderByDateDesc(user, startDate, endDate);

        long totalMinutes = 0;
        long totalLateDays = 0;
        long checkInSecondsSum = 0;
        long checkOutSecondsSum = 0;
        int checkInCount = 0;
        int checkOutCount = 0;

        for (Attendance record : monthlyRecords) {
            if (record.getCheckInTime() != null && record.getCheckOutTime() != null) {
                totalMinutes += Duration.between(record.getCheckInTime(), record.getCheckOutTime()).toMinutes();
            }
            if (record.getStatus() == Attendance.AttendanceStatus.LATE) {
                totalLateDays++;
            }
            if (record.getCheckInTime() != null) {
                checkInSecondsSum += record.getCheckInTime().toSecondOfDay();
                checkInCount++;
            }
            if (record.getCheckOutTime() != null) {
                checkOutSecondsSum += record.getCheckOutTime().toSecondOfDay();
                checkOutCount++;
            }
        }

        MonthlyAttendanceSummaryDTO summary = new MonthlyAttendanceSummaryDTO();
        long hours = totalMinutes / 60;
        long minutes = totalMinutes % 60;
        summary.setTotalHoursWorked(String.format("%dh %02dm", hours, minutes));
        summary.setTotalLateDays(totalLateDays);
        summary.setTotalAbsentDays(0);
        summary.setAverageCheckIn(checkInCount > 0 ? LocalTime.ofSecondOfDay(checkInSecondsSum / checkInCount).toString() : "N/A");
        summary.setAverageCheckOut(checkOutCount > 0 ? LocalTime.ofSecondOfDay(checkOutSecondsSum / checkOutCount).toString() : "N/A");
        summary.setRecords(monthlyRecords.stream().map(AttendanceRecordDTO::new).collect(Collectors.toList()));

        return summary;
    }

    @Transactional(readOnly = true)
    public List<AttendanceRecordDTO> getCompanyAttendanceForDate(LocalDate date, User adminUser) {
        if (adminUser.getCompany() == null) {
            throw new IllegalStateException("Admin is not associated with a company.");
        }
        Long companyId = adminUser.getCompany().getId();
        List<Attendance> records = attendanceRepository.findByCompanyIdAndDateWithUser(companyId, date);
        return records.stream().map(AttendanceRecordDTO::new).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AttendanceRecordDTO> getEmployeeAttendanceHistory(Long employeeId, User adminUser) throws AccessDeniedException {
        User employee = userRepository.findById(employeeId)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found with ID: " + employeeId));

        if (adminUser.getRole() != User.Role.SUPER_ADMIN &&
                (adminUser.getCompany() == null || !adminUser.getCompany().getId().equals(employee.getCompany().getId()))) {
            throw new AccessDeniedException("You are not authorized to view this employee's attendance history.");
        }

        List<Attendance> history = attendanceRepository.findByUserOrderByDateDesc(employee);
        return history.stream().map(AttendanceRecordDTO::new).collect(Collectors.toList());
    }

    @Transactional
    public AttendanceCorrection requestCorrection(AttendanceCorrectionRequestDTO dto, User requester) throws AccessDeniedException {
        Attendance attendanceRecord = attendanceRepository.findById(dto.getAttendanceRecordId())
                .orElseThrow(() -> new IllegalArgumentException("Attendance record not found."));

        if (!attendanceRecord.getUser().getId().equals(requester.getId())) {
            throw new AccessDeniedException("You can only request corrections for your own attendance records.");
        }

        if (!StringUtils.hasText(dto.getRequestedCheckInTime()) && !StringUtils.hasText(dto.getRequestedCheckOutTime())) {
            throw new IllegalArgumentException("You must provide at least one corrected time.");
        }

        AttendanceCorrection correction = new AttendanceCorrection();
        correction.setAttendanceRecord(attendanceRecord);
        correction.setRequester(requester);
        correction.setCompany(requester.getCompany());
        correction.setReason(dto.getReason());
        correction.setStatus(AttendanceCorrection.CorrectionStatus.PENDING);

        if (StringUtils.hasText(dto.getRequestedCheckInTime())) {
            correction.setRequestedCheckInTime(LocalTime.parse(dto.getRequestedCheckInTime()));
        }
        if (StringUtils.hasText(dto.getRequestedCheckOutTime())) {
            correction.setRequestedCheckOutTime(LocalTime.parse(dto.getRequestedCheckOutTime()));
        }

        return correctionRepository.save(correction);
    }



    @Transactional(readOnly = true)
    public List<AttendanceCorrectionAdminViewDTO> getPendingCorrectionsForAdmin(User adminUser) {
        if (adminUser.getCompany() == null) {
            throw new IllegalStateException("Admin is not associated with a company.");
        }
        List<AttendanceCorrection> corrections = correctionRepository.findByCompanyIdAndStatusOrderByRequestDateAsc(adminUser.getCompany().getId(), AttendanceCorrection.CorrectionStatus.PENDING);
        return corrections.stream().map(AttendanceCorrectionAdminViewDTO::new).collect(Collectors.toList());
    }

    @Transactional
    public void approveCorrection(Long correctionId, User adminUser) {
        AttendanceCorrection correction = findAndVerifyCorrection(correctionId, adminUser);

        Attendance recordToUpdate = correction.getAttendanceRecord();
        if (correction.getRequestedCheckInTime() != null) {
            recordToUpdate.setCheckInTime(correction.getRequestedCheckInTime());
        }
        if (correction.getRequestedCheckOutTime() != null) {
            recordToUpdate.setCheckOutTime(correction.getRequestedCheckOutTime());
        }
        // Potentially update the status (e.g., from ABSENT to PRESENT) if needed

        attendanceRepository.save(recordToUpdate);

        correction.setStatus(AttendanceCorrection.CorrectionStatus.APPROVED);
        correction.setApprover(adminUser);
        correction.setApprovalDate(LocalDateTime.now());
        correctionRepository.save(correction);
    }

    @Transactional
    public void rejectCorrection(Long correctionId, User adminUser) {
        AttendanceCorrection correction = findAndVerifyCorrection(correctionId, adminUser);

        correction.setStatus(AttendanceCorrection.CorrectionStatus.REJECTED);
        correction.setApprover(adminUser);
        correction.setApprovalDate(LocalDateTime.now());
        correctionRepository.save(correction);
    }

    private AttendanceCorrection findAndVerifyCorrection(Long correctionId, User adminUser) {
        AttendanceCorrection correction = correctionRepository.findById(correctionId)
                .orElseThrow(() -> new IllegalArgumentException("Correction request not found."));

        if (adminUser.getRole() != User.Role.SUPER_ADMIN && !correction.getCompany().getId().equals(adminUser.getCompany().getId())) {
            throw new AccessDeniedException("You do not have permission to manage this request.");
        }
        if (correction.getStatus() != AttendanceCorrection.CorrectionStatus.PENDING) {
            throw new IllegalStateException("This request has already been actioned.");
        }
        return correction;
    }
}