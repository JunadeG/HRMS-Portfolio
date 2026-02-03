package com.DTO;

public class LeaveBalanceDTO {
    private double paidLeaveBalance;
    private double sickLeaveBalance;
    private double floaterLeaveBalance;
    // Unpaid leave typically doesn't have a "balance" to display here

    public LeaveBalanceDTO(double paidLeaveBalance, double sickLeaveBalance, double floaterLeaveBalance) {
        this.paidLeaveBalance = paidLeaveBalance;
        this.sickLeaveBalance = sickLeaveBalance;
        this.floaterLeaveBalance = floaterLeaveBalance;
    }

    // Getters and Setters
    public double getPaidLeaveBalance() { return paidLeaveBalance; }
    public void setPaidLeaveBalance(double paidLeaveBalance) { this.paidLeaveBalance = paidLeaveBalance; }
    public double getSickLeaveBalance() { return sickLeaveBalance; }
    public void setSickLeaveBalance(double sickLeaveBalance) { this.sickLeaveBalance = sickLeaveBalance; }
    public double getFloaterLeaveBalance() { return floaterLeaveBalance; }
    public void setFloaterLeaveBalance(double floaterLeaveBalance) { this.floaterLeaveBalance = floaterLeaveBalance; }
}