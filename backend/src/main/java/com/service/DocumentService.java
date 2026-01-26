package com.HRMSbackend.HRMSbackend.service;

import com.HRMSbackend.HRMSbackend.DTO.EmployeeDocumentDTO;
import com.HRMSbackend.HRMSbackend.model.Company;
import com.HRMSbackend.HRMSbackend.model.EmployeeDocument;
import com.HRMSbackend.HRMSbackend.model.User;
import com.HRMSbackend.HRMSbackend.repository.EmployeeDocumentRepository;
import com.HRMSbackend.HRMSbackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import static com.HRMSbackend.HRMSbackend.service.AuthService.log;

@Service
public class DocumentService {

    @Autowired
    private EmployeeDocumentRepository documentRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private FileUploadService fileUploadService;

    @Transactional(readOnly = true)
    public List<EmployeeDocumentDTO> getMyDocuments(User currentUser) {
        return documentRepository.findByUserIdOrderByUploadDateDesc(currentUser.getId())
                .stream()
                .map(EmployeeDocumentDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public EmployeeDocumentDTO uploadDocument(String documentType, MultipartFile file, User currentUser) throws IOException {
        String filePath = fileUploadService.saveEmployeeDocument(currentUser.getId(), documentType, file);

        EmployeeDocument doc = new EmployeeDocument();
        doc.setUser(currentUser);
        doc.setCompany(currentUser.getCompany());
        doc.setDocumentType(documentType);
        doc.setFilePath(filePath);
        doc.setStatus(EmployeeDocument.DocumentStatus.PENDING_VERIFICATION);

        EmployeeDocument savedDoc = documentRepository.save(doc);
        return new EmployeeDocumentDTO(savedDoc);
    }

    @Transactional(readOnly = true)
    public List<EmployeeDocumentDTO> getPendingVerificationDocs(User adminUser) {
        Company company = adminUser.getCompany();
        if (company == null) throw new IllegalStateException("Admin is not associated with a company.");

        // MODIFICATION: Use the new repository method
        return documentRepository.findByCompanyIdAndStatusWithUser(company.getId(), EmployeeDocument.DocumentStatus.PENDING_VERIFICATION)
                .stream()
                .map(EmployeeDocumentDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public void verifyDocument(Long documentId, boolean isApproved, String notes, User adminUser) {
        EmployeeDocument doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found."));

        if (adminUser.getRole() != User.Role.SUPER_ADMIN && !doc.getCompany().getId().equals(adminUser.getCompany().getId())) {
            throw new AccessDeniedException("You do not have permission to verify this document.");
        }

        doc.setStatus(isApproved ? EmployeeDocument.DocumentStatus.VERIFIED : EmployeeDocument.DocumentStatus.REJECTED);
        doc.setNotes(notes);
        doc.setVerifier(adminUser);
        doc.setVerificationDate(LocalDateTime.now());
        documentRepository.save(doc);

        updateUserOnboardingStatus(doc.getUser());
    }

    @Transactional
    public void updateUserOnboardingStatus(User user) {
        if (user.getOnboardingStatus() == User.OnboardingStatus.COMPLETED) {
            return; // Already completed, no further action needed.
        }

        // Define which documents are mandatory for KYC
        List<String> requiredDocs = List.of("PASSPORT", "DRIVERS_LICENSE"); // Example list

        List<EmployeeDocument> userDocuments = documentRepository.findByUserIdOrderByUploadDateDesc(user.getId());

        long verifiedRequiredDocsCount = userDocuments.stream()
                .filter(doc -> requiredDocs.contains(doc.getDocumentType()) && doc.getStatus() == EmployeeDocument.DocumentStatus.VERIFIED)
                .map(EmployeeDocument::getDocumentType) // Count distinct document types
                .distinct()
                .count();

        if (verifiedRequiredDocsCount >= requiredDocs.size()) {
            user.setOnboardingStatus(User.OnboardingStatus.PENDING_VERIFICATION);
            userRepository.save(user);
            log.info("User {} has submitted all required documents. Onboarding status updated to PENDING_VERIFICATION.", user.getUsername());
        } else {
            // If they are not yet completed, ensure they are in PENDING_DOCUMENTS
            user.setOnboardingStatus(User.OnboardingStatus.PENDING_DOCUMENTS);
            userRepository.save(user);
        }
    }
}