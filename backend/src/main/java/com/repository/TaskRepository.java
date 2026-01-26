package com.HRMSbackend.HRMSbackend.repository;

import com.HRMSbackend.HRMSbackend.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    // Find all tasks assigned to a specific user, ordered by their due date
    List<Task> findByAssigneeIdOrderByDueDateAsc(Long assigneeId);
}