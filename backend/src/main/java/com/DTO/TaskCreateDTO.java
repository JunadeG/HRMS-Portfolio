package com.HRMSbackend.HRMSbackend.DTO;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class TaskCreateDTO {

    @NotBlank(message = "Title cannot be blank")
    private String title;

    private String description;

    @FutureOrPresent(message = "Due date must be in the present or future")
    private LocalDate dueDate;

    @NotNull(message = "Project ID cannot be null")
    private Long projectId;

    @NotNull(message = "Assignee ID cannot be null")
    private Long assigneeId;

    // Getters and Setters
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }
    public Long getAssigneeId() { return assigneeId; }
    public void setAssigneeId(Long assigneeId) { this.assigneeId = assigneeId; }
}