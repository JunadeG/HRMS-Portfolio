package com.repository;

import com.model.Recruitment; // Import the Entity
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository; // Import @Repository

@Repository // <-- ADD THIS ANNOTATION
public interface RecruitmentRepository extends JpaRepository<Recruitment, Long> { // <-- EXTEND JpaRepository

    // Method needed by DashboardService
    long countByCompanyIdAndStatus(Long companyId, Recruitment.RecruitmentStatus status);

    // Add other query methods as needed
}