package com.DTO;

import com.model.TicketComment;
import com.model.User;
import java.time.LocalDateTime;

public class TicketCommentDTO {
    private String content;
    private String authorName;
    private LocalDateTime createdAt;

    public TicketCommentDTO(TicketComment comment) {
        this.content = comment.getContent();
        this.createdAt = comment.getCreatedAt();
        User author = comment.getUser();
        if (author != null) {
            this.authorName = (author.getFirstName() + " " + author.getLastName()).trim();
        }
    }
    // Getters and Setters
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getAuthorName() { return authorName; }
    public void setAuthorName(String authorName) { this.authorName = authorName; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}