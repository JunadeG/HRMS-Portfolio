package com.DTO;

import java.math.BigDecimal;

// This DTO represents one calculated entry in the payroll preview
public class CalculatedPayrollItemDTO {
    private Long userId;
    private String username;
    private String fullName;
    private String department;
    private BigDecimal calculatedGrossPay; // Gross pay for a pay period (e.g., monthly)
    private String currency;
    private String notes; // Optional: like "Based on Department Default"

    // Getters and Setters
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public BigDecimal getCalculatedGrossPay() { return calculatedGrossPay; }
    public void setCalculatedGrossPay(BigDecimal calculatedGrossPay) { this.calculatedGrossPay = calculatedGrossPay; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}