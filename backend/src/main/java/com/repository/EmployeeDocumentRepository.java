package com.repository;

import com.model.EmployeeDocument;
import com.model.EmployeeDocument.DocumentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param; // Make sure this is imported
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmployeeDocumentRepository extends JpaRepository<EmployeeDocument, Long> {

    // Find all documents for a specific user
    List<EmployeeDocument> findByUserIdOrderByUploadDateDesc(Long userId);


    @Query("SELECT doc FROM EmployeeDocument doc JOIN FETCH doc.user " +
            "WHERE doc.company.id = :companyId AND doc.status = :status " +
            "ORDER BY doc.uploadDate ASC")
    List<EmployeeDocument> findByCompanyIdAndStatusWithUser(
            @Param("companyId") Long companyId,
            @Param("status") DocumentStatus status
    );
}