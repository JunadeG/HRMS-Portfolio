// src/main/java/com/HRMSbackend/HRMSbackend/DTO/NoticeCreateDTO.java
package com.HRMSbackend.HRMSbackend.DTO;

import com.HRMSbackend.HRMSbackend.model.Notice; // Import the enum
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size; // Optional: Add size constraint
import java.time.LocalDate;
import java.time.LocalTime;

public class NoticeCreateDTO {

    @NotBlank(message = "Subject cannot be blank")
    @Size(max = 255, message = "Subject cannot exceed 255 characters")
    private String subject;

    // Optional: Add description if needed in your Notice model/table
    // private String description;

    private LocalTime time; // Optional time associated with the notice

    @NotNull(message = "Start date cannot be null")
    private LocalDate startDate;

    private LocalDate endDate; // Optional end date

    @NotNull(message = "Priority cannot be null")
    private Notice.Priority priority; // Use the enum from Notice model

    @NotBlank(message = "Audience cannot be blank")
    @Size(max = 255, message = "Audience cannot exceed 255 characters")
    private String audience; // e.g., "All", "Developers", "HR Department"

    // --- Getters and Setters ---

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    // public String getDescription() { return description; }
    // public void setDescription(String description) { this.description = description; }

    public LocalTime getTime() { return time; }
    public void setTime(LocalTime time) { this.time = time; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public Notice.Priority getPriority() { return priority; }
    public void setPriority(Notice.Priority priority) { this.priority = priority; }

    public String getAudience() { return audience; }
    public void setAudience(String audience) { this.audience = audience; }
}