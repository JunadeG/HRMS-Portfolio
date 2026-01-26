package com.HRMSbackend.HRMSbackend.service;

import com.HRMSbackend.HRMSbackend.model.User;
import com.HRMSbackend.HRMSbackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Optional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {  // Changed to username
        Optional<User> userOptional = userRepository.findByUsername(username);  // Find by username
        if (userOptional.isEmpty()) {
            throw new UsernameNotFoundException("User not found with username: " + username);  // Updated message
        }
        User user = userOptional.get();
        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),  // Use username
                user.getPassword(),
                new ArrayList<>()
        );
    }
}