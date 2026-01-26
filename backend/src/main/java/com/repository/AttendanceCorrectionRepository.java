package com.HRMSbackend.HRMSbackend.repository;

import com.HRMSbackend.HRMSbackend.model.AttendanceCorrection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttendanceCorrectionRepository extends JpaRepository<AttendanceCorrection, Long> {

    List<AttendanceCorrection> findByCompanyIdAndStatusOrderByRequestDateAsc(Long companyId, AttendanceCorrection.CorrectionStatus status);
}