package com.repository;

import com.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.model.User.Role;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

        // This query is simplified. Because manager relationships are now EAGER,
        // we don't need to explicitly fetch them here anymore.
        // This is still useful for fetching the base entity with other potential joins if needed later.
        @Query("SELECT u FROM User u " +
                "LEFT JOIN FETCH u.company " +
                "LEFT JOIN FETCH u.department " +
                "WHERE u.id = :id")
        Optional<User> findByIdWithDetails(@Param("id") Long id);

        // This is the standard JPA query method. It will now automatically
        // fetch the manager details for each user in the list due to the EAGER setting.
        List<User> findByReportingManagerId(Long managerId);



        @Query(value = "SELECT * FROM users u WHERE u.company_id = :companyId " +
                "AND u.status = 'APPROVED' AND u.id != :currentUserId AND u.date_of_birth IS NOT NULL AND " +
                "EXTRACT(DOY FROM u.date_of_birth) BETWEEN :startDoy AND :endDoy", nativeQuery = true)
        List<User> findUpcomingBirthdays(
                @Param("companyId") Long companyId,
                @Param("currentUserId") Long currentUserId,
                @Param("startDoy") int startDoy,
                @Param("endDoy") int endDoy
        );

        List<User> findByCompanyIdAndDepartmentIdIn(Long companyId, Collection<Long> departmentIds);

        long countByCompanyIdAndStatus(Long companyId, User.UserStatus status);

        List<User> findByCompanyIdAndStatusIn(Long companyId, List<User.UserStatus> statuses);

        List<User> findByCompanyId(Long companyId);

        @Query("SELECT u FROM User u WHERE LOWER(u.username) = LOWER(:username)")
        Optional<User> findByUsername(String username);

        boolean existsByUsername(String username);

        @Query("SELECT u FROM User u WHERE LOWER(u.username) = LOWER(:username) AND u.company.id = :companyId")
        Optional<User> findByUsernameAndCompanyId(String username, Long companyId);

        List<User> findByStatus(User.UserStatus status);

        List<User> findByCompanyIdAndStatus(Long companyId, User.UserStatus status);

        User findByResetToken(String resetToken);

        boolean existsByEmployeeId(String employeeId);

        List<User> findByStatusAndEmployeeIdIsNullOrEmployeeIdIs(User.UserStatus status, String emptyString);

        List<User> findByStatusAndWorkEmailIsNullOrWorkEmailIs(User.UserStatus status, String emptyString);

        Optional<User> findFirstByRoleOrderByIdAsc(User.Role role);

        Optional<User> findFirstByCompanyIdAndRoleOrderByIdAsc(Long companyId, User.Role role);

        List<User> findByCompanyIdAndRoleIn(Long companyId, List<Role> roles);

        @Query("SELECT u FROM User u WHERE u.company.id = :companyId AND u.status = 'APPROVED' AND " +
                "LOWER(CONCAT(u.firstName, ' ', u.lastName)) LIKE LOWER(CONCAT('%', :query, '%'))")
        List<User> searchApprovedUsersInCompany(@Param("companyId") Long companyId, @Param("query") String query);
}