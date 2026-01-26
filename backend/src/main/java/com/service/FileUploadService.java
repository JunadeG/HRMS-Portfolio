// src/main/java/com/HRMSbackend/HRMSbackend/service/FileUploadService.java
package com.HRMSbackend.HRMSbackend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.util.StringUtils; // For cleaning filename

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID; // For unique filenames

@Service
public class FileUploadService {

    // Read upload directory from properties. Ensure a sensible default or that it's set.
    // Example: upload.dir.profile-pics=C:/hrms_uploads/profile_pics (Windows)
    // Example: upload.dir.profile-pics=/var/www/hrms/uploads/profile-pics (Linux)
    @Value("${upload.dir.profile-pics:/tmp/hrms/uploads/profile-pics}") // Default to /tmp if not set (adjust as needed)
    private String uploadDir;
    @Value("${upload.dir.expense-receipts:/tmp/hrms/uploads/receipts}")
    private String expenseReceiptUploadDir;
    @Value("${upload.dir.documents:/tmp/hrms/uploads/documents}")
    private String documentsUploadDir;

    public String saveProfilePicture(Long userId, MultipartFile file) throws IOException, IllegalArgumentException {

        // --- Basic Validation ---
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Cannot save empty file.");
        }
        // Validate Content Type (adjust allowed types as needed)
        String contentType = file.getContentType();
        if (contentType == null || !(contentType.equals("image/jpeg") || contentType.equals("image/png") || contentType.equals("image/gif"))) {
            System.err.println("Invalid file type uploaded: " + contentType);
            throw new IllegalArgumentException("Invalid file type. Only JPG, PNG, GIF are allowed.");
        }
        // Optional: File Size Validation
        long maxSize = 5 * 1024 * 1024; // 5MB example
        if (file.getSize() > maxSize) {
            throw new IllegalArgumentException("File size exceeds the limit of " + (maxSize / 1024 / 1024) + "MB.");
        }

        // --- Generate Secure and Unique Filename ---
        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
        String fileExtension = "";
        int lastDot = originalFilename.lastIndexOf('.');
        if (lastDot > 0 && lastDot < originalFilename.length() - 1) { // Ensure dot is not the last character
            fileExtension = originalFilename.substring(lastDot).toLowerCase(); // Use lowercase extension
        } else {
            // Handle case with no extension or invalid filename? Maybe reject?
            System.err.println("File uploaded with no or invalid extension: " + originalFilename);
            // For now, allow saving without extension, but consider rejecting
            // throw new IllegalArgumentException("File must have a valid extension (.jpg, .png, .gif).");
        }
        // Create a unique filename: user_{userId}_{randomUUID}{.ext}
        String uniqueFilename = "user_" + userId + "_" + UUID.randomUUID().toString() + fileExtension;

        // --- Resolve Paths ---
        Path uploadPath = Paths.get(this.uploadDir); // Use the configured directory path
        Path filePath = uploadPath.resolve(uniqueFilename).normalize(); // Resolve and normalize path

        // Security Check: Ensure the resolved path doesn't go outside the intended directory
        if (!filePath.startsWith(uploadPath.toAbsolutePath())) {
            throw new IOException("Cannot store file outside current directory.");
        }

        // --- Create Directory if it Doesn't Exist ---
        if (!Files.exists(uploadPath)) {
            try {
                Files.createDirectories(uploadPath);
                System.out.println("Created upload directory: " + uploadPath.toAbsolutePath());
            } catch (IOException e) {
                System.err.println("Could not create upload directory: " + uploadPath.toAbsolutePath());
                throw new IOException("Could not initialize storage directory.", e);
            }
        }

        // --- Save File ---
        try (InputStream inputStream = file.getInputStream()) {
            // Copy file to the target location (REPLACE_EXISTING handles potential UUID collisions, though unlikely)
            Files.copy(inputStream, filePath, StandardCopyOption.REPLACE_EXISTING);
            System.out.println("Successfully saved profile picture: " + filePath.toAbsolutePath());
        } catch (IOException e) {
            System.err.println("Could not save file '" + uniqueFilename + "' to path '" + filePath.toAbsolutePath() + "'. Error: " + e.getMessage());
            throw new IOException("Could not save uploaded file: " + uniqueFilename, e); // Re-throw with more context
        }

        // --- Return the Path for DB Storage ---
        // This path MUST correspond to how you serve the files via MvcConfig
        // If MvcConfig uses "/static/profile-pics/**", the path here should start with that.
        String accessiblePath = "/static/profile-pics/" + uniqueFilename;
        System.out.println("Returning accessible path for DB: " + accessiblePath);
        return accessiblePath;
    }

    public String saveExpenseReceipt(Long userId, MultipartFile file) throws IOException, IllegalArgumentException {
        // Validation (can be more specific for docs vs images)
        if (file == null || file.isEmpty()) throw new IllegalArgumentException("Cannot save empty file.");
        long maxSize = 10 * 1024 * 1024; // 10MB limit for documents
        if (file.getSize() > maxSize) throw new IllegalArgumentException("File size exceeds 10MB limit.");

        // Generate filename
        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
        String fileExtension = "";
        int lastDot = originalFilename.lastIndexOf('.');
        if (lastDot > 0) fileExtension = originalFilename.substring(lastDot);
        String uniqueFilename = "receipt_" + userId + "_" + System.currentTimeMillis() + fileExtension;

        // Save file logic (reusing the same pattern)
        Path uploadPath = Paths.get(this.expenseReceiptUploadDir);
        if (!Files.exists(uploadPath)) Files.createDirectories(uploadPath);

        Path filePath = uploadPath.resolve(uniqueFilename).normalize();
        if (!filePath.startsWith(uploadPath.toAbsolutePath())) {
            throw new IOException("Cannot store file outside designated directory.");
        }

        try (var inputStream = file.getInputStream()) {
            Files.copy(inputStream, filePath, StandardCopyOption.REPLACE_EXISTING);
        }

        // Return accessible path (configure in MvcConfig later)
        return "/static/expense-receipts/" + uniqueFilename;
    }

    public String saveEmployeeDocument(Long userId, String documentType, MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Cannot save an empty file.");
        }
        // Basic validation for common document types
        String contentType = file.getContentType();
        if (contentType == null || !(contentType.equals("application/pdf") || contentType.equals("image/jpeg") || contentType.equals("image/png"))) {
            throw new IllegalArgumentException("Invalid file type. Only PDF, JPG, and PNG are allowed.");
        }

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
        String fileExtension = "";
        int lastDot = originalFilename.lastIndexOf('.');
        if (lastDot > 0) {
            fileExtension = originalFilename.substring(lastDot);
        }

        // Create a unique, descriptive filename
        String uniqueFilename = String.format("user_%d_%s_%s%s", userId, documentType, System.currentTimeMillis(), fileExtension).replaceAll("[^a-zA-Z0-9._-]", "");

        Path uploadPath = Paths.get(this.documentsUploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        Path filePath = uploadPath.resolve(uniqueFilename).normalize();
        if (!filePath.startsWith(uploadPath.toAbsolutePath())) {
            throw new IOException("Cannot store file outside of the designated directory.");
        }

        try (var inputStream = file.getInputStream()) {
            Files.copy(inputStream, filePath, StandardCopyOption.REPLACE_EXISTING);
        }

        // Return the web-accessible path, which we will configure in MvcConfig
        return "/static/documents/" + uniqueFilename;
    }
}