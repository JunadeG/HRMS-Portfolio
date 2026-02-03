package com.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "department_salary_structures", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"department_id", "company_id", "currency"}) // Ensure one structure per dept/company/currency
})
public class DepartmentSalaryStructure {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @ManyToOne(optional = false)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company; // Salary structures are company-specific

    @Column(name = "default_base_salary", precision = 12, scale = 2, nullable = false)
    private BigDecimal defaultBaseSalary;

    @Column(name = "currency", length = 3, nullable = false) // e.g., "USD", "ZAR"
    private String currency;

    // Standard getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Department getDepartment() { return department; }
    public void setDepartment(Department department) { this.department = department; }
    public Company getCompany() { return company; }
    public void setCompany(Company company) { this.company = company; }
    public BigDecimal getDefaultBaseSalary() { return defaultBaseSalary; }
    public void setDefaultBaseSalary(BigDecimal defaultBaseSalary) { this.defaultBaseSalary = defaultBaseSalary; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
}