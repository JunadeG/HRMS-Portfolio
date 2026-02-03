package com.DTO;

// No changes needed here if you prefer sending department name as string from frontend
// The backend service will handle the lookup.
public class RegistrationRequest {
    private String firstName;
    private String lastName;
    private String username;
    private String password;
    private String mobileNumber;
    private String role; // Consider using Enum type directly if consistent
    private Long companyId; // Use Long for the company ID
    private String department; // Keep as String for incoming request

    // Constructors
    public RegistrationRequest() {}

    public RegistrationRequest(String firstName, String lastName, String username, String password, String mobileNumber, String role, Long companyId, String department) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.username = username;
        this.password = password;
        this.mobileNumber = mobileNumber;
        this.role = role;
        this.companyId = companyId;
        this.department = department; // Keep as String
    }

    // --- Getters and Setters ---
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getMobileNumber() { return mobileNumber; }
    public void setMobileNumber(String mobileNumber) { this.mobileNumber = mobileNumber; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public Long getCompanyId() { return companyId; }
    public void setCompanyId(Long companyId) { this.companyId = companyId; }
    public String getDepartment() { return department; } // Keep as String
    public void setDepartment(String department) { this.department = department; } // Keep as String
}