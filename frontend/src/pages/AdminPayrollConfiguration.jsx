// src/pages/AdminPayrollConfigurationPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components'; // Ensure styled-components is imported
import {
    fetchDepartments,
    fetchDepartmentStructures,
    saveDepartmentStructure,
    deleteDepartmentStructure,
    calculatePayrollPreview,
    generatePayslipsForMonth
} from '../services/apiService';

// --- Styled Components (Adopted from other Admin pages) ---
const PayrollConfigContainer = styled.div`
  padding: 30px;
  max-width: 1200px;
  margin: 20px auto;
  background-color: var(--background-secondary);
  color: var(--text-primary);
  border-radius: 8px;
  box-shadow: 0 2px 10px var(--shadow-color);
  border: 1px solid var(--border-primary);
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
`;
const PageTitle = styled.h2`
    color: var(--text-primary);
    margin-bottom: 25px;
    border-bottom: 2px solid var(--text-accent);
    padding-bottom: 10px;
    display: inline-block;
`;
const SectionTitle = styled.h3`
    margin-top: 30px;
    margin-bottom: 15px;
    color: var(--text-accent);
    border-bottom: 1px solid var(--border-secondary);
    padding-bottom: 8px;
`;
const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
  font-size: 0.9em;
  th, td {
    border: 1px solid var(--border-primary); padding: 10px 12px; text-align: left; vertical-align: middle;
    white-space: nowrap;
  }
  th {
    background-color: var(--background-tertiary); color: var(--text-secondary); font-weight: 600;
    position: sticky; top: 0; z-index: 1;
  }
  tbody tr:nth-child(even) { background-color: var(--background-tertiary); opacity: 0.95; }
  tbody tr:hover { background-color: var(--background-hover); }
  button {
    padding: 5px 10px; margin: 0 4px; cursor: pointer; border: none; border-radius: 4px;
    font-size: 0.9em; transition: background-color 0.2s, opacity 0.2s; color: white;
  }
  button:disabled { opacity: 0.6; cursor: not-allowed; }
  .edit-btn { background-color: #ffc107; color: #333; &:hover:not(:disabled) { background-color: #e0a800; } }
  .delete-btn { background-color: #dc3545; &:hover:not(:disabled) { background-color: #c82333; } }
  .actions-cell { text-align: center; min-width: 140px; }
`;

const StructureForm = styled.form`
  margin-bottom: 30px; padding: 20px; border: 1px solid var(--border-primary); border-radius: 8px;
  background-color: var(--background-tertiary);
`;

const FormGroup = styled.div`
   display: flex; flex-direction: column; margin-bottom: 15px;
    label { margin-bottom: 5px; font-weight: 600; font-size: 0.9em; color: var(--text-secondary); }
    input, select {
          padding: 9px 12px; border: 1px solid var(--border-primary); border-radius: 4px;
          font-size: 1em; background-color: var(--background-secondary); color: var(--text-primary);
          &:focus { outline: none; border-color: var(--border-accent); }
          &:disabled { background-color: var(--background-tertiary); opacity: 0.7; }
    }
`;

// --- ADDED DEFINITIONS FOR MISSING STYLED COMPONENTS ---
const ActionButton = styled.button`
    margin-bottom: 20px; padding: 8px 15px; cursor: pointer;
    background-color: var(--background-tertiary); color: var(--text-secondary);
    border: 1px solid var(--border-primary); border-radius: 4px; font-weight: 500;
    transition: background-color 0.2s ease, color 0.2s ease;
    &:hover { background-color: var(--background-hover); color: var(--text-primary); }
    &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const Label = styled.label` // Already defined in FormGroup, but explicitly here for clarity if used outside
  margin-bottom: 5px; font-weight: 600; font-size: 0.9em; color: var(--text-secondary);
`;

const Input = styled.input` // General Input if needed outside FormGroup
  padding: 9px 12px; border: 1px solid var(--border-primary); border-radius: 4px;
  font-size: 1em; background-color: var(--background-secondary); color: var(--text-primary);
  &:focus { outline: none; border-color: var(--border-accent); }
  &:disabled { background-color: var(--background-tertiary); opacity: 0.7; }
`;

const Select = styled.select` // General Select if needed outside FormGroup
  padding: 9px 12px; border: 1px solid var(--border-primary); border-radius: 4px;
  font-size: 1em; background-color: var(--background-secondary); color: var(--text-primary);
  &:focus { outline: none; border-color: var(--border-accent); }
  &:disabled { background-color: var(--background-tertiary); opacity: 0.7; }
`;
// --- END ADDED DEFINITIONS ---

const Button = styled.button` // Generic button for form actions if needed
  padding: 10px 18px; background-color: var(--text-accent); color: var(--text-on-accent);
  border: none; border-radius: 5px; cursor: pointer; font-size: 1em; font-weight: 500;
  align-self: flex-start;
  transition: background-color 0.2s, opacity 0.2s;
  &:hover:not(:disabled) { background-color: color-mix(in srgb, var(--text-accent) 85%, black); }
  &:disabled { background-color: var(--text-muted); opacity: 0.6; cursor: not-allowed; }
`;


const PayrollActionButton = styled.button` // Specific button for "Calculate Preview"
    padding: 12px 25px; background-color: #007bff; color: white; border: none; border-radius: 5px;
    cursor: pointer; font-size: 1em; font-weight: 500; display: block; margin: 20px auto;
    transition: background-color 0.2s, opacity 0.2s;
    &:hover:not(:disabled) { background-color: #0056b3; }
    &:disabled { background-color: #cccccc; opacity: 0.6; cursor: not-allowed; }
`;

const LoadingMsg = styled.p` color: var(--text-muted); font-style: italic; text-align: center; padding: 15px; `;
// ErrorDisplay and SuccessDisplay will use .message-display classes from themes.css
const InfoDisplay = styled.p`
  font-size: 0.9em;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid var(--border-secondary);
  background-color: var(--background-tertiary);
`;

const DEFAULT_CURRENCY = 'USD';

const AdminPayrollConfigurationPage = ({ userRole }) => {
    const [structures, setStructures] = useState([]);
    const [loadingStructures, setLoadingStructures] = useState(true);
    const [showStructureForm, setShowStructureForm] = useState(false);
    const [editingStructureId, setEditingStructureId] = useState(null);
    const [currentStructureData, setCurrentStructureData] = useState({
          departmentId: '', defaultBaseSalary: '', currency: DEFAULT_CURRENCY // Initialize currency
    });
    const [departments, setDepartments] = useState([]);
    const [loadingDepartments, setLoadingDepartments] = useState(true);
    const [payrollPreview, setPayrollPreview] = useState(null);
    const [loadingPreview, setLoadingPreview] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [actionLoadingId, setActionLoadingId] = useState(null);
      const [generationMonth, setGenerationMonth] = useState(new Date().toISOString().slice(0, 7));

    // const isSuperAdmin = userRole === 'SUPER_ADMIN'; // Keep if SUPER_ADMIN has different behavior

    const clearMessages = () => { setError(''); setSuccess(''); };

    const fetchStructures = useCallback(async () => {
        setLoadingStructures(true);
        try {
            const data = await fetchDepartmentStructures();
            setStructures(data || []);
        } catch (err) {
            console.error("Error fetching structures:", err);
            setError(`Failed to load salary structures: ${err.message}`);
            setStructures([]);
        } finally {
            setLoadingStructures(false);
        }
    }, []);

    const loadDepartmentsForDropdown = useCallback(async () => {
        setLoadingDepartments(true);
        try {
            const data = await fetchDepartments();
            setDepartments(data || []);
        } catch (err) {
            console.error("Error loading departments for dropdown:", err);
            setError(prev => (prev ? `${prev}; ` : "") + `Failed to load departments: ${err.message}`);
            setDepartments([]);
        } finally {
            setLoadingDepartments(false);
        }
    }, []);

    useEffect(() => {
        fetchStructures();
        loadDepartmentsForDropdown();
    }, [fetchStructures, loadDepartmentsForDropdown]);

    const handleAddOrEditStructureClick = (structure = null) => {
        clearMessages();
        setPayrollPreview(null);
        if (structure) {
            setEditingStructureId(structure.id);
            setCurrentStructureData({
                departmentId: structure.departmentId || '',
                defaultBaseSalary: structure.defaultBaseSalary != null ? structure.defaultBaseSalary.toString() : '',
                currency: structure.currency || DEFAULT_CURRENCY,
            });
        } else {
            setEditingStructureId(null);
            setCurrentStructureData({ departmentId: '', defaultBaseSalary: '', currency: DEFAULT_CURRENCY });
        }
        setShowStructureForm(true);
    };

    const handleCancelEditStructure = () => {
        clearMessages(); setEditingStructureId(null);
        setCurrentStructureData({ departmentId: '', defaultBaseSalary: '', currency: DEFAULT_CURRENCY });
        setShowStructureForm(false);
    };

    const handleStructureFormChange = (e) => {
        const { name, value } = e.target;
        if (name === 'defaultBaseSalary') {
            if (/^\d*\.?\d{0,2}$/.test(value) || value === '') {
                setCurrentStructureData(prev => ({ ...prev, [name]: value }));
            }
        } else if (name === 'currency') {
            setCurrentStructureData(prev => ({ ...prev, [name]: value.substring(0, 3).toUpperCase() }));
        } else {
            setCurrentStructureData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSaveStructure = async (e) => {
        e.preventDefault(); clearMessages(); setActionLoadingId('structure-form');
        let dataToSubmit = { ...currentStructureData };
        if (editingStructureId !== null) dataToSubmit.id = editingStructureId;

        if (!dataToSubmit.departmentId || !dataToSubmit.defaultBaseSalary || !dataToSubmit.currency) {
            setError("Department, Base Salary, and Currency are required.");
            setActionLoadingId(null); return;
        }
        const baseSalaryNum = parseFloat(dataToSubmit.defaultBaseSalary);
        if (isNaN(baseSalaryNum) || baseSalaryNum <= 0) {
            setError("Base Salary must be a positive number.");
            setActionLoadingId(null); return;
        }
        if (dataToSubmit.currency.length !== 3 || !/^[A-Za-z]{3}$/.test(dataToSubmit.currency)) { // Allow any 3 letters for now
            setError("Currency must be a 3-letter code.");
            setActionLoadingId(null); return;
        }
        dataToSubmit.defaultBaseSalary = baseSalaryNum;
        dataToSubmit.currency = dataToSubmit.currency.toUpperCase();
        // departmentId should already be a number if selected from dropdown
        dataToSubmit.departmentId = Number(dataToSubmit.departmentId);


        console.log("Saving structure:", dataToSubmit);

        try {
            await saveDepartmentStructure(dataToSubmit);
            setSuccess(`Salary structure ${editingStructureId ? 'updated' : 'created'} successfully!`);
            fetchStructures(); handleCancelEditStructure();
            setTimeout(clearMessages, 5000);
        } catch (err) {
            const msg = err.message || 'Failed to save salary structure.';
            if (err.details && typeof err.details === 'object') {
                const validationErrors = Object.entries(err.details)
                    .map(([field, message]) => `${field}: ${message}`)
                    .join('\n');
                setError(`Validation Failed:\n${validationErrors}`);
            } else {
                setError(msg);
            }
            console.error("Save structure error:", err);
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleDeleteStructure = async (structureId) => {
        if (!window.confirm(`Delete salary structure ID ${structureId}?`)) return;
        clearMessages(); setActionLoadingId(structureId);
        try {
            await deleteDepartmentStructure(structureId);
            setSuccess(`Salary structure ID ${structureId} deleted.`);
            fetchStructures();
            setTimeout(clearMessages, 5000);
        } catch (err) {
            setError(err.message || `Failed to delete structure ${structureId}.`);
            console.error("Delete structure error:", err);
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleCalculatePreview = async () => {
        clearMessages(); setLoadingPreview(true); setPayrollPreview(null);
        try {
            const previewData = await calculatePayrollPreview();
            setPayrollPreview(previewData || []);
            if (previewData && previewData.length > 0) {
                setSuccess('Payroll preview calculated.');
            } else if (previewData) { // previewData exists but is empty
                setError('No employee data found for payroll preview generation (check user salary/department structure).');
            }
        } catch (err) {
            setError(err.message || 'Failed to calculate payroll preview.');
            console.error("Payroll preview error:", err);
            setPayrollPreview(null);
        } finally {
            setLoadingPreview(false);
             // Clear success message for preview a bit sooner, or keep if error is also shown.
            if (success.includes('preview calculated')) setTimeout(() => setSuccess(''), 5000);
        }
    };

    const handleGeneratePayslips = async () => {
        if (!generationMonth) {
            setError("Please select a month to generate payslips for.");
            return;
        }
        if (!window.confirm(`Generate payslips for ${generationMonth}? This will create new records and will not override existing ones.`)) return;
        
        clearMessages();
        setActionLoadingId('generate');
        try {
            // API expects a full date string, so we use the 1st of the month
            const payPeriodDate = `${generationMonth}-01`;
            const result = await generatePayslipsForMonth(payPeriodDate);
            setSuccess(result.message);
        } catch (err) {
            setError(err.message);
        } finally {
            setActionLoadingId(null);
        }
    };
    
    const isActionInProgress = actionLoadingId !== null;

    return (
        <PayrollConfigContainer>
            <PageTitle>Payroll Configuration</PageTitle>
            {error && <p className="message-display error" style={{whiteSpace: 'pre-wrap'}}>{error}</p>}
            {success && <p className="message-display success">{success}</p>}

            {/* --- Section for Department Structures --- */}
            <SectionTitle>Department Default Salary Structures</SectionTitle>
            {!showStructureForm && (
                <ActionButton onClick={() => handleAddOrEditStructureClick()} disabled={isActionInProgress}>
                    Add New Salary Structure
                </ActionButton>
            )}

            {showStructureForm && (
                <StructureForm onSubmit={handleSaveStructure}>
                    <h4>{editingStructureId ? `Edit Structure (ID: ${editingStructureId})` : 'Add New Salary Structure'}</h4>
                    <FormGroup>
                        <Label htmlFor="departmentId">Department *</Label>
                        <Select
                            id="departmentId"
                            name="departmentId"
                            value={currentStructureData.departmentId}
                            onChange={handleStructureFormChange}
                            required
                            disabled={actionLoadingId === 'structure-form' || loadingDepartments || departments.length === 0 || editingStructureId !== null}
                        >
                            <option value="">{loadingDepartments ? "Loading..." : (departments.length === 0 ? "No Depts" : "-- Select Department --")}</option>
                            {departments.map(dept => (
                                <option key={dept.id} value={dept.id}>{dept.name}</option>
                            ))}
                        </Select>
                    </FormGroup>
                    <FormGroup>
                        <Label htmlFor="defaultBaseSalary">Default Monthly Base Salary *</Label>
                        <Input
                            type="number" step="0.01" min="0.01" id="defaultBaseSalary"
                            name="defaultBaseSalary" value={currentStructureData.defaultBaseSalary}
                            onChange={handleStructureFormChange} required disabled={actionLoadingId === 'structure-form'}
                            placeholder="e.g., 5000.00"
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label htmlFor="currency">Currency Code * (3 Letters)</Label>
                        <Input
                            type="text" id="currency" name="currency" value={currentStructureData.currency}
                            onChange={handleStructureFormChange} required maxLength="3"
                            disabled={actionLoadingId === 'structure-form'} placeholder="e.g., USD"
                        />
                    </FormGroup>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                        <Button type="submit" className="save-btn" disabled={actionLoadingId === 'structure-form' || !currentStructureData.departmentId || !currentStructureData.defaultBaseSalary || parseFloat(currentStructureData.defaultBaseSalary) <= 0 || !currentStructureData.currency || currentStructureData.currency.length !== 3}>
                            {actionLoadingId === 'structure-form' ? 'Saving...' : (editingStructureId ? 'Update Structure' : 'Create Structure')}
                        </Button>
                        <Button type="button" className="cancel-btn" onClick={handleCancelEditStructure} disabled={actionLoadingId === 'structure-form'}>Cancel</Button>
                    </div>
                </StructureForm>
            )}

            {loadingStructures ? <LoadingMsg>Loading salary structures...</LoadingMsg> :
              structures.length === 0 && !error.includes("Failed to load salary structures") ? <p className="message-display info">No department salary structures configured yet.</p> :
              structures.length > 0 ? (
                <div style={{overflowX: 'auto', maxHeight: '400px', overflowY: 'auto'}}>
                    <Table>
                        <thead><tr><th>ID</th><th>Department</th><th>Company</th><th>Base Salary</th><th>Currency</th><th className="actions-cell">Actions</th></tr></thead>
                        <tbody>
                            {structures.map(s => (
                                <tr key={s.id}>
                                    <td>{s.id}</td>
                                    <td>{s.departmentName || 'N/A'}</td>
                                    <td>{s.companyName || 'N/A'}</td>
                                    <td>{s.defaultBaseSalary != null ? s.defaultBaseSalary.toFixed(2) : 'N/A'}</td>
                                    <td>{s.currency || '???'}</td>
                                    <td className="actions-cell">
                                        <button className="edit-btn" onClick={() => handleAddOrEditStructureClick(s)} disabled={isActionInProgress || showStructureForm}>Edit</button>
                                        <button className="delete-btn" onClick={() => handleDeleteStructure(s.id)} disabled={isActionInProgress || showStructureForm || actionLoadingId === s.id}>
                                            {actionLoadingId === s.id ? '...' : 'Delete'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            ) : null}

            {/* --- Section for Payslip Generation --- */}
            <SectionTitle>Payslip Generation</SectionTitle>
            <InfoDisplay className="message-display info">
                Select a month and year, then click the button to initiate the payslip generation process for all approved employees in your company.
            </InfoDisplay>
            <div style={{display: 'flex', gap: '15px', alignItems: 'center', justifyContent: 'center', margin: '20px 0'}}>
                <Input type="month" value={generationMonth} onChange={e => setGenerationMonth(e.target.value)} />
                <Button onClick={handleGeneratePayslips} disabled={actionLoadingId === 'generate'}>
                    {actionLoadingId === 'generate' ? 'Processing...' : 'Generate Payslips'}
                </Button>
            </div>
            
            {/* --- Section for Payroll Preview --- */}
            <SectionTitle>Payroll Preview (Gross Pay)</SectionTitle>
            <InfoDisplay className="message-display info" style={{textAlign: 'left', whiteSpace: 'pre-wrap'}}>
                Calculates estimated monthly gross pay for all approved employees in your company.
                Rules:
                1. Uses employee's individual salary if set.
                2. Else, uses department default for their company.
                3. Else, gross pay is 0.
                (Does not include taxes/deductions.)
            </InfoDisplay>
            <PayrollActionButton onClick={handleCalculatePreview} disabled={isActionInProgress}>
                {loadingPreview ? 'Calculating...' : 'Calculate Payroll Preview'}
            </PayrollActionButton>

            {loadingPreview ? <LoadingMsg>Calculating payroll preview...</LoadingMsg> :
            payrollPreview && payrollPreview.length > 0 ? (
                <div style={{overflowX: 'auto', maxHeight: '500px', overflowY: 'auto'}}>
                    <Table>
                        <thead>
                            <tr>
                                <th>Employee Name</th>
                                <th>Department</th>
                                <th>Company</th>
                                <th>Gross Monthly Pay</th>
                                <th>Currency</th>
                                <th>Pay Basis</th>
                                <th>Notes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payrollPreview.map((item, index) => (
                                <tr key={item.employeeId || index}>
                                    <td>{item.employeeName || 'N/A'}</td>
                                    <td>{item.departmentName || 'N/A'}</td>
                                    <td>{item.companyName || 'N/A'}</td>
                                    <td>{item.grossMonthlyPay != null ? item.grossMonthlyPay.toFixed(2) : '0.00'}</td>
                                    <td>{item.currency || '???'}</td>
                                    <td>{item.payBasis || 'N/A'}</td>
                                    <td>{item.notes || 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            ) : payrollPreview === null && !error.includes("Failed to calculate payroll preview") ? (
                <p className="message-display info">Click "Calculate Payroll Preview" to see the estimated gross pay for your employees.</p>
            ) : null}

        </PayrollConfigContainer>
    );
};

export default AdminPayrollConfigurationPage;