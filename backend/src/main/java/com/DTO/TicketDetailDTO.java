package com.HRMSbackend.HRMSbackend.DTO;

import com.HRMSbackend.HRMSbackend.model.Ticket;
import com.HRMSbackend.HRMSbackend.model.TicketCategory;
import com.HRMSbackend.HRMSbackend.model.TicketStatus;
import com.HRMSbackend.HRMSbackend.model.User;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class TicketDetailDTO {
    private Long id;
    private String subject;
    private String description;
    private TicketStatus status;
    private TicketCategory category;
    private String creatorName;
    private String assigneeName;
    private Long assigneeId; // Add assigneeId for the dropdown
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<TicketCommentDTO> comments;

    public TicketDetailDTO(Ticket ticket) {
        this.id = ticket.getId();
        this.subject = ticket.getSubject();
        this.description = ticket.getDescription();
        this.status = ticket.getStatus();
        this.category = ticket.getCategory();
        this.createdAt = ticket.getCreatedAt();
        this.updatedAt = ticket.getUpdatedAt();

        if (ticket.getUser() != null) {
            this.creatorName = (ticket.getUser().getFirstName() + " " + ticket.getUser().getLastName()).trim();
        }
        if (ticket.getAssignee() != null) {
            this.assigneeName = (ticket.getAssignee().getFirstName() + " " + ticket.getAssignee().getLastName()).trim();
            this.assigneeId = ticket.getAssignee().getId();
        } else {
            this.assigneeName = "Unassigned";
        }

        if (ticket.getComments() != null) {
            this.comments = ticket.getComments().stream()
                    .map(TicketCommentDTO::new)
                    .collect(Collectors.toList());
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public TicketStatus getStatus() { return status; }
    public void setStatus(TicketStatus status) { this.status = status; }
    public TicketCategory getCategory() { return category; }
    public void setCategory(TicketCategory category) { this.category = category; }
    public String getCreatorName() { return creatorName; }
    public void setCreatorName(String creatorName) { this.creatorName = creatorName; }
    public String getAssigneeName() { return assigneeName; }
    public void setAssigneeName(String assigneeName) { this.assigneeName = assigneeName; }
    public Long getAssigneeId() { return assigneeId; }
    public void setAssigneeId(Long assigneeId) { this.assigneeId = assigneeId; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public List<TicketCommentDTO> getComments() { return comments; }
    public void setComments(List<TicketCommentDTO> comments) { this.comments = comments; }
}