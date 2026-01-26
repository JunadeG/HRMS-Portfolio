// src/main/java/com/HRMSbackend/HRMSbackend/service/LeaveService.java
package com.HRMSbackend.HRMSbackend.service;

import com.HRMSbackend.HRMSbackend.DTO.LeaveBalanceDTO;
import com.HRMSbackend.HRMSbackend.DTO.LeaveRequestCreateDTO;
import com.HRMSbackend.HRMSbackend.DTO.LeaveRequestViewDTO;
import com.HRMSbackend.HRMSbackend.model.*;
import com.HRMSbackend.HRMSbackend.repository.LeaveRequestRepository;
import com.HRMSbackend.HRMSbackend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;


@Service
public class LeaveService {

    private static final Logger log = LoggerFactory.getLogger(LeaveService.class);

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;
    @Autowired
    private UserRepository userRepository;

    // Helper to calculate business days (simple version, assumes Sat/Sun are weekends)
    private double calculateLeaveDurationInDays(LocalDate startDate, LocalDate endDate) {
        if (startDate == null || endDate == null || endDate.isBefore(startDate)) {
            return 0;
        }
        // If you want to count weekends, use: ChronoUnit.DAYS.between(startDate, endDate) + 1;
        // This simple version counts all days inclusive.
        // For business days, you'd iterate and skip weekends/holidays.
        // For simplicity here, let's count all days inclusive.
        long daysBetween = ChronoUnit.DAYS.between(startDate, endDate);
        return daysBetween + 1.0; // +1 to include the start date
    }


    @Transactional
    public LeaveRequestViewDTO requestLeave(LeaveRequestCreateDTO dto, User requester) {
        if (dto.getEndDate().isBefore(dto.getStartDate())) {
            throw new IllegalArgumentException("Leave end date cannot be before start date.");
        }
        if (requester == null || requester.getCompany() == null) {
            log.error("Cannot process leave request: Requester or their company is null. User ID: {}", requester != null ? requester.getId() : "N/A");
            throw new IllegalStateException("User information is incomplete. Cannot process leave request.");
        }

        // Reload user to get latest balance information
        User freshRequester = userRepository.findById(requester.getId())
                .orElseThrow(() -> new IllegalStateException("Requester not found in database."));

        double leaveDurationDays = calculateLeaveDurationInDays(dto.getStartDate(), dto.getEndDate());
        if (leaveDurationDays <= 0) {
            throw new IllegalArgumentException("Leave duration must be at least one day.");
        }

        // Balance Check for relevant leave types
        switch (dto.getLeaveType()) {
            case PAID_LEAVE:
                if (freshRequester.getPaidLeaveBalance() < leaveDurationDays) {
                    throw new IllegalArgumentException("Insufficient paid leave balance. Available: " + freshRequester.getPaidLeaveBalance() + ", Requested: " + leaveDurationDays);
                }
                break;
            case SICK_LEAVE:
                if (freshRequester.getSickLeaveBalance() < leaveDurationDays) {
                    throw new IllegalArgumentException("Insufficient sick leave balance. Available: " + freshRequester.getSickLeaveBalance() + ", Requested: " + leaveDurationDays);
                }
                break;
            case FLOATER_LEAVE:
                if (freshRequester.getFloaterLeaveBalance() < leaveDurationDays) {
                    throw new IllegalArgumentException("Insufficient floater leave balance. Available: " + freshRequester.getFloaterLeaveBalance() + ", Requested: " + leaveDurationDays);
                }
                break;
            case UNPAID_LEAVE:
                // No balance check needed for unpaid leave
                break;
            default:
                throw new IllegalArgumentException("Invalid leave type specified.");
        }

        LeaveRequest leaveRequest = new LeaveRequest();
        leaveRequest.setUser(freshRequester);
        leaveRequest.setCompany(freshRequester.getCompany());
        leaveRequest.setStartDate(dto.getStartDate());
        leaveRequest.setEndDate(dto.getEndDate());
        leaveRequest.setReason(dto.getReason());
        leaveRequest.setLeaveType(dto.getLeaveType()); // Set the leave type
        leaveRequest.setStatus(LeaveStatus.PENDING);

        LeaveRequest savedRequest = leaveRequestRepository.save(leaveRequest);
        log.info("Leave request (ID: {}) type '{}' created for user '{}' from {} to {} ({} days)",
                savedRequest.getId(), savedRequest.getLeaveType(), freshRequester.getUsername(), savedRequest.getStartDate(), savedRequest.getEndDate(), leaveDurationDays);

        return convertToViewDTO(savedRequest);
    }

