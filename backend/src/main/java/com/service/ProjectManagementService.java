package com.service;

import com.DTO.ProjectAllocationCreateDTO;
import com.DTO.TaskCreateDTO;
import com.model.Project;
import com.model.ProjectAllocation;
import com.model.Task;
import com.model.User;
import com.repository.ProjectAllocationRepository;
import com.repository.ProjectRepository;
import com.repository.TaskRepository;
import com.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.model.Task.TaskStatus;

import java.time.LocalDate;
import java.util.List;

import static com.service.AuthService.log;

@Service
public class ProjectManagementService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private ProjectAllocationRepository projectAllocationRepository;

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ProjectRepository projectRepository;

    @Transactional(readOnly = true)
    public List<Task> getMyTasks(User currentUser) {
        if (currentUser == null) {
            throw new IllegalStateException("User cannot be null.");
        }
        return taskRepository.findByAssigneeIdOrderByDueDateAsc(currentUser.getId());
    }

    @Transactional(readOnly = true)
    public List<ProjectAllocation> getMyAllocations(User currentUser) {
        if (currentUser == null) {
            throw new IllegalStateException("User cannot be null.");
        }
        // Fetch allocations that are currently active or will be in the future
        return projectAllocationRepository.findByUserIdAndEndDateAfterOrderByStartDateAsc(currentUser.getId(), LocalDate.now());
    }

    @Transactional
    public Task createTask(TaskCreateDTO dto, User creator) {
        if (creator.getCompany() == null) {
            throw new IllegalStateException("Admin must belong to a company.");
        }

        Project project = projectRepository.findById(dto.getProjectId())
                .orElseThrow(() -> new IllegalArgumentException("Project not found with ID: " + dto.getProjectId()));
        User assignee = userRepository.findById(dto.getAssigneeId())
                .orElseThrow(() -> new IllegalArgumentException("Assignee user not found with ID: " + dto.getAssigneeId()));

        // Security check: ensure admin is not assigning tasks for other companies
        if (!creator.getCompany().getId().equals(project.getCompany().getId()) || !creator.getCompany().getId().equals(assignee.getCompany().getId())) {
            throw new AccessDeniedException("Admin cannot assign tasks for projects or users outside their own company.");
        }

        Task task = new Task();
        task.setTitle(dto.getTitle());
        task.setDescription(dto.getDescription());
        task.setDueDate(dto.getDueDate());
        task.setProject(project);
        task.setAssignee(assignee);
        task.setCreator(creator);
        task.setCompany(creator.getCompany());
        task.setStatus(TaskStatus.valueOf("TODO")); // Default status

        return taskRepository.save(task);
    }

    @Transactional
    public ProjectAllocation createAllocation(ProjectAllocationCreateDTO dto, User creator) {
        if (creator.getCompany() == null) {
            throw new IllegalStateException("Admin must belong to a company.");
        }
        if (dto.getEndDate().isBefore(dto.getStartDate())) {
            throw new IllegalArgumentException("Allocation end date cannot be before the start date.");
        }

        Project project = projectRepository.findById(dto.getProjectId())
                .orElseThrow(() -> new IllegalArgumentException("Project not found with ID: " + dto.getProjectId()));
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + dto.getUserId()));

        if (!creator.getCompany().getId().equals(project.getCompany().getId()) || !creator.getCompany().getId().equals(user.getCompany().getId())) {
            throw new AccessDeniedException("Admin cannot create allocations for projects or users outside their own company.");
        }

        ProjectAllocation allocation = new ProjectAllocation();
        allocation.setStartDate(dto.getStartDate());
        allocation.setEndDate(dto.getEndDate());
        allocation.setAllocatedHoursPerWeek(dto.getAllocatedHoursPerWeek());
        allocation.setProject(project);
        allocation.setUser(user);
        allocation.setCompany(creator.getCompany());

        return projectAllocationRepository.save(allocation);
    }


    @Transactional
    public Task updateTaskStatus(Long taskId, TaskStatus newStatus, User currentUser) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found with ID: " + taskId));

        // Security Check: A user can only update the status of a task assigned to them.
        if (!task.getAssignee().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You do not have permission to update this task.");
        }

        log.info("User '{}' is updating status of task {} to {}", currentUser.getUsername(), taskId, newStatus);
        task.setStatus(newStatus);
        return taskRepository.save(task);
    }
}