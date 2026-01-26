package com.HRMSbackend.HRMSbackend.DTO;

import java.time.LocalDate;

public class BirthdayDTO {
    private String name;
    private LocalDate birthDate;

    public BirthdayDTO(String name, LocalDate birthDate) {
        this.name = name;
        this.birthDate = birthDate;
    }
    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public LocalDate getBirthDate() { return birthDate; }
    public void setBirthDate(LocalDate birthDate) { this.birthDate = birthDate; }
}