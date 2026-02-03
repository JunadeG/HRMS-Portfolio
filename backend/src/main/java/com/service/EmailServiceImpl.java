package com.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements EmailInterface {

    @Autowired
    private JavaMailSender mailSender;

    @Override
    public void sendPasswordResetLink(String to, String resetLink) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Password Reset Request");
        message.setText("To reset your password, please click on the following link:\n" + resetLink);
        mailSender.send(message);
    }

    @Override
    public void sendPasswordResetConfirmation(String to) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Password Reset Confirmation");
        message.setText("Your password has been successfully reset.");
        mailSender.send(message);
    }
}