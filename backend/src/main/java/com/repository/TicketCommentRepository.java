package com.HRMSbackend.HRMSbackend.repository;

import com.HRMSbackend.HRMSbackend.model.TicketComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TicketCommentRepository extends JpaRepository<TicketComment, Long> {
    // Basic CRUD is sufficient
}