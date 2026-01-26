package com.HRMSbackend.HRMSbackend.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore; // To prevent recursion if needed

import java.util.List;

@Entity
@Table(name = "departments")
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    // Optional: If you want to easily find users in a department
    // Be careful with lazy/eager fetching and potential JSON loops
    @OneToMany(mappedBy = "department")
    @JsonIgnore // Add JsonIgnore to prevent infinite loop during serialization
    private List<User> users;

    // --- Constructors ---
    public Department() {}

    public Department(String name) {
        this.name = name;
    }

    // --- Getters and Setters ---
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<User> getUsers() {
        return users;
    }

    public void setUsers(List<User> users) {
        this.users = users;
    }

    // --- equals() and hashCode() based on 'id' ---
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Department that = (Department) o;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode(); // Use a simple hashcode for entities
    }
}