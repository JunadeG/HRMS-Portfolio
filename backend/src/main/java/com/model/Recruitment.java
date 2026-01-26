package com.HRMSbackend.HRMSbackend.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "recruitment_process")
public class Recruitment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String positionTitle;
    private LocalDate openDate;
    private LocalDate closeDate;
    private Integer applicantsCount;
    private Integer hiredCount;

    @Enumerated(EnumType.STRING)
    private RecruitmentStatus status; // OPEN, CLOSED, ON_HOLD

    @ManyToOne // Link recruitment to a company
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    // Getters and Setters...
    public enum RecruitmentStatus {
        OPEN, CLOSED, ON_HOLD
    }

    // Constructor, Getters, Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getPositionTitle() { return positionTitle; }
    public void setPositionTitle(String p) { this.positionTitle = p; }
    public LocalDate getOpenDate() { return openDate; }
    public void setOpenDate(LocalDate d) { this.openDate = d; }
    public LocalDate getCloseDate() { return closeDate; }
    public void setCloseDate(LocalDate d) { this.closeDate = d; }
    public Integer getApplicantsCount() { return applicantsCount;}
    public void setApplicantsCount(Integer c) { this.applicantsCount = c; }
    public Integer getHiredCount() { return hiredCount; }
    public void setHiredCount(Integer c) { this.hiredCount = c; }
    public RecruitmentStatus getStatus() { return status; }
    public void setStatus(RecruitmentStatus s) { this.status = s; }
    public Company getCompany() { return company; }
    public void setCompany(Company c) { this.company = c; }
}