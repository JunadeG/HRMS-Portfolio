
package com.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class MvcConfig implements WebMvcConfigurer {

    private static final Logger log = LoggerFactory.getLogger(MvcConfig.class);

    @Value("${upload.dir.profile-pics}")
    private String profilePicUploadDir;
    @Value("${upload.dir.expense-receipts}")
    private String expenseReceiptUploadDir;

    @Value("${upload.dir.documents}")
    private String documentsUploadDir;

    @Override
    public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
        log.info("Attempting to configure resource handlers...");
        // Use the helper to expose the directory specified in properties
        exposeDirectory("static/profile-pics", profilePicUploadDir, registry);
        exposeDirectory("static/expense-receipts", expenseReceiptUploadDir, registry);
        exposeDirectory("static/documents", documentsUploadDir, registry);
        log.info("Finished configuring resource handlers.");
    }

    private void exposeDirectory(String urlPathFragment, String physicalPath, ResourceHandlerRegistry registry) {
        try {
            Path dirPath = Paths.get(physicalPath).toAbsolutePath();
            String locationUri = dirPath.toUri().toString();

            // Ensure the directory exists
            if (!Files.exists(dirPath)) {
                log.warn("Directory does not exist for path '{}', attempting to create: {}", urlPathFragment, dirPath);
                try {
                    Files.createDirectories(dirPath);
                    log.info("Successfully created directory: {}", dirPath);
                } catch (IOException ioException) {
                    log.error("FATAL: Could not create upload directory for '{}': {}. Check permissions.", urlPathFragment, dirPath, ioException);
                    return; // Stop if directory cannot be created
                }
            } else {
                // Double-check writability (optional, can be slow)
                if (!Files.isWritable(dirPath)) {
                    log.error("FATAL: Upload directory exists but is not writable: {}", dirPath);
                    // return; // Or throw exception
                } else {
                    log.info("Directory found and appears writable for path '{}': {}", urlPathFragment, dirPath);
                }
            }

            String handlerPath = "/" + urlPathFragment + "/**";
            log.info("Mapping URL path '{}' to physical location '{}'", handlerPath, locationUri);

            // Crucial: locationUri must end with "/" for directory mapping
            if (!locationUri.endsWith("/")) {
                locationUri += "/";
            }

            registry.addResourceHandler(handlerPath)
                    .addResourceLocations(locationUri);

            log.info("Successfully added resource handler for '{}'", handlerPath);

        } catch (Exception e) {
            log.error("Error during exposeDirectory for urlPathFragment '{}' and physicalPath '{}': {}", urlPathFragment, physicalPath, e.getMessage(), e);
        }
    }
}