package com.HRMSbackend.HRMSbackend.DTO;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class AssignSalaryComponentDTO {
    @NotNull
    private Long componentId;
    @NotNull
    private BigDecimal value;

    // Getters and Setters
    public Long getComponentId() { return componentId; }
    public void setComponentId(Long componentId) { this.componentId = componentId; }
    public BigDecimal getValue() { return value; }
    public void setValue(BigDecimal value) { this.value = value; }
}