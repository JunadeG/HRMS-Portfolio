package com.repository;

import com.model.ProjectAllocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ProjectAllocationRepository extends JpaRepository<ProjectAllocation, Long> {
    // Find all current and future allocations for a specific user, ordered by start date
    List<ProjectAllocation> findByUserIdAndEndDateAfterOrderByStartDateAsc(Long userId, LocalDate date);
}