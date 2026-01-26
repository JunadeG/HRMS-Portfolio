package com.HRMSbackend.HRMSbackend.controller;

import com.HRMSbackend.HRMSbackend.DTO.UserSearchResultDTO;
import com.HRMSbackend.HRMSbackend.model.User;
import com.HRMSbackend.HRMSbackend.service.SearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/search")
@PreAuthorize("isAuthenticated()")
public class SearchController {

    @Autowired
    private SearchService searchService;

    @GetMapping("/employees")
    public ResponseEntity<List<UserSearchResultDTO>> searchEmployees(
            @RequestParam("q") String query,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(searchService.searchUsers(currentUser, query));
    }
}