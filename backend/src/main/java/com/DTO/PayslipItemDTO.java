package com.DTO;

import com.model.SalaryComponent;
import java.math.BigDecimal;

public class PayslipItemDTO {
    private String componentName;
    private SalaryComponent.ComponentType type;
    private BigDecimal amount;
    // Getters and Setters
    public String getComponentName() { return componentName; }
    public void setComponentName(String componentName) { this.componentName = componentName; }
    public SalaryComponent.ComponentType getType() { return type; }
    public void setType(SalaryComponent.ComponentType type) { this.type = type; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
}