package com.DTO;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public class UserSalaryUpdateDTO {

    @NotNull(message = "Base salary cannot be null")
    @DecimalMin(value = "0.0", inclusive = true, message = "Base salary cannot be negative") // Allow 0 if needed
    private BigDecimal baseSalary;

    @NotBlank(message = "Currency cannot be blank")
    @Size(min=3, max=3, message="Currency code must be 3 characters")
    private String currency;

    // Getters and Setters
    public BigDecimal getBaseSalary() { return baseSalary; }
    public void setBaseSalary(BigDecimal baseSalary) { this.baseSalary = baseSalary; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
}