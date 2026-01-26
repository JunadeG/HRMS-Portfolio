package com.HRMSbackend.HRMSbackend.DTO;

public class LoginRequest {
    private String username;
    private String password;
//    private String company;
private Long companyId;
    private String loginAs;   // ✅ NEW FIELD: User/Admin

    public LoginRequest() {}

    public LoginRequest(String username, String password, Long companyId, String loginAs) {
        this.username = username;
        this.password = password;
        this.companyId = companyId; // Use companyId
        this.loginAs = loginAs;
    }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public Long getCompanyId() { // ✅ Updated getter
        return companyId;


    }
    public void setCompanyId(Long companyId) { // ✅ Updated setter
        this.companyId = companyId;
    }
    public String getLoginAs() { return loginAs; }


    public void setLoginAs(String loginAs) { this.loginAs = loginAs; }
}

