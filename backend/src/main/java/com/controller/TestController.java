package com.HRMSbackend.HRMSbackend.controller;

import com.HRMSbackend.HRMSbackend.DTO.LoginRequest;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {

    @PostMapping("/testLogin")
    public String testLogin(@RequestBody LoginRequest loginRequest) {
        return "Received username: " + loginRequest.getUsername() +  // Changed to getUsername()
                ", password: " + loginRequest.getPassword();
    }
}