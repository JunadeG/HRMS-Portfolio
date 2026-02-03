package com.DTO;

import com.model.BloodGroup;
import com.model.Gender;
import com.model.MaritalStatus;
import com.model.User;
import java.time.LocalDate;

public class UserProfileDTO {

    // --- Fields ---
    private Long id;
    private String firstName;
    private String lastName;
    private String username;
    private String role;
    private String companyName;
    private String departmentName;
    private String jobTitle;
    private String workEmail;
    private String profilePicturePath;
    private String reportingManagerName;
    private String projectManagerName;
    private String employeeId;
    private String mobileNumber;
    private String email;
    private LocalDate dateOfBirth;
    private String address;
    private String alternateContactNumber; // Added for completeness

    // Personal Details Fields
    private String nationality;
    private Gender gender;
    private MaritalStatus maritalStatus;
    private BloodGroup bloodGroup;

    // --- Constructor ---
    public UserProfileDTO(User user) {
        this.id = user.getId();
        this.firstName = user.getFirstName();
        this.lastName = user.getLastName();
        this.username = user.getUsername();
        this.role = user.getRole().name();
        this.employeeId = user.getEmployeeId();

        if (user.getCompany() != null) {
            this.companyName = user.getCompany().getName();
        }
        if (user.getDepartment() != null) {
            this.departmentName = user.getDepartment().getName();
        }

        this.jobTitle = user.getJobTitle();
        this.workEmail = user.getWorkEmail();
        this.profilePicturePath = user.getProfilePicturePath();

        if (user.getReportingManager() != null) {
            this.reportingManagerName = user.getReportingManager().getFirstName() + " " + user.getReportingManager().getLastName();
        }
        if (user.getProjectManager() != null) {
            this.projectManagerName = user.getProjectManager().getFirstName() + " " + user.getProjectManager().getLastName();
        }

        this.mobileNumber = user.getMobileNumber();
        this.email = user.getEmail();
        this.dateOfBirth = user.getDateOfBirth();
        this.address = user.getAddress();
        this.alternateContactNumber = user.getAlternateContactNumber();

        // <<< --- THIS IS THE CORRECTED PART --- >>>
        // Add the missing personal detail mappings
        this.nationality = user.getNationality();
        this.gender = user.getGender();
        this.maritalStatus = user.getMaritalStatus();
        this.bloodGroup = user.getBloodGroup();
    }

    // --- Getters and Setters (Ensure all fields are covered) ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }
    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }
    public String getWorkEmail() { return workEmail; }
    public void setWorkEmail(String workEmail) { this.workEmail = workEmail; }
    public String getProfilePicturePath() { return profilePicturePath; }
    public void setProfilePicturePath(String profilePicturePath) { this.profilePicturePath = profilePicturePath; }
    public String getReportingManagerName() { return reportingManagerName; }
    public void setReportingManagerName(String reportingManagerName) { this.reportingManagerName = reportingManagerName; }
    public String getProjectManagerName() { return projectManagerName; }
    public void setProjectManagerName(String projectManagerName) { this.projectManagerName = projectManagerName; }
    public String getMobileNumber() { return mobileNumber; }
    public void setMobileNumber(String mobileNumber) { this.mobileNumber = mobileNumber; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }
    public String getAlternateContactNumber() { return alternateContactNumber; }
    public void setAlternateContactNumber(String alternateContactNumber) { this.alternateContactNumber = alternateContactNumber; }
    public String getNationality() { return nationality; }
    public void setNationality(String nationality) { this.nationality = nationality; }
    public Gender getGender() { return gender; }
    public void setGender(Gender gender) { this.gender = gender; }
    public MaritalStatus getMaritalStatus() { return maritalStatus; }
    public void setMaritalStatus(MaritalStatus maritalStatus) { this.maritalStatus = maritalStatus; }
    public BloodGroup getBloodGroup() { return bloodGroup; }
    public void setBloodGroup(BloodGroup bloodGroup) { this.bloodGroup = bloodGroup; }
}