// Example: src/main/java/com/HRMSbackend/HRMSbackend/model/Notice.java
package com.HRMSbackend.HRMSbackend.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "notices")
public class Notice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String subject;

    private LocalTime time; // As shown in image, might represent publish time or event time
    private LocalDate startDate;
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    private Priority priority; // HIGH, MEDIUM, LOW

    private String audience; // Could be Department name, 'All', etc.

    @ManyToOne // Link notices to a company
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    // Getters and Setters...
    public enum Priority {
        HIGH, MEDIUM, LOW
    }
    // Constructor, Getters, Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getSubject() { return subject; }
    public void setSubject(String s) { this.subject = s; }
    public LocalTime getTime() { return time; }
    public void setTime(LocalTime t) { this.time = t; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate d) { this.startDate = d; }
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate d) { this.endDate = d; }
    public Priority getPriority() { return priority; }
    public void setPriority(Priority p) { this.priority = p; }
    public String getAudience() { return audience; }
    public void setAudience(String a) { this.audience = a; }
    public Company getCompany() { return company; }
    public void setCompany(Company c) { this.company = c; }

}