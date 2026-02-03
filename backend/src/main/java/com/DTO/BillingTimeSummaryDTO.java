package com.DTO;

import com.model.BillingType;
import java.math.BigDecimal;

public class BillingTimeSummaryDTO {
    private BillingType billingType;
    private BigDecimal totalHours;

    // Constructor for JPA query
    public BillingTimeSummaryDTO(BillingType billingType, Double totalHours) {
        this.billingType = billingType;
        this.totalHours = totalHours != null ? BigDecimal.valueOf(totalHours) : BigDecimal.ZERO;
    }

    // Getters and Setters
    public BillingType getBillingType() { return billingType; }
    public void setBillingType(BillingType billingType) { this.billingType = billingType; }
    public BigDecimal getTotalHours() { return totalHours; }
    public void setTotalHours(BigDecimal totalHours) { this.totalHours = totalHours; }
}