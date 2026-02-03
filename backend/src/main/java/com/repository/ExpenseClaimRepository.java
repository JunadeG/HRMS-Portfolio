package com.repository;

import com.model.ExpenseClaim;
import com.model.ExpenseClaimStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExpenseClaimRepository extends JpaRepository<ExpenseClaim, Long> {
    List<ExpenseClaim> findByUserIdOrderBySubmissionDateDesc(Long userId);
    List<ExpenseClaim> findByCompanyIdAndStatusOrderBySubmissionDateAsc(Long companyId, ExpenseClaimStatus status);
}