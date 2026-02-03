package com.DTO;

import com.model.EmployeeDocument;
import java.time.LocalDateTime;

public class EmployeeDocumentDTO {

    private Long id;
    private String documentType;
    private String filePath;
    private EmployeeDocument.DocumentStatus status;
    private LocalDateTime uploadDate;
    private String notes;
    private String verifierName;
    private String employeeName;

    // A no-argument constructor is required for many frameworks.
    public EmployeeDocumentDTO() {}

    // Constructor to map from the Entity
    public EmployeeDocumentDTO(EmployeeDocument doc) {
        this.id = doc.getId();
        this.documentType = doc.getDocumentType();
        this.filePath = doc.getFilePath();
        this.status = doc.getStatus();
        this.uploadDate = doc.getUploadDate();
        this.notes = doc.getNotes();
        if (doc.getVerifier() != null) {
            this.verifierName = (doc.getVerifier().getFirstName() + " " + doc.getVerifier().getLastName()).trim();
        }
        if (doc.getUser() != null) {
            this.employeeName = (doc.getUser().getFirstName() + " " + doc.getUser().getLastName()).trim();
        }
    }

    // Getters and Setters for all fields
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getDocumentType() {
        return documentType;
    }

    public void setDocumentType(String documentType) {
        this.documentType = documentType;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public EmployeeDocument.DocumentStatus getStatus() {
        return status;
    }

    public void setStatus(EmployeeDocument.DocumentStatus status) {
        this.status = status;
    }

    public LocalDateTime getUploadDate() {
        return uploadDate;
    }

    public void setUploadDate(LocalDateTime uploadDate) {
        this.uploadDate = uploadDate;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getVerifierName() {
        return verifierName;
    }

    public void setVerifierName(String verifierName) {
        this.verifierName = verifierName;
    }

    public String getEmployeeName() {
        return employeeName;
    }

    public void setEmployeeName(String employeeName) {
        this.employeeName = employeeName;
    }
}