    @Transactional(readOnly = true)
    public List<LeaveRequestViewDTO> getLeaveRequestsForUser(User user) {
        if (user == null) {
            log.warn("Attempted to fetch leave requests for a null user.");
            return List.of();
        }
        List<LeaveRequest> requests = leaveRequestRepository.findByUserOrderByRequestDateDesc(user);
        log.debug("Found {} leave requests for user '{}'", requests.size(), user.getUsername());
        return requests.stream()
                .map(this::convertToViewDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public LeaveRequestViewDTO cancelLeaveRequest(Long requestId, User canceller) {
        if (canceller == null) {
            throw new AccessDeniedException("User must be authenticated to cancel a request.");
        }
        LeaveRequest request = leaveRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Leave request not found with ID: " + requestId));

        if (!request.getUser().getId().equals(canceller.getId())) {
            log.warn("User '{}' (ID: {}) attempted to cancel leave request (ID: {}) owned by user ID: {}",
                    canceller.getUsername(), canceller.getId(), requestId, request.getUser().getId());
            throw new AccessDeniedException("You do not have permission to cancel this leave request.");
        }

        if (request.getStatus() != LeaveStatus.PENDING) {
            log.warn("User '{}' attempted to cancel leave request (ID: {}) which is already in state: {}",
                    canceller.getUsername(), requestId, request.getStatus());
            throw new IllegalStateException("Leave request cannot be cancelled as it is already " + request.getStatus() + ".");
        }

        request.setStatus(LeaveStatus.CANCELLED);
        request.setApprover(null);
        request.setApprovalDate(null);

        LeaveRequest savedRequest = leaveRequestRepository.save(request);
        log.info("Leave request (ID: {}) successfully cancelled by user '{}'", savedRequest.getId(), canceller.getUsername());
        return convertToViewDTO(savedRequest);
    }

    @Transactional(readOnly = true)
    public List<LeaveRequestViewDTO> getPendingLeaveRequestsForAdmin(User adminUser) {
        if (adminUser == null || adminUser.getCompany() == null) {
            log.warn("Admin {} (or their company) is null, cannot fetch pending leave requests.", adminUser != null ? adminUser.getUsername() : "UNKNOWN");
            return List.of();
        }
        Long companyId = adminUser.getCompany().getId();
        List<LeaveRequest> pendingRequests = leaveRequestRepository.findByCompanyIdAndStatusOrderByRequestDateAsc(companyId, LeaveStatus.PENDING);
        log.debug("Found {} pending leave requests for company ID {}", pendingRequests.size(), companyId);
        return pendingRequests.stream()
                .map(this::convertToViewDTOWithUserLoad)
                .collect(Collectors.toList());
    }

    @Transactional
    public LeaveRequestViewDTO approveLeave(Long requestId, User adminUser) {
        LeaveRequest request = findRequestAndCheckAdminPermission(requestId, adminUser);
        if (request.getStatus() != LeaveStatus.PENDING) {
            log.warn("Admin '{}' attempted to approve leave request (ID: {}) which is already in state: {}",
                    adminUser.getUsername(), requestId, request.getStatus());
            throw new IllegalStateException("Leave request is not in PENDING state (current: " + request.getStatus() + ")");
        }

        User requester = userRepository.findById(request.getUser().getId())
                .orElseThrow(() -> new IllegalStateException("Requester user not found for leave request " + requestId));

        double leaveDurationDays = calculateLeaveDurationInDays(request.getStartDate(), request.getEndDate());

        // Deduct from balance if applicable
        boolean balanceUpdated = false;
        switch (request.getLeaveType()) {
            case PAID_LEAVE:
                if (requester.getPaidLeaveBalance() >= leaveDurationDays) {
                    requester.setPaidLeaveBalance(requester.getPaidLeaveBalance() - leaveDurationDays);
                    balanceUpdated = true;
                } else {
                    throw new IllegalStateException("Cannot approve: Insufficient paid leave balance for user " + requester.getUsername());
                }
                break;
            case SICK_LEAVE:
                if (requester.getSickLeaveBalance() >= leaveDurationDays) {
                    requester.setSickLeaveBalance(requester.getSickLeaveBalance() - leaveDurationDays);
                    balanceUpdated = true;
                } else {
                    throw new IllegalStateException("Cannot approve: Insufficient sick leave balance for user " + requester.getUsername());
                }
                break;
            case FLOATER_LEAVE:
                if (requester.getFloaterLeaveBalance() >= leaveDurationDays) {
                    requester.setFloaterLeaveBalance(requester.getFloaterLeaveBalance() - leaveDurationDays);
                    balanceUpdated = true;
                } else {
                    throw new IllegalStateException("Cannot approve: Insufficient floater leave balance for user " + requester.getUsername());
                }
                break;
            case UNPAID_LEAVE:
                // No balance deduction for unpaid leave
                break;
        }

        if (balanceUpdated) {
            userRepository.save(requester); // Save updated balances
            log.info("Deducted {} days from {} balance for user '{}'. New balance: {}",
                    leaveDurationDays, request.getLeaveType(), requester.getUsername(),
                    // Log the specific balance that was updated
                    switch (request.getLeaveType()) {
                        case PAID_LEAVE -> requester.getPaidLeaveBalance();
                        case SICK_LEAVE -> requester.getSickLeaveBalance();
                        case FLOATER_LEAVE -> requester.getFloaterLeaveBalance();
                        default -> "N/A";
                    }
            );
        }

        request.setStatus(LeaveStatus.APPROVED);
        request.setApprover(adminUser);
        request.setApprovalDate(LocalDateTime.now());
        LeaveRequest savedRequest = leaveRequestRepository.save(request);
        log.info("Leave request (ID: {}) approved by admin '{}'", savedRequest.getId(), adminUser.getUsername());
        return convertToViewDTOWithUserLoad(savedRequest);
    }

    @Transactional
    public LeaveRequestViewDTO rejectLeave(Long requestId, User adminUser) {
        LeaveRequest request = findRequestAndCheckAdminPermission(requestId, adminUser);
        if (request.getStatus() != LeaveStatus.PENDING) {
            log.warn("Admin '{}' attempted to reject leave request (ID: {}) which is already in state: {}",
                    adminUser.getUsername(), requestId, request.getStatus());
            throw new IllegalStateException("Leave request is not in PENDING state (current: " + request.getStatus() + ")");
        }
        request.setStatus(LeaveStatus.REJECTED);
        request.setApprover(adminUser);
        request.setApprovalDate(LocalDateTime.now());
        LeaveRequest savedRequest = leaveRequestRepository.save(request);
        log.info("Leave request (ID: {}) rejected by admin '{}'", savedRequest.getId(), adminUser.getUsername());
        return convertToViewDTOWithUserLoad(savedRequest);
    }

    private LeaveRequest findRequestAndCheckAdminPermission(Long requestId, User adminUser) {
        if (adminUser == null) {
            throw new AccessDeniedException("Admin user must be authenticated.");
        }
        LeaveRequest request = leaveRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Leave request not found with ID: " + requestId));
        if (adminUser.getRole() == User.Role.SUPER_ADMIN) {
            return request;
        }
        if (adminUser.getCompany() == null || request.getCompany() == null ||
                !adminUser.getCompany().getId().equals(request.getCompany().getId())) {
            log.warn("Admin '{}' (Company ID: {}) permission denied for leave request ID {} (Company ID: {}) - Company mismatch.",
                    adminUser.getUsername(),
                    adminUser.getCompany() != null ? adminUser.getCompany().getId() : "null",
                    requestId,
                    request.getCompany() != null ? request.getCompany().getId() : "null");
            throw new AccessDeniedException("Admin does not have permission to manage this leave request (company mismatch).");
        }
        return request;
    }

    private LeaveRequestViewDTO convertToViewDTO(LeaveRequest request) {
        if (request == null) return null;
        LeaveRequestViewDTO dto = new LeaveRequestViewDTO();
        dto.setId(request.getId());
        if (request.getUser() != null) {
            dto.setRequesterName(String.format("%s %s",
                    Optional.ofNullable(request.getUser().getFirstName()).orElse(""),
                    Optional.ofNullable(request.getUser().getLastName()).orElse("")
            ).trim());
            dto.setRequesterUsername(request.getUser().getUsername());
        } else {
            dto.setRequesterName("Unknown User");
            dto.setRequesterUsername("unknown");
        }
        dto.setStartDate(request.getStartDate());
        dto.setEndDate(request.getEndDate());
        dto.setReason(request.getReason());
        dto.setStatus(request.getStatus());
        dto.setRequestDate(request.getRequestDate());
        dto.setLeaveType(request.getLeaveType()); // Set leave type

        if (request.getApprover() != null) {
            dto.setApproverName(String.format("%s %s",
                    Optional.ofNullable(request.getApprover().getFirstName()).orElse(""),
                    Optional.ofNullable(request.getApprover().getLastName()).orElse("")
            ).trim());
        } else {
            dto.setApproverName(null);
        }
        dto.setApprovalDate(request.getApprovalDate());
        return dto;
    }

    private LeaveRequestViewDTO convertToViewDTOWithUserLoad(LeaveRequest request) {
        if (request == null) return null;
        User requester = request.getUser();
        if (requester != null && requester.getId() != null && (requester.getUsername() == null || requester.getFirstName() == null)) {
            log.trace("Lazy loading user details for request ID: {}", request.getId());
            requester = userRepository.findById(requester.getId()).orElse(null);
        }
        LeaveRequestViewDTO dto = convertToViewDTO(request); // Reuse basic conversion
        if (requester != null) {
            if (dto.getRequesterName() == null || dto.getRequesterName().equals("Unknown User") || dto.getRequesterName().trim().isEmpty()) {
                dto.setRequesterName(String.format("%s %s",
                        Optional.ofNullable(requester.getFirstName()).orElse(""),
                        Optional.ofNullable(requester.getLastName()).orElse("")
                ).trim());
            }
            if (dto.getRequesterUsername() == null || dto.getRequesterUsername().equals("unknown")) {
                dto.setRequesterUsername(requester.getUsername());
            }
        }
        if (request.getApprover() != null && (dto.getApproverName() == null || dto.getApproverName().trim().isEmpty())) {
            User approver = request.getApprover();
            if (approver.getId() != null && (approver.getFirstName() == null)) {
                approver = userRepository.findById(approver.getId()).orElse(null);
            }
            if(approver != null) {
                dto.setApproverName(String.format("%s %s",
                        Optional.ofNullable(approver.getFirstName()).orElse(""),
                        Optional.ofNullable(approver.getLastName()).orElse("")
                ).trim());
            }
        }
        return dto;
    }

    // --- NEW METHOD to fetch leave balances ---
    @Transactional(readOnly = true)
    public LeaveBalanceDTO getLeaveBalances(User currentUser) {
        if (currentUser == null) {
            throw new IllegalArgumentException("User must be authenticated to fetch leave balances.");
        }
        // Reload user to ensure fresh balance data
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new IllegalStateException("User not found in database."));

        return new LeaveBalanceDTO(
                user.getPaidLeaveBalance(),
                user.getSickLeaveBalance(),
                user.getFloaterLeaveBalance()
        );
    }
    // --- END NEW METHOD ---
}