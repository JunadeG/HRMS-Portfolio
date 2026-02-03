package com.DTO;

import com.model.Asset;
import com.model.User;

import java.time.LocalDate;

public class AssetDto {
    private Long id;
    private String assetName;
    private String assetType;
    private String serialNumber;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getAssetName() {
        return assetName;
    }

    public void setAssetName(String assetName) {
        this.assetName = assetName;
    }

    public String getAssetType() {
        return assetType;
    }

    public void setAssetType(String assetType) {
        this.assetType = assetType;
    }

    public String getSerialNumber() {
        return serialNumber;
    }

    public void setSerialNumber(String serialNumber) {
        this.serialNumber = serialNumber;
    }

    public LocalDate getPurchaseDate() {
        return purchaseDate;
    }

    public void setPurchaseDate(LocalDate purchaseDate) {
        this.purchaseDate = purchaseDate;
    }

    public LocalDate getWarrantyEndDate() {
        return warrantyEndDate;
    }

    public void setWarrantyEndDate(LocalDate warrantyEndDate) {
        this.warrantyEndDate = warrantyEndDate;
    }

    public Asset.AssetStatus getStatus() {
        return status;
    }

    public void setStatus(Asset.AssetStatus status) {
        this.status = status;
    }

    public Long getAllocatedToUserId() {
        return allocatedToUserId;
    }

    public void setAllocatedToUserId(Long allocatedToUserId) {
        this.allocatedToUserId = allocatedToUserId;
    }

    public String getAllocatedToUserName() {
        return allocatedToUserName;
    }

    public void setAllocatedToUserName(String allocatedToUserName) {
        this.allocatedToUserName = allocatedToUserName;
    }

    private LocalDate purchaseDate;
    private LocalDate warrantyEndDate;
    private Asset.AssetStatus status;

    // Include details of who the asset is allocated to
    private Long allocatedToUserId;
    private String allocatedToUserName;

    // Default constructor
    public AssetDto() {}

    // Constructor to map from the Entity
    public AssetDto(Asset asset, User allocatedUser) {
        this.id = asset.getId();
        this.assetName = asset.getAssetName();
        this.assetType = asset.getAssetType();
        this.serialNumber = asset.getSerialNumber();
        this.purchaseDate = asset.getPurchaseDate();
        this.warrantyEndDate = asset.getWarrantyEndDate();
        this.status = asset.getStatus();
        if (allocatedUser != null) {
            this.allocatedToUserId = allocatedUser.getId();
            this.allocatedToUserName = (allocatedUser.getFirstName() + " " + allocatedUser.getLastName()).trim();
        }
    }


}