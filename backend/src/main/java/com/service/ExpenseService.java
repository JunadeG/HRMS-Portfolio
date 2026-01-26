package com.HRMSbackend.HRMSbackend.service;

import com.HRMSbackend.HRMSbackend.model.ExpenseClaim;
import com.HRMSbackend.HRMSbackend.model.ExpenseClaimStatus;
import com.HRMSbackend.HRMSbackend.model.User;
import com.HRMSbackend.HRMSbackend.repository.ExpenseClaimRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class ExpenseService {

    private final ExpenseClaimRepository expenseClaimRepository;
    private final FileUploadService fileUploadService;

    public ExpenseService(ExpenseClaimRepository expenseClaimRepository, FileUploadService fileUploadService) {
        this.expenseClaimRepository = expenseClaimRepository;
        this.fileUploadService = fileUploadService;
    }

    @Transactional
    public ExpenseClaim submitClaim(User user, String purpose, BigDecimal amount, MultipartFile receipt) throws IOException {
        String receiptPath = null;
        if (receipt != null && !receipt.isEmpty()) {
            receiptPath = fileUploadService.saveExpenseReceipt(user.getId(), receipt);
        }

        ExpenseClaim claim = new ExpenseClaim();
        claim.setUser(user);
        claim.setCompany(user.getCompany());
        claim.setPurpose(purpose);
        claim.setAmount(amount);
        claim.setSubmissionDate(LocalDate.now());
        claim.setStatus(ExpenseClaimStatus.PENDING);
        claim.setReceiptPath(receiptPath);

        return expenseClaimRepository.save(claim);
    }

    public List<ExpenseClaim> getMyClaims(User user) {
        return expenseClaimRepository.findByUserIdOrderBySubmissionDateDesc(user.getId());
    }

    public List<ExpenseClaim> getPendingClaimsForAdmin(User adminUser) {
        return expenseClaimRepository.findByCompanyIdAndStatusOrderBySubmissionDateAsc(adminUser.getCompany().getId(), ExpenseClaimStatus.PENDING);
    }

    @Transactional
    public ExpenseClaim approveClaim(Long claimId, User adminUser) {
        ExpenseClaim claim = findAndCheckPermission(claimId, adminUser);
        if (claim.getStatus() != ExpenseClaimStatus.PENDING) throw new IllegalStateException("Claim is not pending.");
        claim.setStatus(ExpenseClaimStatus.APPROVED);
        claim.setApprover(adminUser);
        claim.setApprovalDate(LocalDate.now());
        return expenseClaimRepository.save(claim);
    }

    @Transactional
    public ExpenseClaim rejectClaim(Long claimId, User adminUser) {
        ExpenseClaim claim = findAndCheckPermission(claimId, adminUser);
        if (claim.getStatus() != ExpenseClaimStatus.PENDING) throw new IllegalStateException("Claim is not pending.");
        claim.setStatus(ExpenseClaimStatus.REJECTED);
        claim.setApprover(adminUser);
        claim.setApprovalDate(LocalDate.now());
        return expenseClaimRepository.save(claim);
    }

    private ExpenseClaim findAndCheckPermission(Long claimId, User adminUser) {
        ExpenseClaim claim = expenseClaimRepository.findById(claimId).orElseThrow(() -> new IllegalArgumentException("Claim not found"));
        if (adminUser.getRole() == User.Role.SUPER_ADMIN) return claim;
        if (!claim.getCompany().getId().equals(adminUser.getCompany().getId())) {
            throw new AccessDeniedException("Permission denied for this company's claim.");
        }
        return claim;
    }
}