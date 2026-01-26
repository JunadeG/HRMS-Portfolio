package com.HRMSbackend.HRMSbackend.repository;

import com.HRMSbackend.HRMSbackend.model.AssetAllocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssetAllocationRepository extends JpaRepository<AssetAllocation, Long> {
    // Find all currently active allocations for a specific user
    List<AssetAllocation> findByUserIdAndReturnDateIsNull(Long userId);

    // Find a specific active allocation for a given asset
    AssetAllocation findByAssetIdAndReturnDateIsNull(Long assetId);
}