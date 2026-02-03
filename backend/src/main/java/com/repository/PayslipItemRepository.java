package com.repository;

import com.model.PayslipItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PayslipItemRepository extends JpaRepository<PayslipItem, Long> {
}