// src/pages/AdminPayrollConfigurationPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import {
    fetchDepartments, // Still need departments for dropdowns
    fetchDepartmentStructures,
    saveDepartmentStructure,
    deleteDepartmentStructure,
    calculatePayrollPreview // Import the new preview function
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
   overflow-x: auto; /* Ensure table is scrollable horizontally if needed */
   display: block; /* Make table a block element for overflow to work */
   max-height: 400px; /* Limit vertical height and add scroll */
   overflow-y: auto;


  th, td {
    border: 1px solid var(--border-primary); padding: 10px 12px; text-align: left; vertical-align: middle;
     white-space: nowrap; /* Prevent wrapping by default */
  }
    /* Allow wrap for certain columns if needed */
    /* e.g., td:nth-child(5) { white-space: normal; } */ /* For preview notes */

  th {
    background-color: var(--background-tertiary); color: var(--text-secondary); font-weight: 600;
    position: sticky; top: 0; z-index: 1; /* Sticky header */
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
  .save-btn { background-color: #28a745; &:hover:not(:disabled) { background-color: #218838; } }
  .cancel-btn { background-color: #6c757d; &:hover:not(:disabled) { background-color: #5a6268; } }

   .actions-cell { text-align: center; min-width: 140px; } /* Ensure actions column has space */

   .edit-input, .edit-select { /* Inline edit styles */
        padding: 6px 8px; font-size: 0.9em; border: 1px solid var(--border-primary); border-radius: 4px;
        background-color: var(--background-secondary); color: var(--text-primary); box-sizing: border-box;
        &:focus { outline: none; border-color: var(--border-accent); }
        &:disabled { background-color: var(--background-tertiary); opacity: 0.7; }
   }
    .edit-input[name="currency"] { width: 60px; text-transform: uppercase;}
    .edit-input[name="defaultBaseSalary"] { width: 100px; }
    .edit-select { width: 150px; }
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

const AddButton = styled(ActionButton)` /* Reuse general ActionButton style */
    margin-bottom: 20px;
`;

const PayrollActionButton = styled.button`
    padding: 12px 25px; background-color: #007bff; color: white; border: none; border-radius: 5px;
    cursor: pointer; font-size: 1em; font-weight: 500; display: block; margin: 20px auto;
    transition: background-color 0.2s, opacity 0.2s;
    &:hover:not(:disabled) { background-color: #0056b3; }
    &:disabled { background-color: #cccccc; opacity: 0.6; cursor: not-allowed; }
`;


const LoadingMsg = styled.p` color: var(--text-muted); font-style: italic; text-align: center; padding: 15px; `;
const ErrorDisplay = styled.p` /* Using global .message-display.error */ `;
const SuccessDisplay = styled.p` /* Using global .message-display.success */ `;
const InfoDisplay = styled.p` /* Using global .message-display.info */ `;


// Matches backend LeaveType enum for display purposes - NO, this is Payroll related!
// Matches backend Currency format constraint
const DEFAULT_CURRENCY = 'USD'; // Example default if not specified by admin

const AdminPayrollConfigurationPage = () => {
    // --- State for Department Structures ---
    const [structures, setStructures] = useState([]);
    const [loadingStructures, setLoadingStructures] = useState(true);
    const [showStructureForm, setShowStructureForm] = useState(false);
    const [editingStructureId, setEditingStructureId] = useState(null);
    const [currentStructureData, setCurrentStructureData] = useState({
         departmentId: '', defaultBaseSalary: '', currency: ''
    });
     const [departments, setDepartments] = useState([]); // Departments for the dropdown
     const [loadingDepartments, setLoadingDepartments] = useState(true);

    // --- State for Payroll Preview ---
    const [payrollPreview, setPayrollPreview] = useState(null); // Null when not calculated yet
    const [loadingPreview, setLoadingPreview] = useState(false);

    // --- General UI State ---
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [actionLoadingId, setActionLoadingId] = useState(null); // Loading for Save/Delete/Calculate

    const clearMessages = () => { setError(''); setSuccess(''); };


    // --- Data Fetching ---
    const fetchStructures = useCallback(async () => {
        setLoadingStructures(true); setError(''); // Clear error on fetch
        try {
            const data = await fetchDepartmentStructures();
             // Add a check here if departmentName is missing and you need it for display
            // Map the fetched structures to ensure departmentName is included if needed in the table row,
            // or update convertToStructureDTOWithNames on backend. Backend approach is better.
             setStructures(data || []); // Assuming backend DTO now includes departmentName
        } catch (err) {
            console.error("Error fetching structures:", err);
             setError(`Failed to load salary structures: ${err.message}`);
            setStructures([]);
        } finally {
            setLoadingStructures(false);
        }
    }, []);

     const loadDepartments = useCallback(async () => {
         setLoadingDepartments(true);
         try {
             const data = await fetchDepartments();
             // Filter out 'Unassigned' if it exists, but usually it's an internal state
             // Or allow it if departments are independent of user status
             setDepartments(data || []); // Keep all departments fetched
         } catch (err) {
             console.error("Error loading departments for dropdown:", err);
              setError(prev => (prev ? prev + "; " : "") + `Failed to load departments list: ${err.message}`);
             setDepartments([]);
         } finally {
             setLoadingDepartments(false);
         }
     }, []);

    useEffect(() => {
        fetchStructures();
        loadDepartments();
    }, [fetchStructures, loadDepartments]);


    // --- Department Structure Handlers ---

    const handleAddStructureClick = () => {
        clearMessages();
        setEditingStructureId(null); // Null indicates new structure
        setCurrentStructureData({ departmentId: '', defaultBaseSalary: '', currency: DEFAULT_CURRENCY }); // Reset form data
        setShowStructureForm(true); // Show the form
        setPayrollPreview(null); // Hide preview when adding/editing structure
    };

     const handleEditStructureClick = (structure) => {
         clearMessages();
         // Populate form with existing structure data
         setEditingStructureId(structure.id);
         setCurrentStructureData({
            departmentId: structure.departmentId, // Pass ID
             defaultBaseSalary: structure.defaultBaseSalary != null ? structure.defaultBaseSalary.toString() : '',
             currency: structure.currency || ''
         });
        setShowStructureForm(true); // Show the form
        setPayrollPreview(null); // Hide preview
         console.log("Editing structure:", structure);
     };

     const handleCancelEditStructure = () => {
        clearMessages();
         setEditingStructureId(null);
         setCurrentStructureData({ departmentId: '', defaultBaseSalary: '', currency: DEFAULT_CURRENCY });
         setShowStructureForm(false); // Hide form
     };

    const handleStructureFormChange = (e) => {
        const { name, value } = e.target;
         // Basic input validation for salary/currency formatting as they type
         if (name === 'defaultBaseSalary') {
             // Allow numbers and a single decimal point
              if (/^\d*\.?\d*$/.test(value) || value === '') {
                 setCurrentStructureData(prev => ({ ...prev, [name]: value }));
              }
         } else if (name === 'currency') {
              // Limit to 3 characters and uppercase as they type
             setCurrentStructureData(prev => ({ ...prev, [name]: value.substring(0, 3).toUpperCase() }));
         }
        else {
            setCurrentStructureData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSaveStructure = async (e) => {
        e.preventDefault(); clearMessages();
         setActionLoadingId('structure-form'); // Indicate form saving
        setPayrollPreview(null); // Hide preview on save

        const dataToSubmit = { ...currentStructureData };

         // Add ID if editing existing structure
         if (editingStructureId !== null) {
            dataToSubmit.id = editingStructureId;
         }

        // Basic validation before submitting
        if (!dataToSubmit.departmentId || !dataToSubmit.defaultBaseSalary || dataToSubmit.defaultBaseSalary <= 0 || !dataToSubmit.currency) {
            setError("Required fields (Department, Base Salary > 0, Currency) must be filled.");
             setActionLoadingId(null);
            return;
        }
         if (dataToSubmit.currency.length !== 3 || !dataToSubmit.currency.match(/^[A-Z]{3}$/)) {
              setError("Currency must be a 3-letter code (e.g., USD).");
               setActionLoadingId(null);
              return;
         }

         // Ensure baseSalary is a number/BigDecimal string format
         dataToSubmit.defaultBaseSalary = parseFloat(dataToSubmit.defaultBaseSalary);
         if (isNaN(dataToSubmit.defaultBaseSalary)) {
             setError("Base Salary must be a valid number.");
              setActionLoadingId(null);
             return;
         }

         console.log("Saving structure:", dataToSubmit);

        try {
             const savedStructure = await saveDepartmentStructure(dataToSubmit);
            setSuccess(`Salary structure saved successfully!`);
             // Refresh list and hide form
             fetchStructures(); // Refetch the list to get updated data and potential names
            handleCancelEditStructure(); // Hide and reset the form
            setTimeout(clearMessages, 5000);
        }
        catch (err) {
             const msg = err.message || 'Failed to save salary structure.';
             // Check for validation errors attached to the error object
            if (err.details && typeof err.details === 'object') {
                const validationErrors = Object.entries(err.details)
                    .map(([field, message]) => `${field}: ${message}`)
                    .join('\n'); // Join messages with newline
                setError(`Validation Failed:\n${validationErrors}`); // Display detailed validation errors
            } else {
                 setError(msg);
             }
             console.error("Save structure error:", err);
        } finally {
             setActionLoadingId(null);
        }
    };

     const handleDeleteStructure = async (structureId) => {
         if (!window.confirm(`Are you sure you want to delete salary structure ID ${structureId}?`)) return;
        clearMessages(); setActionLoadingId(structureId);
         setPayrollPreview(null); // Hide preview on delete attempt

        try {
            await deleteDepartmentStructure(structureId);
            setSuccess(`Salary structure ID ${structureId} deleted successfully.`);
            setStructures(structures.filter(s => s.id !== structureId)); // Remove from local state
            setTimeout(clearMessages, 5000);
        }
        catch (err) { setError(err.message || `Failed to delete structure ${structureId}.`); console.error("Delete structure error:", err); }
        finally { setActionLoadingId(null); }
     };


    // --- Payroll Preview Handler ---
    const handleCalculatePreview = async () => {
        clearMessages();
         setActionLoadingId('preview'); // Indicate preview calculation is loading
         setPayrollPreview(null); // Clear previous preview

        try {
            const previewData = await calculatePayrollPreview();
             console.log("Fetched payroll preview:", previewData);
            setPayrollPreview(previewData || []);
            setSuccess('Payroll preview calculated.');
        } catch (err) {
            console.error("Error calculating payroll preview:", err);
            setError(err.message || 'Failed to calculate payroll preview.');
            setPayrollPreview(null); // Ensure null on error
        } finally {
             setActionLoadingId(null);
             // Keep success message for a while after loading finishes
            if (!error) setTimeout(clearMessages, 5000);
        }
    };

     // Helper to find department name from ID for display
    const getDepartmentNameById = (deptId) => {
        const dept = departments.find(d => d.id === deptId);
        return dept ? dept.name : 'Unknown Department';
    };

     const isAnyStructureActionRunning = actionLoadingId !== null && actionLoadingId !== 'preview';


    return (
        <PayrollConfigContainer>
            <PageTitle>Payroll Configuration</PageTitle>

            {/* General Message Display */}
             {error && <ErrorDisplay className="message-display error">{error}</ErrorDisplay>}
             {success && !error && <SuccessDisplay className="message-display success">{success}</SuccessDisplay>}

            {/* --- Department Salary Structure Section --- */}
            <SectionTitle>Department Default Salaries</SectionTitle>

            <AddButton onClick={handleAddStructureClick} disabled={isAnyStructureActionRunning}>
                {showStructureForm ? 'Cancel' : 'Add/Edit Structure'}
            </AddButton>

            {/* Department Structure Form */}
             {showStructureForm && (
                <StructureForm onSubmit={handleSaveStructure}>
                    <h4>{editingStructureId === null ? 'Add New' : `Edit`} Structure</h4>
                    {/* Department Dropdown */}
                    <FormGroup>
                        <Label htmlFor="departmentId">Department *</Label>
                         <select
                            id="departmentId"
                            name="departmentId"
                             value={currentStructureData.departmentId}
                            onChange={handleStructureFormChange}
                            required
                            disabled={actionLoadingId === 'structure-form' || loadingDepartments || departments.length === 0}
                         >
                            <option value="">{loadingDepartments ? "Loading Departments..." : (departments.length === 0 ? "No Departments Found" : "-- Select Department --")}</option>
                             {/* Ensure only actual departments are selectable, filter if needed */}
                            {departments.map(dept => (
                                <option key={dept.id} value={dept.id}>{dept.name}</option>
                            ))}
                         </select>
                    </FormGroup>
                    {/* Default Base Salary Input */}
                    <FormGroup>
                         <Label htmlFor="defaultBaseSalary">Default Monthly Base Salary *</Label>
                         <Input
                            type="number"
                            step="0.01"
                            min="0"
                            id="defaultBaseSalary"
                             name="defaultBaseSalary"
                             value={currentStructureData.defaultBaseSalary}
                            onChange={handleStructureFormChange}
                            required
                             disabled={actionLoadingId === 'structure-form'}
                             placeholder="e.g. 5000.00"
                         />
                    </FormGroup>
                     {/* Currency Input */}
                     <FormGroup>
                        <Label htmlFor="currency">Currency Code * (3 Letters)</Label>
                         <Input
                            type="text"
                            id="currency"
                            name="currency"
                            value={currentStructureData.currency}
                            onChange={handleStructureFormChange}
                            required
                             minLength="3"
                             maxLength="3"
                             disabled={actionLoadingId === 'structure-form'}
                             placeholder="e.g. USD, ZAR"
                         />
                     </FormGroup>
                    {/* Save/Cancel Buttons */}
                    <button type="submit" disabled={actionLoadingId === 'structure-form' || !currentStructureData.departmentId || !currentStructureData.defaultBaseSalary || currentStructureData.defaultBaseSalary <= 0 || !currentStructureData.currency || currentStructureData.currency.length !== 3 }>
                         {actionLoadingId === 'structure-form' ? 'Saving...' : 'Save Structure'}
                    </button>
                    <button type="button" onClick={handleCancelEditStructure} disabled={actionLoadingId === 'structure-form'}>Cancel</button>
                </StructureForm>
             )}

            {/* Department Structures Table */}
            {loadingStructures ? ( <LoadingMsg>Loading salary structures...</LoadingMsg> )
             : structures.length === 0 && !error.includes("Failed to load salary structures") ? ( <InfoDisplay className="message-display info">No department salary structures configured yet.</InfoDisplay> )
             : structures.length > 0 ? (
                 <div style={{overflowX: 'auto'}}> {/* Allow horizontal scroll for the table */}
                    <Table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Department</th>
                                <th>Default Base Salary</th>
                                <th>Currency</th>
                                <th>Company</th> {/* Might show Company if SUPER_ADMIN views all */}
                                <th className="actions-cell">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {structures.map(structure => (
                                <tr key={structure.id}>
                                    <td>{structure.id}</td>
                                    <td>{structure.departmentName || getDepartmentNameById(structure.departmentId)}</td> {/* Display name from DTO or lookup */}
                                    <td>{structure.defaultBaseSalary != null ? structure.defaultBaseSalary.toFixed(2) : 'N/A'}</td>
                                    <td>{structure.currency || '???'}</td>
                                    <td>{structure.company?.name || 'N/A'}</td> {/* Access company name from potentially nested object */}
                                    <td className="actions-cell">
                                         <button className="edit-btn" onClick={() => handleEditStructureClick(structure)} disabled={isAnyStructureActionRunning}>Edit</button>
                                         <button className="delete-btn" onClick={() => handleDeleteStructure(structure.id)} disabled={isAnyStructureActionRunning || actionLoadingId === structure.id}>
                                            {actionLoadingId === structure.id ? '...' : 'Delete'}
                                         </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                 </div>
             ) : null }

            {/* --- Payroll Calculation Preview Section --- */}
            <SectionTitle>Payroll Preview (Gross Pay)</SectionTitle>
             <InfoDisplay className="message-display info">
                 This calculates the estimated gross pay for all approved employees in your company
                 based on their individual salary configuration or their department's default structure.
                 It does NOT include taxes, deductions, or complex allowances at this time.
             </InfoDisplay>
            <PayrollActionButton onClick={handleCalculatePreview} disabled={actionLoadingId === 'preview' || loading || loadingStructures}>
                 {actionLoadingId === 'preview' ? 'Calculating...' : 'Calculate Monthly Gross Pay Preview'}
            </PayrollActionButton>

            {loadingPreview && <LoadingMsg>Calculating payroll preview...</LoadingMsg>}

            {/* Payroll Preview Table */}
             {payrollPreview !== null && payrollPreview.length === 0 && !loadingPreview && !error ? (
                 <InfoDisplay className="message-display info">No employees found for payroll calculation, or preview data is empty.</InfoDisplay>
             ) : payrollPreview !== null && payrollPreview.length > 0 ? (
                <>
                    <h4 style={{marginTop: '20px', marginBottom: '10px', color: 'var(--text-primary)'}}>Calculated Gross Pay per Employee</h4>
                     <div style={{ overflowX: 'auto' }}> {/* Allow horizontal scroll for table */}
                        <Table>
                            <thead>
                                <tr>
                                    <th>User ID</th>
                                    <th>Username</th>
                                    <th>Full Name</th>
                                    <th>Department</th>
                                    <th>Gross Pay (Monthly Est.)</th>
                                    <th>Currency</th>
                                    <th>Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payrollPreview.map(item => (
                                    <tr key={item.userId}>
                                        <td>{item.userId}</td>
                                        <td>{item.username}</td>
                                        <td>{item.fullName}</td>
                                        <td>{item.department}</td>
                                        <td>{item.calculatedGrossPay != null ? item.calculatedGrossPay.toFixed(2) : 'N/A'}</td>
                                        <td>{item.currency || '???'}</td>
                                         <td>{item.notes || ''}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                     </div>
                </>
            ) : null }
             {/* Note: Bank details are managed on AdminUserManagement or a dedicated User Edit Payroll page, not shown in this simple preview. */}

        </PayrollConfigContainer>
    );
};

export default AdminPayrollConfigurationPage;