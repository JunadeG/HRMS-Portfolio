package com.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

//@Getter
//@Setter
//@NoArgsConstructor
//@AllArgsConstructor
//@Entity
//@Table(name = "employees")
public class Employee {

@ManyToOne
@JoinColumn(name = "company_id")
private Company company;

    private String address;
    private LocalDate dateOfBirth;
    private String department; // Consider removing this and using department_id
    private String email;
    private String emergencyContactPhone;
    private String jobTitle;
    private String profilePicturePath;
    private LocalDate startDate;
}

