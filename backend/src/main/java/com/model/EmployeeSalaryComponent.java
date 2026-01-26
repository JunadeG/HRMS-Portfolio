package com.HRMSbackend.HRMSbackend.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "employee_salary_components")
public class EmployeeSalaryComponent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "component_id", nullable = false)
    private SalaryComponent salaryComponent;

    @Column(precision = 12, scale = 2)
    private BigDecimal value; // The actual amount or percentage for this employee

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public SalaryComponent getSalaryComponent() { return salaryComponent; }
    public void setSalaryComponent(SalaryComponent salaryComponent) { this.salaryComponent = salaryComponent; }
    public BigDecimal getValue() { return value; }
    public void setValue(BigDecimal value) { this.value = value; }
}