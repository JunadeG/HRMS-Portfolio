// src/main/java/com/HRMSbackend/HRMSbackend/DTO/LeaveRequestCreateDTO.java
package com.HRMSbackend.HRMSbackend.DTO;

import com.HRMSbackend.HRMSbackend.model.LeaveType; // <<< IMPORT
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public class LeaveRequestCreateDTO {

    @NotNull(message = "Start date cannot be null")
    @FutureOrPresent(message = "Start date must be today or in the future")
    private LocalDate startDate;

    @NotNull(message = "End date cannot be null")
    @FutureOrPresent(message = "End date must be today or in the future")
    private LocalDate endDate;

    @NotBlank(message = "Reason cannot be blank")
    @Size(max = 500, message = "Reason cannot exceed 500 characters")
    private String reason;

    // --- NEW FIELD ---
    @NotNull(message = "Leave type cannot be null")
    private LeaveType leaveType;
    // --- END NEW FIELD ---

    // Getters and Setters
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    // --- GETTER AND SETTER FOR NEW FIELD ---
    public LeaveType getLeaveType() { return leaveType; }
    public void setLeaveType(LeaveType leaveType) { this.leaveType = leaveType; }
    // --- END GETTER AND SETTER ---
}