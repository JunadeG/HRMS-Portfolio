package com.service;

import com.DTO.*;
import com.model.*;
import com.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PayrollService {

    private static final Logger log = LoggerFactory.getLogger(PayrollService.class);

    private final DepartmentSalaryStructureRepository structureRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final SalaryComponentRepository salaryComponentRepository;
    private final EmployeeSalaryComponentRepository employeeSalaryComponentRepository;
    private final PayslipRepository payslipRepository;
    private final PayslipItemRepository payslipItemRepository;

    @Autowired
    public PayrollService(DepartmentSalaryStructureRepository structureRepository,
                          DepartmentRepository departmentRepository,
                          UserRepository userRepository,
                          SalaryComponentRepository salaryComponentRepository,
                          EmployeeSalaryComponentRepository employeeSalaryComponentRepository,
                          PayslipRepository payslipRepository,
                          PayslipItemRepository payslipItemRepository) {
        this.structureRepository = structureRepository;
        this.departmentRepository = departmentRepository;
        this.userRepository = userRepository;
        this.salaryComponentRepository = salaryComponentRepository;
        this.employeeSalaryComponentRepository = employeeSalaryComponentRepository;
        this.payslipRepository = payslipRepository;
        this.payslipItemRepository = payslipItemRepository;
    }

    // --- Salary Component & Structure Methods ---

    @Transactional
    public SalaryComponent createSalaryComponent(SalaryComponent component, User adminUser) {
        Company adminCompany = getAdminCompanyContext(adminUser);
        component.setCompany(adminCompany);
        return salaryComponentRepository.save(component);
    }

    @Transactional(readOnly = true)
    public List<SalaryComponent> getSalaryComponentsByCompany(User adminUser) {
        Company adminCompany = getAdminCompanyContext(adminUser);
        return salaryComponentRepository.findByCompanyIdOrderByNameAsc(adminCompany.getId());
    }

    @Transactional
    public void deleteSalaryComponent(Long componentId, User adminUser) {
        SalaryComponent component = salaryComponentRepository.findById(componentId)
                .orElseThrow(() -> new IllegalArgumentException("Salary Component not found with ID: " + componentId));
        checkAdminCompanyPermission(adminUser, component.getCompany().getId(), "delete salary component");
        salaryComponentRepository.delete(component);
    }

    @Transactional(readOnly = true)
    public List<EmployeeSalaryComponent> getEmployeeSalaryComponents(Long userId, User adminUser) {
        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));
        checkAdminCompanyPermission(adminUser, targetUser.getCompany().getId(), "view employee components");
        return employeeSalaryComponentRepository.findByUserId(userId);
    }

    @Transactional
    public EmployeeSalaryComponent assignComponentToEmployee(Long userId, Long componentId, BigDecimal value, User adminUser) {
        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));
        checkAdminCompanyPermission(adminUser, targetUser.getCompany().getId(), "assign component");

        SalaryComponent component = salaryComponentRepository.findById(componentId)
                .orElseThrow(() -> new IllegalArgumentException("Salary Component not found with ID: " + componentId));
        checkAdminCompanyPermission(adminUser, component.getCompany().getId(), "use component");

        EmployeeSalaryComponent newAssignment = new EmployeeSalaryComponent();
        newAssignment.setUser(targetUser);
        newAssignment.setSalaryComponent(component);
        newAssignment.setValue(value);

        return employeeSalaryComponentRepository.save(newAssignment);
    }

    @Transactional
    public void removeComponentFromEmployee(Long employeeComponentId, User adminUser) {
        EmployeeSalaryComponent assignment = employeeSalaryComponentRepository.findById(employeeComponentId)
                .orElseThrow(() -> new IllegalArgumentException("Assigned component not found with ID: " + employeeComponentId));
        checkAdminCompanyPermission(adminUser, assignment.getUser().getCompany().getId(), "remove component");
        employeeSalaryComponentRepository.delete(assignment);
    }

    @Transactional
    public DepartmentSalaryStructureDTO saveDepartmentSalaryStructure(DepartmentSalaryStructureDTO dto, User adminUser) {
        Company adminCompany = getAdminCompanyContext(adminUser);
        Department department = getDepartment(dto.getDepartmentId());
        String currency = dto.getCurrency().trim().toUpperCase();
        if (currency.length() != 3) {
            throw new IllegalArgumentException("Currency code must be 3 letters.");
        }
        Optional<DepartmentSalaryStructure> existingStructureOpt = structureRepository
                .findByDepartmentIdAndCompanyIdAndCurrency(department.getId(), adminCompany.getId(), currency);
        DepartmentSalaryStructure structure = existingStructureOpt.orElseGet(DepartmentSalaryStructure::new);
        if (structure.getId() == null) {
            structure.setDepartment(department);
            structure.setCompany(adminCompany);
            structure.setCurrency(currency);
        }
        structure.setDefaultBaseSalary(dto.getDefaultBaseSalary());
        DepartmentSalaryStructure savedStructure = structureRepository.save(structure);
        return convertToStructureDTOWithNames(savedStructure);
    }

    @Transactional(readOnly = true)
    public List<DepartmentSalaryStructureDTO> getDepartmentSalaryStructuresByCompany(User adminUser) {
        Company adminCompany = getAdminCompanyContext(adminUser);
        List<DepartmentSalaryStructure> structures = (adminUser.getRole() == User.Role.SUPER_ADMIN)
                ? structureRepository.findAll()
                : structureRepository.findByCompanyIdOrderByDepartmentNameAsc(adminCompany.getId());
        return structures.stream()
                .map(this::convertToStructureDTOWithNames)
                .collect(Collectors.toList());
    }

    // THIS IS THE METHOD THAT WAS MISSING
    @Transactional(readOnly = true)
    public DepartmentSalaryStructureDTO getDepartmentSalaryStructureDTO(Long structureId, User adminUser) {
        DepartmentSalaryStructure structure = structureRepository.findById(structureId)
                .orElseThrow(() -> new IllegalArgumentException("Salary structure not found with ID: " + structureId));
        checkAdminCompanyPermission(adminUser, structure.getCompany().getId(), "view salary structure");
        return convertToStructureDTOWithNames(structure);
    }

    @Transactional
    public void deleteDepartmentSalaryStructure(Long structureId, User adminUser) {
        DepartmentSalaryStructure structure = structureRepository.findById(structureId)
                .orElseThrow(() -> new IllegalArgumentException("Salary structure not found with ID: " + structureId));
        checkAdminCompanyPermission(adminUser, structure.getCompany().getId(), "delete");
        structureRepository.deleteById(structureId);
    }

    @Transactional
    public User updateUserPayrollDetails(Long targetUserId, UserPayrollUpdateDTO salaryDTO, User adminUser) {
        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + targetUserId));
        checkAdminCompanyPermission(adminUser, targetUser.getCompany().getId(), "update payroll for");
        if (targetUser.getRole() != User.Role.USER && adminUser.getRole() != User.Role.SUPER_ADMIN) {
            throw new SecurityException("You can only update payroll details for employee users.");
        }
        String currency = salaryDTO.getCurrency();
        if (!StringUtils.hasText(currency) || currency.trim().length() != 3) {
            throw new IllegalArgumentException("Currency code must be exactly 3 letters.");
        }
        targetUser.setCurrency(currency.trim().toUpperCase());
        targetUser.setBaseSalary(salaryDTO.getBaseSalary());
        targetUser.setBankName(StringUtils.hasText(salaryDTO.getBankName()) ? salaryDTO.getBankName().trim() : null);
        targetUser.setBankAccountNumber(StringUtils.hasText(salaryDTO.getBankAccountNumber()) ? salaryDTO.getBankAccountNumber().trim() : null);
        targetUser.setBankIfscCode(StringUtils.hasText(salaryDTO.getBankIfscCode()) ? salaryDTO.getBankIfscCode().trim() : null);
        return userRepository.save(targetUser);
    }

    @Transactional(readOnly = true)
    public List<CalculatedPayrollItemDTO> calculateGrossPayrollPreview(User adminUser) {
        Company adminCompanyContext = getAdminCompanyContext(adminUser);
        List<User> usersToProcess = userRepository.findByCompanyIdAndStatus(adminCompanyContext.getId(), User.UserStatus.APPROVED);
        List<DepartmentSalaryStructure> relevantStructures = structureRepository.findByCompanyIdOrderByDepartmentNameAsc(adminCompanyContext.getId());
        var structureLookup = relevantStructures.stream()
                .filter(struct -> struct.getDepartment() != null && struct.getCompany() != null)
                .collect(Collectors.groupingBy(struct -> struct.getDepartment().getId(),
                        Collectors.groupingBy(struct -> struct.getCompany().getId(),
                                Collectors.toMap(DepartmentSalaryStructure::getCurrency, struct -> struct))));
        List<CalculatedPayrollItemDTO> payrollPreview = new ArrayList<>();
        for (User user : usersToProcess) {
            if (user.getCompany() == null || user.getStatus() != User.UserStatus.APPROVED) continue;
            CalculatedPayrollItemDTO payrollItem = new CalculatedPayrollItemDTO();
            payrollItem.setUserId(user.getId());
            payrollItem.setUsername(user.getUsername());
            payrollItem.setFullName(String.format("%s %s", user.getFirstName(), user.getLastName()).trim());
            payrollItem.setDepartment(user.getDepartment() != null ? user.getDepartment().getName() : "Unassigned");
            String notes = "";
            BigDecimal grossPay = BigDecimal.ZERO;
            String currency = "???";

            if (user.getBaseSalary() != null && StringUtils.hasText(user.getCurrency())) {
                grossPay = user.getBaseSalary();
                currency = user.getCurrency().toUpperCase();
                notes = "Based on Individual Salary";
            } else if (user.getDepartment() != null && user.getDepartment().getId() != null) {
                var deptStructures = structureLookup.get(user.getDepartment().getId());
                if (deptStructures != null && deptStructures.containsKey(user.getCompany().getId())) {
                    var companyStructures = deptStructures.get(user.getCompany().getId());
                    if (!companyStructures.isEmpty()) {
                        DepartmentSalaryStructure defaultStructure = companyStructures.values().iterator().next();
                        grossPay = defaultStructure.getDefaultBaseSalary();
                        currency = defaultStructure.getCurrency();
                        notes = "Based on Department Default";
                    } else { notes = "No Dept Structure Configured"; }
                } else { notes = "Department Structure Missing"; }
            } else { notes = "No Salary Info"; }

            payrollItem.setCalculatedGrossPay(grossPay.setScale(2, RoundingMode.HALF_UP));
            payrollItem.setCurrency(StringUtils.hasText(currency) ? currency : "???");
            payrollItem.setNotes(notes);
            payrollPreview.add(payrollItem);
        }
        payrollPreview.sort(Comparator.comparing(CalculatedPayrollItemDTO::getDepartment).thenComparing(CalculatedPayrollItemDTO::getUsername));
        return payrollPreview;
    }

    // --- All other methods (Component and Structure Management) remain the same ---
    // ...
    // --- Payslip Generation and Viewing ---

    @Transactional
    public void generatePayslipsForCompany(LocalDate payPeriod, User adminUser) {
        Company company = getAdminCompanyContext(adminUser);
        List<User> employees = userRepository.findByCompanyIdAndStatus(company.getId(), User.UserStatus.APPROVED);
        for (User employee : employees) {
            generatePayslipForUser(employee, payPeriod);
        }
        log.info("Finished payslip generation process for company {}", company.getName());
    }

    private void generatePayslipForUser(User user, LocalDate payPeriod) {
        LocalDate periodStart = payPeriod.withDayOfMonth(1);
        LocalDate periodEnd = payPeriod.withDayOfMonth(payPeriod.lengthOfMonth());

        if (payslipRepository.findByUserIdAndPayPeriodStartAndPayPeriodEnd(user.getId(), periodStart, periodEnd).isPresent()) {
            log.warn("Payslip for user {} for period {} already exists. Skipping.", user.getUsername(), periodStart);
            return;
        }

        BigDecimal baseSalary = user.getBaseSalary() != null ? user.getBaseSalary() : BigDecimal.ZERO;
        if (baseSalary.compareTo(BigDecimal.ZERO) <= 0) {
            log.warn("Skipping payslip for user {} due to zero or missing base salary.", user.getUsername());
            return;
        }

        List<PayslipItem> items = new ArrayList<>();
        BigDecimal totalAllowances = BigDecimal.ZERO;
        BigDecimal totalDeductions = BigDecimal.ZERO;

        // Step 1: Add Base Salary as the first allowance item and add to the total allowances
        items.add(createPayslipItem(null, "Base Salary", SalaryComponent.ComponentType.ALLOWANCE, baseSalary));
        totalAllowances = totalAllowances.add(baseSalary);

        // Step 2: Fetch and correctly process all assigned salary components
        List<EmployeeSalaryComponent> components = employeeSalaryComponentRepository.findByUserId(user.getId());
        for (EmployeeSalaryComponent comp : components) {
            BigDecimal componentAmount = calculateComponentAmount(comp, baseSalary);
            SalaryComponent.ComponentType type = comp.getSalaryComponent().getType();

            items.add(createPayslipItem(null, comp.getSalaryComponent().getName(), type, componentAmount));

            if (type == SalaryComponent.ComponentType.ALLOWANCE) {
                totalAllowances = totalAllowances.add(componentAmount);
            } else if (type == SalaryComponent.ComponentType.DEDUCTION) {
                totalDeductions = totalDeductions.add(componentAmount);
            }
        }

        BigDecimal netSalary = totalAllowances.subtract(totalDeductions);

        Payslip payslip = new Payslip();
        payslip.setUser(user);
        payslip.setPayPeriodStart(periodStart);
        payslip.setPayPeriodEnd(periodEnd);
        payslip.setGenerationDate(LocalDate.now());
        payslip.setGrossSalary(totalAllowances.setScale(2, RoundingMode.HALF_UP));
        payslip.setTotalDeductions(totalDeductions.setScale(2, RoundingMode.HALF_UP));
        payslip.setNetSalary(netSalary.setScale(2, RoundingMode.HALF_UP));

        Payslip savedPayslip = payslipRepository.save(payslip);

        // Link items to the saved payslip and save them
        items.forEach(item -> item.setPayslip(savedPayslip));
        payslipItemRepository.saveAll(items);

        log.info("Generated payslip for user {} for period {}. Gross: {}, Deductions: {}, Net: {}",
                user.getUsername(), periodStart, payslip.getGrossSalary(), payslip.getTotalDeductions(), payslip.getNetSalary());
    }

    // CRITICAL FIX: The logic in this method is now correct.
    private BigDecimal calculateComponentAmount(EmployeeSalaryComponent comp, BigDecimal baseSalary) {
        // If the component has a 'percentageOf' value, it's a percentage calculation.
        if (StringUtils.hasText(comp.getSalaryComponent().getPercentageOf())) {
            BigDecimal percentage = comp.getValue() != null ? comp.getValue() : BigDecimal.ZERO;
            // The return statement MUST be inside the if block.
            return baseSalary.multiply(percentage.divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP));
        }
        // Otherwise, it's a fixed amount, so just return its value.
        return comp.getValue() != null ? comp.getValue() : BigDecimal.ZERO;
    }

    private PayslipItem createPayslipItem(Payslip payslip, String name, SalaryComponent.ComponentType type, BigDecimal amount) {
        PayslipItem item = new PayslipItem();
        item.setPayslip(payslip);
        item.setComponentName(name);
        item.setType(type);
        item.setAmount(amount.setScale(2, RoundingMode.HALF_UP));
        return item;
    }

    @Transactional(readOnly = true)
    public List<PayslipDTO> getPayslipsForUser(User user, int year, int month) {
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
        return payslipRepository.findByUserIdAndPayPeriodStartBetweenOrderByPayPeriodStartDesc(user.getId(), startDate, endDate)
                .stream()
                .map(this::convertToPayslipSummaryDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PayslipDTO getPayslipDetails(Long payslipId, User user) {
        Payslip payslip = payslipRepository.findById(payslipId)
                .orElseThrow(() -> new IllegalArgumentException("Payslip not found"));
        if (user.getRole() == User.Role.USER && !payslip.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You do not have permission to view this payslip.");
        } else if (user.getRole() != User.Role.USER) {
            checkAdminCompanyPermission(user, payslip.getUser().getCompany().getId(), "view payslip");
        }
        return convertToPayslipDetailDTO(payslip);
    }

    // All helper methods (convertToPayslipSummaryDTO, getAdminCompanyContext, etc.) remain the same
    private PayslipDTO convertToPayslipSummaryDTO(Payslip payslip) {
        PayslipDTO dto = new PayslipDTO();
        dto.setId(payslip.getId());
        dto.setPayPeriodStart(payslip.getPayPeriodStart());
        dto.setPayPeriodEnd(payslip.getPayPeriodEnd());
        dto.setNetSalary(payslip.getNetSalary());
        return dto;
    }

    private PayslipDTO convertToPayslipDetailDTO(Payslip payslip) {
        PayslipDTO dto = convertToPayslipSummaryDTO(payslip);
        dto.setUserId(payslip.getUser().getId());
        dto.setUserName(payslip.getUser().getUsername());
        dto.setUserFullName(payslip.getUser().getFirstName() + " " + payslip.getUser().getLastName());
        if (payslip.getUser().getDepartment() != null) {
            dto.setDepartmentName(payslip.getUser().getDepartment().getName());
        }
        dto.setGenerationDate(payslip.getGenerationDate());
        dto.setGrossSalary(payslip.getGrossSalary());
        dto.setTotalDeductions(payslip.getTotalDeductions());
        dto.setItems(payslip.getItems().stream().map(item -> {
            PayslipItemDTO itemDto = new PayslipItemDTO();
            itemDto.setComponentName(item.getComponentName());
            itemDto.setType(item.getType());
            itemDto.setAmount(item.getAmount());
            return itemDto;
        }).collect(Collectors.toList()));
        return dto;
    }

    private Company getAdminCompanyContext(User adminUser) {
        if (adminUser.getRole() == User.Role.ADMIN && adminUser.getCompany() == null) {
            throw new IllegalStateException("Your administrator account is not associated with a company.");
        }
        return adminUser.getCompany();
    }

    private Department getDepartment(Long departmentId) {
        return departmentRepository.findById(departmentId)
                .orElseThrow(() -> new IllegalArgumentException("Department not found with ID: " + departmentId));
    }

    private void checkAdminCompanyPermission(User adminUser, Long targetCompanyId, String action) {
        if (adminUser.getRole() == User.Role.SUPER_ADMIN) return;
        if (adminUser.getCompany() == null || !adminUser.getCompany().getId().equals(targetCompanyId)) {
            throw new AccessDeniedException("Admin does not have permission to " + action + " for this company.");
        }
    }

    private DepartmentSalaryStructureDTO convertToStructureDTOWithNames(DepartmentSalaryStructure structure) {
        DepartmentSalaryStructureDTO dto = new DepartmentSalaryStructureDTO();
        dto.setId(structure.getId());
        dto.setDepartmentId(structure.getDepartment().getId());
        dto.setDepartmentName(structure.getDepartment().getName());
        dto.setCompanyName(structure.getCompany().getName());
        dto.setDefaultBaseSalary(structure.getDefaultBaseSalary());
        dto.setCurrency(structure.getCurrency());
        return dto;
    }
}
