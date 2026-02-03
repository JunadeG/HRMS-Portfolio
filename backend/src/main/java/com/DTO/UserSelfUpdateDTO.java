package com.DTO;

// This DTO is for an employee updating their own payroll-related details.
public class UserSelfUpdateDTO {

    // Personal details from existing UserProfileUpdateDTO can be merged here if desired
    private String firstName;
    private String lastName;
    private String mobileNumber;
    private String address;

    // Bank details
    private String bankName;
    private String bankAccountNumber;
    private String bankIfscCode; // Or SWIFT/Routing number

    // Getters and Setters
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getMobileNumber() { return mobileNumber; }
    public void setMobileNumber(String mobileNumber) { this.mobileNumber = mobileNumber; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getBankName() { return bankName; }
    public void setBankName(String bankName) { this.bankName = bankName; }
    public String getBankAccountNumber() { return bankAccountNumber; }
    public void setBankAccountNumber(String bankAccountNumber) { this.bankAccountNumber = bankAccountNumber; }
    public String getBankIfscCode() { return bankIfscCode; }
    public void setBankIfscCode(String bankIfscCode) { this.bankIfscCode = bankIfscCode; }
}