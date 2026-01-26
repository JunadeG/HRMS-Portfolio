// src/components/old_Dashboard/AdminUserManagement.jsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import styled from 'styled-components';
import { useLocation } from 'react-router-dom';
import {
    fetchAdminUsers,
    addUserByAdmin,
    deleteUserByAdmin,
    updateUserDepartmentByAdmin,
    updateUserPayrollDetails,
    updateUserAsAdmin,
    fetchUserByIdForAdmin,
    fetchDepartments,
    completeOnboarding // New import for the onboarding API call
} from '../../services/apiService';
import EmployeeProfileCard from '../admin/EmployeeProfileCard';
import { FaIdCard, FaBuilding, FaMoneyBillWave, FaTrashAlt, FaEllipsisV, FaSearch, FaUserPlus } from 'react-icons/fa';

// --- Styled Components ---
const AdminContainer = styled.div` padding: 30px; max-width: 1400px; margin: 20px auto; background-color: var(--background-primary); color: var(--text-primary); border-radius: 8px; `;
const HeaderContainer = styled.div` display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; flex-wrap: wrap; gap: 20px; `;
const PageTitle = styled.h2` color: var(--text-primary); margin: 0; border-bottom: 2px solid var(--text-accent); padding-bottom: 10px; flex-shrink: 0; `;
const TableControls = styled.div` display: flex; align-items: center; gap: 15px; flex-grow: 1; justify-content: flex-end; `;
const SearchInputWrapper = styled.div` position: relative; svg { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-muted); } `;
const SearchInput = styled.input` padding: 9px 12px 9px 35px; border-radius: 6px; border: 1px solid var(--border-primary); background-color: var(--background-tertiary); color: var(--text-primary); font-size: 0.95em; min-width: 250px; &:focus { outline: none; border-color: var(--border-accent); background-color: var(--background-secondary); } `;
const AddUserButton = styled.button` display: flex; align-items: center; gap: 8px; padding: 9px 18px; background-color: var(--text-accent); color: var(--text-on-accent); border: none; border-radius: 6px; font-weight: 600; cursor: pointer; `;
const UserTableContainer = styled.div` overflow-x: auto; border: 1px solid var(--border-secondary); border-radius: 8px; background-color: var(--background-secondary); box-shadow: 0 2px 8px var(--shadow-color); `;
const UserTable = styled.table`
    width: 100%; min-width: 1200px; border-collapse: collapse; font-size: 0.9em;
    th, td { padding: 12px 15px; text-align: left; vertical-align: middle; border-bottom: 1px solid var(--border-secondary); }
    th { background-color: var(--background-tertiary); color: var(--text-secondary); font-weight: 600; position: sticky; top: 0; z-index: 1; }
    td { color: var(--text-secondary); }
    .primary-text { font-weight: 500; color: var(--text-primary); cursor: pointer; &:hover { color: var(--text-accent); } }
    tr:hover { background-color: var(--background-hover); }
`;

// CRITICAL FIX: The StatusBadge component is now defined here.
const StatusBadge = styled.span`
    padding: 3px 8px; 
    border-radius: 12px; 
    font-size: 0.8em;
    font-weight: 600; 
    color: white; 
    text-transform: uppercase;
    background-color: var(--text-muted);

    &.status-approved { background-color: var(--text-success); }
    &.status-pendingapproval { background-color: #ffc107; color: #212529; }
    &.status-rejected { background-color: var(--text-error); }
`;

// New StatusBadge component for onboarding statuses
const OnboardingStatusBadge = styled(StatusBadge)`
    &.status-pending_documents { background-color: #fd7e14; } // Orange
    &.status-pending_verification { background-color: #ffc107; color: #212529; } // Yellow
    &.status-completed { background-color: var(--text-success); }
`;

