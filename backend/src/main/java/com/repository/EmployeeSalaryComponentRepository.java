package com.repository;

import com.model.EmployeeSalaryComponent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface EmployeeSalaryComponentRepository extends JpaRepository<EmployeeSalaryComponent, Long> {
    List<EmployeeSalaryComponent> findByUserId(Long userId);
    @Transactional
    void deleteByUserIdAndId(Long userId, Long componentId);
}