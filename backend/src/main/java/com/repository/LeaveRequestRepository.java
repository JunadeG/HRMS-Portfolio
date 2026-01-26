// src/main/java/com/HRMSbackend/HRMSbackend/repository/LeaveRequestRepository.java
package com.HRMSbackend.HRMSbackend.repository;

import com.HRMSbackend.HRMSbackend.model.LeaveRequest;
import com.HRMSbackend.HRMSbackend.model.LeaveStatus;
import com.HRMSbackend.HRMSbackend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {

    // Find leave requests for a specific user, ordered by request date descending
    List<LeaveRequest> findByUserOrderByRequestDateDesc(User user);

    // Find leave requests by status for a specific company, ordered by request date ascending
    List<LeaveRequest> findByCompanyIdAndStatusOrderByRequestDateAsc(Long companyId, LeaveStatus status);

    // Find all leave requests for a company (maybe for reporting)
    List<LeaveRequest> findByCompanyIdOrderByRequestDateDesc(Long companyId);

    // *** ADD THIS METHOD ***
    // Count leave requests by company and status
    long countByCompanyIdAndStatus(Long companyId, LeaveStatus status);

    // Optional: Find requests overlapping a certain date range for conflict checking
    // List<LeaveRequest> findByUserIdAndStatusInAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
    //         Long userId, List<LeaveStatus> statuses, LocalDate checkEndDate, LocalDate checkStartDate);
}