const ActionsCell = styled.td` position: relative; text-align: center !important; `;
const KebabButton = styled.button` background: transparent; border: none; padding: 5px; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; color: var(--text-muted); cursor: pointer; &:hover { background-color: var(--background-hover); color: var(--text-primary); } `;
const ActionsDropdown = styled.div`
    position: absolute; right: 25px; top: 45px; background-color: var(--background-secondary); border: 1px solid var(--border-primary);
    border-radius: 6px; box-shadow: 0 4px 12px var(--shadow-color); z-index: 10; width: 180px; overflow: hidden;
    animation: fadeIn 0.1s ease-out;
    button { display: flex; align-items: center; gap: 10px; background: none; border: none; width: 100%; padding: 10px 15px; text-align: left; font-size: 0.9em; color: var(--text-primary); cursor: pointer; &:hover { background-color: var(--background-hover); } }
    .delete-action { color: var(--text-error); &:hover { background-color: color-mix(in srgb, var(--text-error) 10%, transparent); } }
`;
const ModalOverlay = styled.div` position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0, 0, 0, 0.6); display: flex; align-items: center; justify-content: center; z-index: 1000; `;
const ModalContent = styled.div` background-color: var(--background-secondary); padding: 25px; border-radius: 8px; width: 90%; max-width: 700px; max-height: 90vh; overflow-y: auto; h4 { margin-top: 0; }; animation: fadeInUp 0.4s ease-out `;
const ModalForm = styled.form` display: grid; grid-template-columns: 1fr 1fr; gap: 15px 20px; label { margin-bottom: 5px; font-weight: 600; font-size: 0.9em; color: var(--text-secondary); display: block; } input, select { width: 100%; box-sizing: border-box; padding: 10px 12px; border: 1px solid var(--border-primary); border-radius: 4px; font-size: 1em; background-color: var(--background-secondary); color: var(--text-primary); &:focus { outline: none; border-color: var(--border-accent); background-color: var(--background-secondary); } &:disabled { background-color: var(--background-tertiary); opacity: 0.7; } }`;
const ModalButtonGroup = styled.div` grid-column: 1 / -1; display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; button { padding: 8px 16px; font-weight: 600; } `;
const AddUserForm = styled.form` margin-top: 20px; padding: 25px; border: 1px solid var(--border-primary); border-radius: 8px; display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 18px 25px; background-color: var(--background-tertiary); margin-bottom: 30px; h3 { grid-column: 1 / -1; margin-bottom: 15px; color: var(--text-primary); font-weight: 600; font-size: 1.2em; } label { margin-bottom: 5px; font-weight: 600; font-size: 0.9em; color: var(--text-secondary); display: block; } input, select { width: 100%; box-sizing: border-box; padding: 10px 12px; border: 1px solid var(--border-primary); border-radius: 4px; font-size: 1em; background-color: var(--background-secondary); color: var(--text-primary); &:focus { outline: none; border-color: var(--border-accent); } &:disabled { background-color: var(--background-tertiary); opacity: 0.7; } } button[type="submit"] { padding: 10px 20px; background-color: var(--text-accent); color: var(--text-on-accent); border: none; border-radius: 5px; cursor: pointer; font-weight: 500; font-size: 1em; transition: background-color 0.2s ease; grid-column: 1 / -1; margin-top: 10px; } button[type="submit"]:hover:not(:disabled) { background-color: color-mix(in srgb, var(--text-accent) 85%, black); } button[type="submit"]:disabled { background-color: var(--text-muted); opacity: 0.6; cursor: not-allowed; } `;

