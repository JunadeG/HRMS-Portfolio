package com.HRMSbackend.HRMSbackend.DTO;

public class LoginResponse {
    private String username;
    private String role;
    private String token;

    public LoginResponse() {
        // No-argument constructor (recommended)
    }

    public LoginResponse(String username, String role, String token) {
        this.username = username;
        this.role = role;
        this.token = token;
    }

    public String getUsername() {
        return username;
    }

    public String getRole() {
        return role;
    }

    public String getToken() {
        return token;
    }




}