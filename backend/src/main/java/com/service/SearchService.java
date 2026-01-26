package com.HRMSbackend.HRMSbackend.service;

import com.HRMSbackend.HRMSbackend.DTO.UserSearchResultDTO;
import com.HRMSbackend.HRMSbackend.model.User;
import com.HRMSbackend.HRMSbackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SearchService {

    @Autowired
    private UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<UserSearchResultDTO> searchUsers(User currentUser, String query) {
        if (currentUser.getCompany() == null) {
            throw new IllegalStateException("User is not associated with a company.");
        }
        // Limit the result size for performance
        List<User> users = userRepository.searchApprovedUsersInCompany(currentUser.getCompany().getId(), query);
        return users.stream()
                .limit(10) // Return a max of 10 results
                .map(UserSearchResultDTO::new)
                .collect(Collectors.toList());
    }
}