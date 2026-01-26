package com.HRMSbackend.HRMSbackend.service;

import com.HRMSbackend.HRMSbackend.DTO.AssetDto;
import com.HRMSbackend.HRMSbackend.model.Asset;
import com.HRMSbackend.HRMSbackend.model.AssetAllocation;
import com.HRMSbackend.HRMSbackend.model.Company;
import com.HRMSbackend.HRMSbackend.model.User;
import com.HRMSbackend.HRMSbackend.repository.AssetAllocationRepository;
import com.HRMSbackend.HRMSbackend.repository.AssetRepository;
import com.HRMSbackend.HRMSbackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AssetService {

    @Autowired private AssetRepository assetRepository;
    @Autowired private AssetAllocationRepository allocationRepository;
    @Autowired private UserRepository userRepository;

    // --- Asset Management (Admin) ---

    @Transactional
    public Asset createAsset(AssetDto dto, User adminUser) {
        Company company = adminUser.getCompany();
        if (company == null) throw new IllegalStateException("Admin must be associated with a company.");

        Asset asset = new Asset();
        asset.setAssetName(dto.getAssetName());
        asset.setAssetType(dto.getAssetType());
        asset.setSerialNumber(dto.getSerialNumber());
        asset.setPurchaseDate(dto.getPurchaseDate());
        asset.setWarrantyEndDate(dto.getWarrantyEndDate());
        asset.setStatus(Asset.AssetStatus.AVAILABLE); // New assets are always available
        asset.setCompany(company);

        return assetRepository.save(asset);
    }

    @Transactional(readOnly = true)
    public List<AssetDto> getCompanyAssets(User adminUser) {
        Company company = adminUser.getCompany();
        List<Asset> assets = assetRepository.findByCompanyIdOrderByAssetNameAsc(company.getId());

        return assets.stream().map(asset -> {
            User allocatedUser = null;
            if (asset.getStatus() == Asset.AssetStatus.ALLOCATED) {
                AssetAllocation allocation = allocationRepository.findByAssetIdAndReturnDateIsNull(asset.getId());
                if (allocation != null) {
                    allocatedUser = allocation.getUser();
                }
            }
            return new AssetDto(asset, allocatedUser);
        }).collect(Collectors.toList());
    }

    @Transactional
    public AssetAllocation allocateAsset(Long assetId, Long userId, User adminUser) {
        Asset asset = findAndVerifyAsset(assetId, adminUser);
        User user = findAndVerifyUser(userId, adminUser);

        if (asset.getStatus() != Asset.AssetStatus.AVAILABLE) {
            throw new IllegalStateException("Asset is not available for allocation. Current status: " + asset.getStatus());
        }

        asset.setStatus(Asset.AssetStatus.ALLOCATED);
        assetRepository.save(asset);

        AssetAllocation allocation = new AssetAllocation();
        allocation.setAsset(asset);
        allocation.setUser(user);
        allocation.setAllocationDate(LocalDate.now());

        return allocationRepository.save(allocation);
    }

    @Transactional
    public void deallocateAsset(Long assetId, User adminUser) {
        Asset asset = findAndVerifyAsset(assetId, adminUser);

        if (asset.getStatus() != Asset.AssetStatus.ALLOCATED) {
            throw new IllegalStateException("Asset is not currently allocated.");
        }

        AssetAllocation allocation = allocationRepository.findByAssetIdAndReturnDateIsNull(asset.getId());
        if (allocation != null) {
            allocation.setReturnDate(LocalDate.now());
            allocationRepository.save(allocation);
        }

        asset.setStatus(Asset.AssetStatus.AVAILABLE);
        assetRepository.save(asset);
    }

    // --- User View ---

    @Transactional(readOnly = true)
    public List<AssetAllocation> getMyAllocatedAssets(User currentUser) {
        return allocationRepository.findByUserIdAndReturnDateIsNull(currentUser.getId());
    }

    // --- Helper Methods ---
    private Asset findAndVerifyAsset(Long assetId, User adminUser) {
        Asset asset = assetRepository.findById(assetId).orElseThrow(() -> new IllegalArgumentException("Asset not found."));
        if (adminUser.getRole() != User.Role.SUPER_ADMIN && !asset.getCompany().getId().equals(adminUser.getCompany().getId())) {
            throw new AccessDeniedException("Permission denied for this asset.");
        }
        return asset;
    }
    private User findAndVerifyUser(Long userId, User adminUser) {
        User user = userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found."));
        if (adminUser.getRole() != User.Role.SUPER_ADMIN && !user.getCompany().getId().equals(adminUser.getCompany().getId())) {
            throw new AccessDeniedException("Cannot allocate assets to users outside your company.");
        }
        return user;
    }
}