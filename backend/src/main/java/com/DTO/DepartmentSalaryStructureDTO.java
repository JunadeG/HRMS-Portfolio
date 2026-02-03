package com.DTO;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public class DepartmentSalaryStructureDTO {
    private Long id; // For updates

    @NotNull(message = "Department ID cannot be null")
    private Long departmentId;
    private String departmentName; // For display (populated by service/converter)

    // Add Company Name for display (useful for SUPER_ADMIN or lists)
    private String companyName;

    @NotNull(message = "Default base salary cannot be null")
    @DecimalMin(value = "0.0", inclusive = false, message = "Default base salary must be positive")
    private BigDecimal defaultBaseSalary;

    @NotBlank(message = "Currency code cannot be blank")
    @Size(min = 3, max = 3, message = "Currency code must be 3 characters")
    private String currency; // e.g., USD, ZAR

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getDepartmentId() { return departmentId; }
    public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }
    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }

    // Getter and Setter for companyName
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public BigDecimal getDefaultBaseSalary() { return defaultBaseSalary; }
    public void setDefaultBaseSalary(BigDecimal defaultBaseSalary) { this.defaultBaseSalary = defaultBaseSalary; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
}