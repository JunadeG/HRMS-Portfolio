package com.service;

import com.DTO.NoticeCreateDTO;
import com.model.Notice;
import com.model.User;
import com.repository.NoticeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils; // For checking text presence

@Service
public class NoticeService {

    private static final Logger log = LoggerFactory.getLogger(NoticeService.class);

    @Autowired
    private NoticeRepository noticeRepository;

    @Transactional
    public Notice createNotice(NoticeCreateDTO dto, User creator) {
        if (creator.getCompany() == null) {
            log.error("Cannot create notice: User {} does not belong to a company.", creator.getUsername());
            throw new IllegalStateException("User must belong to a company to create notices.");
        }

        // --- Input Validation ---
        // Handled mostly by @Valid on DTO, but can add cross-field validation here
        if (dto.getEndDate() != null && dto.getEndDate().isBefore(dto.getStartDate())) {
            throw new IllegalArgumentException("End date cannot be before start date.");
        }
        // Add more specific validation if needed (e.g., audience format)

        // --- Create Entity ---
        Notice notice = new Notice();
        notice.setSubject(dto.getSubject().trim()); // Trim whitespace
        notice.setTime(dto.getTime()); // Nullable
        notice.setStartDate(dto.getStartDate());
        notice.setEndDate(dto.getEndDate()); // Nullable
        notice.setPriority(dto.getPriority());
        notice.setAudience(dto.getAudience().trim()); // Trim whitespace
        notice.setCompany(creator.getCompany()); // Associate with the creator's company

        // Optional: Set description if added
        // if (StringUtils.hasText(dto.getDescription())) {
        //    notice.setDescription(dto.getDescription().trim());
        // }

        // --- Save and Log ---
        Notice savedNotice = noticeRepository.save(notice);
        log.info("Notice '{}' (ID: {}) created successfully by user {} for company ID {}",
                savedNotice.getSubject(), savedNotice.getId(), creator.getUsername(), creator.getCompany().getId());

        return savedNotice;
    }

    // --- TODO: Implement other methods as needed ---
    // public List<Notice> getAllNoticesForCompany(User user) { ... }
    // public Notice updateNotice(Long noticeId, NoticeUpdateDTO dto, User updater) { ... }
    // public void deleteNotice(Long noticeId, User deleter) { ... }

}