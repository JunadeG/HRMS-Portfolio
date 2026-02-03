package com.repository;

import com.model.DepartmentSalaryStructure;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DepartmentSalaryStructureRepository extends JpaRepository<DepartmentSalaryStructure, Long> {

    // Find structures for a specific company, ordered by department name
    // Assuming Department entity has a 'name' property and it can be accessed implicitly by JPA
    List<DepartmentSalaryStructure> findByCompanyIdOrderByDepartmentNameAsc(Long companyId);

    // Find a specific structure by department, company, and currency
    Optional<DepartmentSalaryStructure> findByDepartmentIdAndCompanyIdAndCurrency(Long departmentId, Long companyId, String currency);

    // Find by department and company (might return multiple if you add more currencies/structures later for the same dept/company)
    List<DepartmentSalaryStructure> findByDepartmentIdAndCompanyId(Long departmentId, Long companyId);

    // Note: If you encounter issues with 'OrderByDepartmentNameAsc', it might be because
    // JPA cannot implicitly join to Department and order by its name easily in the background.
    // In that case, you might need a custom JPQL query or handle sorting in the service layer.
    // List<DepartmentSalaryStructure> findByCompanyId(@Param("companyId") Long companyId, Sort sort); // Then sort in service or use query
    // @Query("SELECT s FROM DepartmentSalaryStructure s JOIN FETCH s.department d WHERE s.company.id = :companyId ORDER BY d.name ASC")
    // List<DepartmentSalaryStructure> findByCompanyIdWithDepartmentName(@Param("companyId") Long companyId);


}