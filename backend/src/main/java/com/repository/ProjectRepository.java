package com.repository;

import com.model.Project;
import com.model.ProjectStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByCompanyIdAndStatusOrderByNameAsc(Long companyId, ProjectStatus status);
}