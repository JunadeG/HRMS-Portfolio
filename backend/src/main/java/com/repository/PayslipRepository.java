package com.HRMSbackend.HRMSbackend.repository;

import com.HRMSbackend.HRMSbackend.model.Payslip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PayslipRepository extends JpaRepository<Payslip, Long> {

    // This method is used to prevent duplicate payslips from being generated.
    Optional<Payslip> findByUserIdAndPayPeriodStartAndPayPeriodEnd(Long userId, LocalDate start, LocalDate end);

    // This is the new method that was missing. It allows fetching payslips for a specific month.
    List<Payslip> findByUserIdAndPayPeriodStartBetweenOrderByPayPeriodStartDesc(Long userId, LocalDate startDate, LocalDate endDate);

}