const AdminUserManagement = () => {
    const [users, setUsers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [newUser, setNewUser] = useState({ firstName: '', lastName: '', username: '', password: '', mobileNumber: '', department: '', role: 'USER' });
    const [isSaving, setIsSaving] = useState(false);
    
    const [modalState, setModalState] = useState({
        isOpen: false,
        mode: null, 
        selectedUser: null,
    });
    
    const [formData, setFormData] = useState({});

    const [searchTerm, setSearchTerm] = useState('');
    const [actionMenuOpenId, setActionMenuOpenId] = useState(null);
    const menuRef = useRef(null);
    const location = useLocation();

    const fetchAllData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const [usersData, departmentsData] = await Promise.all([fetchAdminUsers(), fetchDepartments()]);
            // Mocking the onboarding status for demonstration
            const usersWithOnboarding = usersData.map(user => {
              if (user.id === 'user1') return { ...user, onboardingStatus: 'pending_documents' };
              if (user.id === 'user2') return { ...user, onboardingStatus: 'pending_verification' };
              return { ...user, onboardingStatus: 'completed' };
            });
            setUsers(usersWithOnboarding || []);
            setDepartments(departmentsData ? departmentsData.filter(d => d.name?.toLowerCase() !== 'unassigned') : []);
        } catch (err) { setError(err.message || 'Failed to load page data. Please refresh.'); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (actionMenuOpenId !== null && menuRef.current && !menuRef.current.contains(event.target)) {
                setActionMenuOpenId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [actionMenuOpenId]);

    const openModal = (mode, user) => {
        setActionMenuOpenId(null);
        let initialFormData = {};

        if (mode === 'onboard') {
            initialFormData = { employeeId: user.employeeId || '', jobTitle: user.jobTitle || '', reportingManagerId: user.reportingManager?.id || '', projectManagerId: user.projectManager?.id || '' };
        } else if (mode === 'department') {
            initialFormData = { departmentName: user.department?.name || '' };
        } else if (mode === 'payroll') {
            initialFormData = { baseSalary: user.baseSalary?.toString() || '', currency: user.currency || 'USD', bankName: user.bankName || '', bankAccountNumber: user.bankAccountNumber || '', bankIfscCode: user.bankIfscCode || '' };
        }

        setFormData(initialFormData);
        setModalState({ isOpen: true, mode, selectedUser: user });
    };
    
    const openProfileModal = async (user) => {
        setActionMenuOpenId(null);
        setIsSaving(true);
        try {
            const fullUserData = await fetchUserByIdForAdmin(user.id);
            setModalState({ isOpen: true, mode: 'profile', selectedUser: fullUserData });
        } catch (err) { setError(`Failed to fetch user details: ${err.message}`); }
        finally { setIsSaving(false); }
    };
    
    const closeModal = () => {
        setModalState({ isOpen: false, mode: null, selectedUser: null });
        setFormData({});
        setError(''); 
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError('');
        setSuccess('');
        
        try {
            const { mode, selectedUser } = modalState;
            let resultMessage = '';

            if (mode === 'onboard') {
                const payload = { ...formData, reportingManagerId: formData.reportingManagerId || null, projectManagerId: formData.projectManagerId || null };
                await updateUserAsAdmin(selectedUser.id, payload);
                resultMessage = `Onboarding details for ${selectedUser.username} updated.`;
            } else if (mode === 'department') {
                await updateUserDepartmentByAdmin(selectedUser.id, formData.departmentName);
                resultMessage = `Department for ${selectedUser.username} updated.`;
            } else if (mode === 'payroll') {
                const payload = { ...formData, baseSalary: parseFloat(formData.baseSalary) || 0 };
                await updateUserPayrollDetails(selectedUser.id, payload);
                resultMessage = `Payroll for ${selectedUser.username} updated.`;
            }
            
            setSuccess(resultMessage);
            closeModal();
            await fetchAllData();
        } catch (err) {
            setError(err.message || "An error occurred.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteUser = async (user) => {
        if (!window.confirm(`Are you sure you want to delete user: ${user.username}?`)) return;
        setIsSaving(true);
        try {
            await deleteUserByAdmin(user.id);
            setSuccess(`User ${user.username} deleted.`);
            await fetchAllData();
        } catch (err) { setError(err.message || `Failed to delete ${user.username}.`); }
        finally {
            setIsSaving(false);
            setActionMenuOpenId(null);
        }
    };
    
    const handleNewUserChange = (e) => { const { name, value } = e.target; setNewUser(prev => ({ ...prev, [name]: value })); };
    
    const handleAddUserSubmit = async (e) => {
        e.preventDefault();
        if (!newUser.department) { setError("Please select a department."); return; }
        setIsSaving(true);
        try {
            await addUserByAdmin({ ...newUser, role: 'USER' });
            setSuccess(`User '${newUser.username}' added successfully.`);
            setNewUser({ firstName: '', lastName: '', username: '', password: '', mobileNumber: '', department: '', role: 'USER' });
            setShowAddForm(false);
            await fetchAllData();
        } catch (err) { setError(err.message || 'Failed to add user.'); }
        finally { setIsSaving(false); }
    };
    
    // New function to handle completing a user's onboarding
    const handleCompleteOnboarding = async (userId) => {
        setIsSaving(true);
        try {
            await completeOnboarding(userId); // The new API call
            setSuccess("Onboarding marked as complete.");
            await fetchAllData(); // Refresh the user list
        } catch (err) {
            setError(err.message || "Failed to complete onboarding.");
        } finally {
            setIsSaving(false);
            setActionMenuOpenId(null);
        }
    };

    const filteredUsers = useMemo(() => {
        if (!searchTerm) return users;
        return users.filter(user => {
            const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
            const username = user.username.toLowerCase();
            return fullName.includes(searchTerm.toLowerCase()) || username.includes(searchTerm.toLowerCase());
        });
    }, [users, searchTerm]);

    const potentialManagers = useMemo(() => 
        users.filter(u => u.id !== modalState.selectedUser?.id), 
    [users, modalState.selectedUser]);

    return (
        <AdminContainer>
            <HeaderContainer>
                <PageTitle>Employee Management</PageTitle>
                <TableControls>
                    <SearchInputWrapper>
                        <FaSearch />
                        <SearchInput type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </SearchInputWrapper>
                    <AddUserButton onClick={() => setShowAddForm(prev => !prev)} disabled={isSaving}>
                        <FaUserPlus /> {showAddForm ? 'Cancel' : 'Add Employee'}
                    </AddUserButton>
                </TableControls>
            </HeaderContainer>

            {error && <p className="message-display error">{error}</p>}
            {success && <p className="message-display success">{success}</p>}

            {showAddForm && (
                <AddUserForm onSubmit={handleAddUserSubmit}>
                    <h3>Add New Employee</h3>
                    <div><label htmlFor="nu-fn">First Name *</label><input id="nu-fn" type="text" name="firstName" value={newUser.firstName} onChange={handleNewUserChange} required /></div>
                    <div><label htmlFor="nu-ln">Last Name *</label><input id="nu-ln" type="text" name="lastName" value={newUser.lastName} onChange={handleNewUserChange} required /></div>
                    <div><label htmlFor="nu-un">Username *</label><input id="nu-un" type="text" name="username" value={newUser.username} onChange={handleNewUserChange} required /></div>
                    <div><label htmlFor="nu-pw">Password *</label><input id="nu-pw" type="password" name="password" placeholder="(min 5 chars, no spaces)" value={newUser.password} onChange={handleNewUserChange} required /></div>
                    <div><label htmlFor="nu-mn">Mobile Number</label><input id="nu-mn" type="tel" name="mobileNumber" value={newUser.mobileNumber} onChange={handleNewUserChange} /></div>
                    <div>
                        <label htmlFor="nu-dept">Department *</label>
                        <select id="nu-dept" name="department" value={newUser.department} onChange={handleNewUserChange} required disabled={loading}>
                            <option value="">{loading ? "Loading..." : "-- Select Department --"}</option>
                            {departments.map(dept => (<option key={dept.id} value={dept.name}>{dept.name}</option>))}
                        </select>
                    </div>
                    <button type="submit" disabled={isSaving || loading}>Add Employee</button>
                </AddUserForm>
            )}

            <UserTableContainer>
                <UserTable>
                    <thead>
                        <tr>
                            <th>Emp ID</th><th>Name</th><th>Username</th><th>Department</th>
                            <th className="wrap-text">Salary/Bank Details</th><th>Role</th>
                            <th>Onboarding Status</th>
                            <th>Status</th>
                            <th style={{textAlign: 'center'}}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.id}>
                                <td>{user.employeeId || 'N/A'}</td>
                                <td className="primary-text" onClick={() => openProfileModal(user)}>{`${user.firstName} ${user.lastName}`}</td>
                                <td className="primary-text">{user.username}</td>
                                <td>{user.department?.name || 'N/A'}</td>
                                <td className="wrap-text" style={{fontSize: '0.8em', lineHeight: '1.3'}}>
                                    Salary: {user.baseSalary != null ? `${Number(user.baseSalary).toFixed(2)} ${user.currency || ''}` : 'Not Set'}<br/>
                                    Bank: {user.bankName || 'N/A'}
                                </td>
                                <td>{user.role}</td>
                                <td>
                                    {user.onboardingStatus && (
                                        <OnboardingStatusBadge className={`status-${user.onboardingStatus.toLowerCase()}`}>
                                            {user.onboardingStatus.replace('_', ' ')}
                                        </OnboardingStatusBadge>
                                    )}
                                </td>
                                <td><StatusBadge className={`status-${user.status.toLowerCase().replace('_', '')}`}>{user.status.replace('_', ' ')}</StatusBadge></td>
                                <ActionsCell>
                                    <KebabButton onClick={() => setActionMenuOpenId(actionMenuOpenId === user.id ? null : user.id)} disabled={isSaving}>
                                        <FaEllipsisV />
                                    </KebabButton>
                                    {actionMenuOpenId === user.id && (
                                        <ActionsDropdown ref={menuRef}>
                                            <button onClick={() => openModal('onboard', user)}><FaIdCard /> Onboard/Details</button>
                                            <button onClick={() => openModal('department', user)}><FaBuilding /> Edit Department</button>
                                            <button onClick={() => openModal('payroll', user)}><FaMoneyBillWave /> Edit Payroll</button>
                                            {user.onboardingStatus !== 'completed' && (
                                                <button onClick={() => handleCompleteOnboarding(user.id)}>
                                                     Mark Onboarding Complete
                                                </button>
                                            )}
                                            <button className="delete-action" onClick={() => handleDeleteUser(user)}><FaTrashAlt /> Delete User</button>
                                        </ActionsDropdown>
                                    )}
                                </ActionsCell>
                            </tr>
                        ))}
                    </tbody>
                </UserTable>
            </UserTableContainer>

            {modalState.isOpen && (
                <ModalOverlay onClick={closeModal}>
                    <ModalContent onClick={e => e.stopPropagation()}>
                        <button onClick={closeModal} style={{float: 'right', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer'}}>×</button>

                        {modalState.mode === 'profile' && modalState.selectedUser && (
                            <EmployeeProfileCard user={modalState.selectedUser} />
                        )}

                        {modalState.mode === 'onboard' && (
                            <ModalForm onSubmit={handleFormSubmit}>
                                <h4>Onboard / Edit Details for: {modalState.selectedUser?.username}</h4>
                                <div><label>Employee ID</label><input type="text" name="employeeId" value={formData.employeeId || ''} onChange={handleFormChange} /></div>
                                <div><label>Job Title</label><input type="text" name="jobTitle" value={formData.jobTitle || ''} onChange={handleFormChange} /></div>
                                <div><label>Reporting Manager</label><select name="reportingManagerId" value={formData.reportingManagerId || ''} onChange={handleFormChange}><option value="">-- None --</option>{potentialManagers.map(m => <option key={m.id} value={m.id}>{`${m.firstName} ${m.lastName}`}</option>)}</select></div>
                                <div><label>Project Manager</label><select name="projectManagerId" value={formData.projectManagerId || ''} onChange={handleFormChange}><option value="">-- None --</option>{potentialManagers.map(m => <option key={m.id} value={m.id}>{`${m.firstName} ${m.lastName}`}</option>)}</select></div>
                                <ModalButtonGroup><button type="button" onClick={closeModal}>Cancel</button><button type="submit" disabled={isSaving}>{isSaving ? "Saving..." : "Save"}</button></ModalButtonGroup>
                            </ModalForm>
                        )}

                        {modalState.mode === 'department' && (
                            <ModalForm onSubmit={handleFormSubmit} style={{gridTemplateColumns: '1fr'}}>
                                <h4>Change Department for: {modalState.selectedUser?.username}</h4>
                                <div><label>Department</label><select name="departmentName" value={formData.departmentName || ''} onChange={handleFormChange} required><option value="">-- Select --</option>{departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}</select></div>
                                <ModalButtonGroup><button type="button" onClick={closeModal}>Cancel</button><button type="submit" disabled={isSaving}>{isSaving ? "Saving..." : "Save"}</button></ModalButtonGroup>
                            </ModalForm>
                        )}
                        
                        {modalState.mode === 'payroll' && (
                            <ModalForm onSubmit={handleFormSubmit}>
                                <h4>Edit Payroll for: {modalState.selectedUser?.username}</h4>
                                <div><label>Base Salary</label><input type="number" step="0.01" name="baseSalary" value={formData.baseSalary || ''} onChange={handleFormChange} required /></div>
                                <div><label>Currency</label><input type="text" maxLength="3" name="currency" value={formData.currency || ''} onChange={handleFormChange} required /></div>
                                <div><label>Bank Name</label><input type="text" name="bankName" value={formData.bankName || ''} onChange={handleFormChange} /></div>
                                <div><label>Account Number</label><input type="text" name="bankAccountNumber" value={formData.bankAccountNumber || ''} onChange={handleFormChange} /></div>
                                <div style={{gridColumn: '1 / -1'}}><label>IFSC / Branch Code</label><input type="text" name="bankIfscCode" value={formData.bankIfscCode || ''} onChange={handleFormChange} /></div>
                                <ModalButtonGroup><button type="button" onClick={closeModal}>Cancel</button><button type="submit" disabled={isSaving}>{isSaving ? "Saving..." : "Save"}</button></ModalButtonGroup>
                            </ModalForm>
                        )}
                    </ModalContent>
                </ModalOverlay>
            )}
        </AdminContainer>
    );
};

export default AdminUserManagement;
