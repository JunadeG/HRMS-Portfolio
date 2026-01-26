package com.HRMSbackend.HRMSbackend.controller;

import com.HRMSbackend.HRMSbackend.DTO.AssetDto;
import com.HRMSbackend.HRMSbackend.model.User;
import com.HRMSbackend.HRMSbackend.service.AssetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/assets")
public class AssetController {

    @Autowired
    private AssetService assetService;

    // --- Admin Endpoints ---

    @GetMapping("/admin/company-assets")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> getCompanyAssets(@AuthenticationPrincipal User adminUser) {
        return ResponseEntity.ok(assetService.getCompanyAssets(adminUser));
    }

    @PostMapping("/admin/create")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> createAsset(@RequestBody AssetDto assetDto, @AuthenticationPrincipal User adminUser) {
        try {
            return ResponseEntity.status(201).body(assetService.createAsset(assetDto, adminUser));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/admin/allocate")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> allocateAsset(@RequestBody Map<String, Long> payload, @AuthenticationPrincipal User adminUser) {
        try {
            Long assetId = payload.get("assetId");
            Long userId = payload.get("userId");
            return ResponseEntity.ok(assetService.allocateAsset(assetId, userId, adminUser));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/admin/{assetId}/deallocate")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> deallocateAsset(@PathVariable Long assetId, @AuthenticationPrincipal User adminUser) {
        try {
            assetService.deallocateAsset(assetId, adminUser);
            return ResponseEntity.ok(Map.of("message", "Asset successfully deallocated."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // --- Employee Endpoint ---

    @GetMapping("/my-assets")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getMyAssets(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(assetService.getMyAllocatedAssets(currentUser));
    }
}