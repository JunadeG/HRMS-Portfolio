package com.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "payslip_items")
public class PayslipItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnore
    @JoinColumn(name = "payslip_id", nullable = false)
    private Payslip payslip;

    private String componentName;

    @Enumerated(EnumType.STRING)
    private SalaryComponent.ComponentType type;

    @Column(precision = 12, scale = 2)
    private BigDecimal amount;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Payslip getPayslip() { return payslip; }
    public void setPayslip(Payslip payslip) { this.payslip = payslip; }
    public String getComponentName() { return componentName; }
    public void setComponentName(String componentName) { this.componentName = componentName; }
    public SalaryComponent.ComponentType getType() { return type; }
    public void setType(SalaryComponent.ComponentType type) { this.type = type; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
}