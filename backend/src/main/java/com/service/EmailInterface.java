package com.HRMSbackend.HRMSbackend.service;

public interface EmailInterface {
    void sendPasswordResetLink(String to, String resetLink);
    void sendPasswordResetConfirmation(String to);

}
