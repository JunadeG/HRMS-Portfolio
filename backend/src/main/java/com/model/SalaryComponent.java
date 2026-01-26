package com.HRMSbackend.HRMSbackend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "salary_components")
public class SalaryComponent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name; // e.g., "House Rent Allowance", "Provident Fund"

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ComponentType type; // ALLOWANCE or DEDUCTION

    // e.g., of "BASE_SALARY". Could be an enum later for validation.
    private String percentageOf;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    @JsonIgnore
    private Company company; // Components are company-specific

    public enum ComponentType {
        ALLOWANCE,
        DEDUCTION
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public ComponentType getType() { return type; }
    public void setType(ComponentType type) { this.type = type; }
    public String getPercentageOf() { return percentageOf; }
    public void setPercentageOf(String percentageOf) { this.percentageOf = percentageOf; }
    public Company getCompany() { return company; }
    public void setCompany(Company company) { this.company = company; }
}