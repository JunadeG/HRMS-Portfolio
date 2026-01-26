package com.HRMSbackend.HRMSbackend.DTO;

import java.util.List;

public class MyTeamViewDTO {

    private UserProfileDTO manager;
    private List<UserProfileDTO> peers;
    private List<UserProfileDTO> directReports;

    // Getters and Setters
    public UserProfileDTO getManager() {
        return manager;
    }

    public void setManager(UserProfileDTO manager) {
        this.manager = manager;
    }

    public List<UserProfileDTO> getPeers() {
        return peers;
    }

    public void setPeers(List<UserProfileDTO> peers) {
        this.peers = peers;
    }

    public List<UserProfileDTO> getDirectReports() {
        return directReports;
    }

    public void setDirectReports(List<UserProfileDTO> directReports) {
        this.directReports = directReports;
    }
}