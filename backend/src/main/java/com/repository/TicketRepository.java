package com.HRMSbackend.HRMSbackend.repository;

import com.HRMSbackend.HRMSbackend.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    @Query("SELECT t FROM Ticket t JOIN FETCH t.user u WHERE u.id = :userId ORDER BY t.updatedAt DESC")
    List<Ticket> findByUserIdWithDetails(Long userId);

    @Query("SELECT t FROM Ticket t JOIN FETCH t.user u LEFT JOIN FETCH t.assignee WHERE t.company.id = :companyId ORDER BY t.status ASC, t.updatedAt DESC")
    List<Ticket> findByCompanyIdWithDetails(Long companyId);

    @Query("SELECT t FROM Ticket t " +
            "JOIN FETCH t.user " +
            "LEFT JOIN FETCH t.assignee " +
            "LEFT JOIN FETCH t.comments c " +
            "LEFT JOIN FETCH c.user " +
            "WHERE t.id = :ticketId")
    Optional<Ticket> findByIdWithDetails(Long ticketId);
}
