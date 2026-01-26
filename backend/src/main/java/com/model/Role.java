package com.HRMSbackend.HRMSbackend.model;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum Role {
    ADMIN, USER, SUPER_ADMIN, MANAGER;

    @JsonCreator
    public static Role fromString(String value) {
        return Role.valueOf(value.toUpperCase());  // Converts input to uppercase
    }

    @Override
    public String toString() {
        return name().toUpperCase();  // Ensures it's stored as uppercase
    }
}


