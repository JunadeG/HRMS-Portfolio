package com.service;

import com.DTO.MyTeamViewDTO;
import com.DTO.UserProfileDTO;
import com.DTO.UserProfileUpdateDTO;
import com.model.Department;
import com.model.User;
import com.repository.DepartmentRepository;
import com.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Transactional
    public User updateUserProfile(User currentUser, UserProfileUpdateDTO dto) {
        User userToUpdate = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + currentUser.getId() + ". Cannot update profile."));

        if (StringUtils.hasText(dto.getFirstName())) { userToUpdate.setFirstName(dto.getFirstName().trim()); }
        if (StringUtils.hasText(dto.getLastName())) { userToUpdate.setLastName(dto.getLastName().trim()); }
        if (StringUtils.hasText(dto.getMobileNumber())) { userToUpdate.setMobileNumber(dto.getMobileNumber().trim()); }
        if (StringUtils.hasText(dto.getEmail())) { userToUpdate.setEmail(dto.getEmail().trim().toLowerCase()); }
        if (dto.getDateOfBirth() != null) { userToUpdate.setDateOfBirth(dto.getDateOfBirth()); }
        if (StringUtils.hasText(dto.getAddress())) { userToUpdate.setAddress(dto.getAddress().trim()); }
        if (StringUtils.hasText(dto.getEmergencyContactName())) { userToUpdate.setEmergencyContactName(dto.getEmergencyContactName().trim()); }
        if (StringUtils.hasText(dto.getEmergencyContactPhone())) { userToUpdate.setEmergencyContactPhone(dto.getEmergencyContactPhone().trim()); }
        if (StringUtils.hasText(dto.getDepartmentName())) {
            Department newDepartment = departmentRepository.findByNameIgnoreCase(dto.getDepartmentName().trim())
                    .orElseThrow(() -> new IllegalArgumentException("Invalid department specified: " + dto.getDepartmentName()));
            userToUpdate.setDepartment(newDepartment);
        }
        if (StringUtils.hasText(dto.getBankName())) { userToUpdate.setBankName(dto.getBankName().trim()); }
        if (StringUtils.hasText(dto.getBankAccountNumber())) { userToUpdate.setBankAccountNumber(dto.getBankAccountNumber().trim()); }
        if (StringUtils.hasText(dto.getBankIfscCode())) { userToUpdate.setBankIfscCode(dto.getBankIfscCode().trim()); }
        if (StringUtils.hasText(dto.getWorkEmail())) { userToUpdate.setWorkEmail(dto.getWorkEmail().trim().toLowerCase()); }
        if (StringUtils.hasText(dto.getAlternateContactNumber())) { userToUpdate.setAlternateContactNumber(dto.getAlternateContactNumber().trim()); }
        if (StringUtils.hasText(dto.getNationality())) { userToUpdate.setNationality(dto.getNationality().trim()); }
        if (dto.getGender() != null) { userToUpdate.setGender(dto.getGender()); }
        if (dto.getMaritalStatus() != null) { userToUpdate.setMaritalStatus(dto.getMaritalStatus()); }
        if (dto.getBloodGroup() != null) { userToUpdate.setBloodGroup(dto.getBloodGroup()); }

        return userRepository.save(userToUpdate);
    }

    @Transactional
    public User updateProfilePicturePath(Long userId, String filePath) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId + ". Cannot update picture path."));
        user.setProfilePicturePath(filePath);
        return userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public UserProfileDTO getUserProfileDto(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return new UserProfileDTO(user);
    }

    @Transactional(readOnly = true)
    public UserProfileDTO getPublicUserProfile(Long userIdToView, User requester) {
        User userToView = userRepository.findById(userIdToView)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userIdToView));

        if (requester.getCompany() == null || userToView.getCompany() == null || !requester.getCompany().getId().equals(userToView.getCompany().getId())) {
            throw new AccessDeniedException("You do not have permission to view this user's profile.");
        }

        return new UserProfileDTO(userToView);
    }

    @Transactional(readOnly = true)
    public MyTeamViewDTO getMyTeamView(User currentUser) {
        if (currentUser == null) {
            throw new IllegalArgumentException("Current user cannot be null.");
        }

        // Reload the user to ensure all EAGER relationships are definitely loaded
        User fullyLoadedUser = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new IllegalStateException("Could not fully load current user data."));

        MyTeamViewDTO teamView = new MyTeamViewDTO();

        // 1. Find the user's manager
        User manager = fullyLoadedUser.getReportingManager();
        if (manager != null) {
            teamView.setManager(new UserProfileDTO(manager));
        }

        // 2. Find the user's peers
        if (manager != null) {

            List<User> peers = userRepository.findByReportingManagerId(manager.getId())
                    .stream()
                    .filter(peer -> !peer.getId().equals(fullyLoadedUser.getId()))
                    .collect(Collectors.toList());
            teamView.setPeers(peers.stream().map(UserProfileDTO::new).collect(Collectors.toList()));
        } else {
            teamView.setPeers(Collections.emptyList());
        }

        // 3. Find the user's direct reports

        List<User> directReports = userRepository.findByReportingManagerId(fullyLoadedUser.getId());
        teamView.setDirectReports(directReports.stream().map(UserProfileDTO::new).collect(Collectors.toList()));

        return teamView;
    }
}