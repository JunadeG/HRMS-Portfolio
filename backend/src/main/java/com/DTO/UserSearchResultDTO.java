package com.HRMSbackend.HRMSbackend.DTO;

import com.HRMSbackend.HRMSbackend.model.User;

public class UserSearchResultDTO {
    private Long id;
    private String fullName;
    private String jobTitle;
    private String profilePicturePath;

    public UserSearchResultDTO(User user) {
        this.id = user.getId();
        this.fullName = (user.getFirstName() + " " + user.getLastName()).trim();
        this.jobTitle = user.getJobTitle();
        this.profilePicturePath = user.getProfilePicturePath();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }
    public String getProfilePicturePath() { return profilePicturePath; }
    public void setProfilePicturePath(String profilePicturePath) { this.profilePicturePath = profilePicturePath; }
}