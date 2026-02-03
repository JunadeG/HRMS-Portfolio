package com.service;

import com.DTO.TicketCommentDTO;
import com.DTO.TicketDTO;
import com.DTO.TicketDetailDTO;
import com.model.*;
import com.repository.TicketCommentRepository;
import com.repository.TicketRepository;
import com.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TicketService {

    private static final Logger log = LoggerFactory.getLogger(TicketService.class);

    @Autowired private TicketRepository ticketRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private TicketCommentRepository commentRepository;

    @Transactional
    public TicketDTO createTicket(User user, String subject, String description, TicketCategory category) {
        if (user.getCompany() == null) {
            throw new IllegalStateException("User must be associated with a company to create a ticket.");
        }
        Ticket ticket = new Ticket();
        ticket.setUser(user);
        ticket.setCompany(user.getCompany());
        ticket.setSubject(subject);
        ticket.setDescription(description);
        ticket.setCategory(category);
        ticket.setStatus(TicketStatus.OPEN);
        Ticket savedTicket = ticketRepository.save(ticket);
        return new TicketDTO(savedTicket);
    }

    @Transactional(readOnly = true)
    public List<TicketDTO> getMyTickets(User user) {
        List<Ticket> tickets = ticketRepository.findByUserIdWithDetails(user.getId());
        return tickets.stream().map(TicketDTO::new).collect(Collectors.toList());
    }


    @Transactional(readOnly = true)
    public List<TicketDTO> getCompanyTickets(User adminUser) {
        if (adminUser.getCompany() == null) {
            throw new IllegalStateException("Admin is not associated with a company.");
        }
        List<Ticket> tickets = ticketRepository.findByCompanyIdWithDetails(adminUser.getCompany().getId());
        return tickets.stream().map(TicketDTO::new).collect(Collectors.toList());
    }



    @Transactional(readOnly = true)
    public TicketDetailDTO getTicketByIdForAdmin(Long ticketId, User adminUser) {
        Ticket ticket = ticketRepository.findByIdWithDetails(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found with ID: " + ticketId));

        if (adminUser.getRole() != User.Role.SUPER_ADMIN && !ticket.getCompany().getId().equals(adminUser.getCompany().getId())) {
            throw new AccessDeniedException("You do not have permission to view this ticket.");
        }
        return new TicketDetailDTO(ticket);
    }

    @Transactional
    public TicketCommentDTO addCommentToTicket(Long ticketId, String content, User author) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found."));

        if (!author.getCompany().getId().equals(ticket.getCompany().getId())) {
            throw new AccessDeniedException("You cannot comment on tickets outside your company.");
        }

        TicketComment comment = new TicketComment();
        comment.setTicket(ticket);
        comment.setUser(author);
        comment.setContent(content);
        TicketComment savedComment = commentRepository.save(comment);

        ticketRepository.save(ticket);

        return new TicketCommentDTO(savedComment);
    }

    @Transactional
    public TicketDetailDTO updateTicketStatus(Long ticketId, TicketStatus status, User adminUser) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found."));
        checkAdminPermissionForTicket(ticket, adminUser);
        ticket.setStatus(status);
        Ticket updatedTicket = ticketRepository.save(ticket);
        return new TicketDetailDTO(updatedTicket);
    }

    @Transactional
    public TicketDetailDTO assignTicket(Long ticketId, Long assigneeId, User adminUser) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found."));
        checkAdminPermissionForTicket(ticket, adminUser);

        User assignee = userRepository.findById(assigneeId)
                .orElseThrow(() -> new IllegalArgumentException("Assignee user not found."));

        if (!assignee.getCompany().getId().equals(adminUser.getCompany().getId()) ||
                (assignee.getRole() != User.Role.ADMIN && assignee.getRole() != User.Role.SUPER_ADMIN)) {
            throw new AccessDeniedException("Tickets can only be assigned to admins within the same company.");
        }

        ticket.setAssignee(assignee);
        Ticket updatedTicket = ticketRepository.save(ticket);
        return new TicketDetailDTO(updatedTicket);
    }

    @Transactional(readOnly = true)
    public List<User> getAssignableUsers(User adminUser) {
        return userRepository.findByCompanyIdAndRoleIn(
                adminUser.getCompany().getId(),
                List.of(User.Role.ADMIN, User.Role.SUPER_ADMIN)
        );
    }

    private void checkAdminPermissionForTicket(Ticket ticket, User adminUser) {
        if (adminUser.getRole() != User.Role.SUPER_ADMIN && !ticket.getCompany().getId().equals(adminUser.getCompany().getId())) {
            throw new AccessDeniedException("You do not have permission to manage this ticket.");
        }
    }
}