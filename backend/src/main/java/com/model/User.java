package com.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.math.BigDecimal;
import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Table(name = "users")

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class User {



    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @Column(name = "username", unique = true, nullable = false)
    private String username;

    @Column(name = "password", nullable = false)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    @Column(name = "mobile_number")
    private String mobileNumber;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "company_id")
    private Company company;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private Role role;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private UserStatus status = UserStatus.PENDING_APPROVAL;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "department_id")
    private Department department;

    @Column(name = "reset_token")
    private String resetToken;

    @Column(name = "reset_token_expiry")
    private LocalDateTime resetTokenExpiry;

    @Column(name = "email", unique = true)
    private String email;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "job_title")
    private String jobTitle;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "address", length = 500)
    private String address;

    @Column(name = "emergency_contact_name")
    private String emergencyContactName;

    @Column(name = "emergency_contact_phone")
    private String emergencyContactPhone;

    @Column(name = "profile_picture_path")
    private String profilePicturePath;

    @Column(name = "paid_leave_balance", columnDefinition = "NUMERIC(5,1) default 0.0")
    private Double paidLeaveBalance = 0.0;

    @Column(name = "sick_leave_balance", columnDefinition = "NUMERIC(5,1) default 0.0")
    private Double sickLeaveBalance = 0.0;

    @Column(name = "floater_leave_balance", columnDefinition = "NUMERIC(5,1) default 0.0")
    private Double floaterLeaveBalance = 0.0;

    @Column(name = "base_salary", precision = 12, scale = 2)
    private BigDecimal baseSalary;

    @Column(name = "currency", length = 3)
    private String currency;

    @Column(name = "bank_name", length=100)
    private String bankName;

    @Column(name = "bank_account_number", length=50)
    private String bankAccountNumber;

    @Column(name = "bank_ifsc_code", length=20)
    private String bankIfscCode;

    public enum Role { USER, ADMIN, SUPER_ADMIN }
    public enum UserStatus { PENDING_APPROVAL, APPROVED, REJECTED }

    @Column(name = "employee_id", unique = true)
    private String employeeId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "reporting_manager_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "reportingManager", "projectManager"})
    private User reportingManager;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "project_manager_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "reportingManager", "projectManager"})
    private User projectManager;

    @Column(name = "work_email", unique = true)
    private String workEmail;

    @Column(name = "alternate_contact_number")
    private String alternateContactNumber;

    @Column(name = "nationality")
    private String nationality;

    @Enumerated(EnumType.STRING)
    @Column(name = "gender")
    private Gender gender;

    @Enumerated(EnumType.STRING)
    @Column(name = "marital_status")
    private MaritalStatus maritalStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "blood_group")
    private BloodGroup bloodGroup;

    // --- Getters and Setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
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
    public Company getCompany() { return company; }
    public void setCompany(Company company) { this.company = company; }
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
    public UserStatus getStatus() { return status; }
    public void setStatus(UserStatus status) { this.status = status; }
    public Department getDepartment() { return department; }
    public void setDepartment(Department department) { this.department = department; }
    public String getResetToken() { return resetToken; }
    public void setResetToken(String resetToken) { this.resetToken = resetToken; }
    public LocalDateTime getResetTokenExpiry() { return resetTokenExpiry; }
    public void setResetTokenExpiry(LocalDateTime resetTokenExpiry) { this.resetTokenExpiry = resetTokenExpiry; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }
    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getEmergencyContactName() { return emergencyContactName; }
    public void setEmergencyContactName(String emergencyContactName) { this.emergencyContactName = emergencyContactName; }
    public String getEmergencyContactPhone() { return emergencyContactPhone; }
    public void setEmergencyContactPhone(String emergencyContactPhone) { this.emergencyContactPhone = emergencyContactPhone; }
    public String getProfilePicturePath() { return profilePicturePath; }
    public void setProfilePicturePath(String profilePicturePath) { this.profilePicturePath = profilePicturePath; }
    public Double getPaidLeaveBalance() { return paidLeaveBalance == null ? 0.0 : paidLeaveBalance; }
    public void setPaidLeaveBalance(Double paidLeaveBalance) { this.paidLeaveBalance = paidLeaveBalance; }
    public Double getSickLeaveBalance() { return sickLeaveBalance == null ? 0.0 : sickLeaveBalance; }
    public void setSickLeaveBalance(Double sickLeaveBalance) { this.sickLeaveBalance = sickLeaveBalance; }
    public Double getFloaterLeaveBalance() { return floaterLeaveBalance == null ? 0.0 : floaterLeaveBalance; }
    public void setFloaterLeaveBalance(Double floaterLeaveBalance) { this.floaterLeaveBalance = floaterLeaveBalance; }
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
    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }
    public User getReportingManager() { return reportingManager; }
    public void setReportingManager(User reportingManager) { this.reportingManager = reportingManager; }
    public User getProjectManager() { return projectManager; }
    public void setProjectManager(User projectManager) { this.projectManager = projectManager; }
    public String getWorkEmail() { return workEmail; }
    public void setWorkEmail(String workEmail) { this.workEmail = workEmail; }
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

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        User user = (User) o;
        return id != null && id.equals(user.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }


    public enum OnboardingStatus {
        PENDING_DOCUMENTS,  // User has been approved, needs to upload documents
        PENDING_VERIFICATION, // User has uploaded documents, admin needs to verify
        COMPLETED           // Admin has verified all documents and completed the process
    }

    @Enumerated(EnumType.STRING)
    @Column(name = "onboarding_status")
    private OnboardingStatus onboardingStatus;

    // Add getter and setter for onboardingStatus
    public OnboardingStatus getOnboardingStatus() { return onboardingStatus; }
    public void setOnboardingStatus(OnboardingStatus onboardingStatus) { this.onboardingStatus = onboardingStatus; }
}