package com.HRMSbackend.HRMSbackend.repository;

import com.HRMSbackend.HRMSbackend.model.Notice; // Import the Entity
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository; // Import @Repository

import java.time.LocalDate;
import java.util.List;

@Repository // <-- ADD THIS ANNOTATION
public interface NoticeRepository extends JpaRepository<Notice, Long> { // <-- EXTEND JpaRepository

    // Method needed by DashboardService
    @Query("SELECT n FROM Notice n WHERE n.company.id = :companyId AND n.startDate <= :today AND (n.endDate IS NULL OR n.endDate >= :today) ORDER BY n.priority ASC, n.startDate DESC")
    List<Notice> findActiveNoticesForCompany(Long companyId, LocalDate today);

    // Add other query methods as needed
}