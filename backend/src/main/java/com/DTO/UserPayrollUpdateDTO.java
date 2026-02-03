package com.DTO;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

// This DTO combines salary info with bank details for updating a user's payroll relevant fields
public class UserPayrollUpdateDTO {

    // Salary fields
    @NotNull(message = "Base salary cannot be null")
    @DecimalMin(value = "0.0", inclusive = true, message = "Base salary cannot be negative") // Allow 0
    private BigDecimal baseSalary;

    @NotBlank(message = "Currency cannot be blank")
    @Size(min=3, max=3, message="Currency code must be 3 characters (e.g., USD, ZAR)")
    private String currency;

    // Bank details (nullable as they might not always be available)
    private String bankName;
    private String bankAccountNumber;
    private String bankIfscCode; // Or SWIFT/Routing number depending on region


    // --- Getters and Setters ---
    public BigDecimal getBaseSalary() { return baseSalary; }
    public void setBaseSalary(BigDecimal baseSalary) { this.baseSalary = baseSalary; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public String getBankName() { return bankName; }
    public void setBankName(String bankName) { this.bankName = bankName; }
    public String getBankAccountNumber() { return bankAccountNumber; }
    public void setBankAccountNumber(String bankAccountNumber) { this.bankAccountNumber = bankAccountNumber; }
    public String getBankIfscCode() { return bankIfscCode; }
    public void setBankIfscCode(String bankIfscCode) { this.bankIfscCode = bankIfscCode; }
}