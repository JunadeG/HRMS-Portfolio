package com.DTO;

import com.model.Ticket;
import com.model.TicketCategory;
import com.model.TicketStatus;
import com.model.User;
import java.time.LocalDateTime;

public class TicketDTO {

    private Long id;
    private String subject;
    private String category;
    private String status;
    private LocalDateTime updatedAt;
    private String creatorName;
    private String assigneeName;

    public TicketDTO(Ticket ticket) {
        this.id = ticket.getId();
        this.subject = ticket.getSubject();
        this.category = ticket.getCategory().name();
        this.status = ticket.getStatus().name();
        this.updatedAt = ticket.getUpdatedAt();

        User creator = ticket.getUser();
        if (creator != null) {
            this.creatorName = (creator.getFirstName() + " " + creator.getLastName()).trim();
        }

        User assignee = ticket.getAssignee();
        if (assignee != null) {
            this.assigneeName = (assignee.getFirstName() + " " + assignee.getLastName()).trim();
        } else {
            this.assigneeName = "Unassigned";
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public String getCreatorName() { return creatorName; }
    public void setCreatorName(String creatorName) { this.creatorName = creatorName; }
    public String getAssigneeName() { return assigneeName; }
    public void setAssigneeName(String assigneeName) { this.assigneeName = assigneeName; }
}