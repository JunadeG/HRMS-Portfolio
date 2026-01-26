package com.HRMSbackend.HRMSbackend.controller;

import com.HRMSbackend.HRMSbackend.model.User;
import com.HRMSbackend.HRMSbackend.service.DocumentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    @Autowired
    private DocumentService documentService;

    @GetMapping("/my-documents")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getMyDocuments(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(documentService.getMyDocuments(currentUser));
    }

    @PostMapping("/upload")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> uploadDocument(@RequestParam("documentType") String documentType,
                                            @RequestParam("file") MultipartFile file,
                                            @AuthenticationPrincipal User currentUser) {
        try {
            return ResponseEntity.status(201).body(documentService.uploadDocument(documentType, file, currentUser));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/admin/pending")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> getPendingDocuments(@AuthenticationPrincipal User adminUser) {
        return ResponseEntity.ok(documentService.getPendingVerificationDocs(adminUser));
    }

    @PostMapping("/admin/{documentId}/verify")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> verifyDocument(@PathVariable Long documentId,
                                            @RequestBody Map<String, Object> payload,
                                            @AuthenticationPrincipal User adminUser) {
        try {
            boolean isApproved = (Boolean) payload.get("isApproved");
            String notes = (String) payload.get("notes");
            documentService.verifyDocument(documentId, isApproved, notes, adminUser);
            return ResponseEntity.ok(Map.of("message", "Document status updated successfully."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}