import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import {
    fetchAdminUsers,
    fetchSalaryComponentsForAdmin,
    createSalaryComponent,
    deleteSalaryComponent,
    fetchEmployeeComponents,
    assignComponentToEmployee,
    removeComponentFromEmployee
} from '../services/apiService';

// Reusing styled components from other admin pages
const AdminContainer = styled.div` padding: 30px; max-width: 1400px; margin: 20px auto; background-color: var(--background-secondary); border-radius: 8px; box-shadow: 0 2px 10px var(--shadow-color); border: 1px solid var(--border-primary);`;
const PageTitle = styled.h2` color: var(--text-primary); margin-bottom: 25px; border-bottom: 2px solid var(--text-accent); padding-bottom: 10px; display: inline-block;`;
const SectionTitle = styled.h3` margin-top: 30px; margin-bottom: 15px; color: var(--text-accent); border-bottom: 1px solid var(--border-secondary); padding-bottom: 8px;`;
const GridContainer = styled.div` display: grid; grid-template-columns: 1fr 2fr; gap: 30px; @media (max-width: 992px) { grid-template-columns: 1fr; } `;
const Form = styled.form` display: flex; flex-direction: column; gap: 15px; background-color: var(--background-tertiary); padding: 20px; border-radius: 8px; `;
const Table = styled.table` width: 100%; border-collapse: collapse; font-size: 0.9em; th, td { border: 1px solid var(--border-primary); padding: 8px 10px; text-align: left; } th { background-color: var(--background-tertiary); }`;
const Button = styled.button` padding: 8px 15px; border: none; border-radius: 4px; cursor: pointer; background-color: var(--text-accent); color: var(--text-on-accent); &:disabled { opacity: 0.5; } `;
const DeleteButton = styled(Button)` background-color: var(--text-error); `;
const Select = styled.select` padding: 8px; border-radius: 4px; border: 1px solid var(--border-primary); background-color: var(--background-secondary); color: var(--text-primary);`;
const Input = styled.input` padding: 8px; border-radius: 4px; border: 1px solid var(--border-primary); background-color: var(--background-secondary); color: var(--text-primary);`;
const LoadingMsg = styled.p` color: var(--text-muted); font-style: italic;`;

const AdminSalaryManagement = () => {
    const [users, setUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [components, setComponents] = useState([]); // All available components
    const [employeeComponents, setEmployeeComponents] = useState([]); // Components for selected user
    
    const [loading, setLoading] = useState({ users: true, components: true, employee: false });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // --- State for creating a new component definition ---
    const [newComponent, setNewComponent] = useState({ name: '', type: 'ALLOWANCE', percentageOf: '' });
    
    // --- State for assigning a component to a user ---
    const [assignment, setAssignment] = useState({ componentId: '', value: '' });

    const clearMessages = () => { setError(''); setSuccess(''); };

    const loadInitialData = useCallback(async () => {
        clearMessages();
        try {
            setLoading({ users: true, components: true, employee: false });
            const [usersData, componentsData] = await Promise.all([
                fetchAdminUsers(),
                fetchSalaryComponentsForAdmin()
            ]);
            setUsers(usersData.filter(u => u.role === 'USER') || []);
            setComponents(componentsData || []);
        } catch (err) { setError(err.message); } 
        finally { setLoading(prev => ({ ...prev, users: false, components: false })); }
    }, []);

    useEffect(() => { loadInitialData(); }, [loadInitialData]);

    const handleUserSelection = async (userId) => {
        setSelectedUserId(userId);
        if (!userId) {
            setEmployeeComponents([]);
            return;
        }
        clearMessages();
        setLoading(prev => ({...prev, employee: true}));
        try {
            const data = await fetchEmployeeComponents(userId);
            setEmployeeComponents(data || []);
        } catch (err) { setError(`Failed to fetch components for user: ${err.message}`); }
        finally { setLoading(prev => ({...prev, employee: false})); }
    };

    const handleCreateComponent = async (e) => {
        e.preventDefault(); clearMessages();
        try {
            await createSalaryComponent(newComponent);
            setSuccess('New salary component created.');
            setNewComponent({ name: '', type: 'ALLOWANCE', percentageOf: '' });
            loadInitialData(); // Reload all components
        } catch (err) { setError(`Failed to create component: ${err.message}`); }
    };
    
    const handleDeleteComponent = async (id) => {
        if (!window.confirm("Delete this component definition? It can't be assigned anymore.")) return;
        try {
            await deleteSalaryComponent(id);
            setSuccess('Component definition deleted.');
            loadInitialData();
        } catch (err) { setError(`Failed to delete component: ${err.message}`); }
    };

    const handleAssignComponent = async (e) => {
        e.preventDefault(); clearMessages();
        if (!selectedUserId || !assignment.componentId || !assignment.value) {
            setError('Please select a user, a component, and provide a value.');
            return;
        }
        try {
            await assignComponentToEmployee(selectedUserId, assignment.componentId, assignment.value);
            setSuccess('Component assigned to employee.');
            setAssignment({ componentId: '', value: '' });
            handleUserSelection(selectedUserId); // Refresh user's components
        } catch (err) { setError(`Failed to assign component: ${err.message}`); }
    };

    const handleRemoveAssignment = async (assignmentId) => {
         if (!window.confirm("Remove this component from the employee's salary?")) return;
        try {
            await removeComponentFromEmployee(assignmentId);
            setSuccess('Component removed from employee.');
            handleUserSelection(selectedUserId); // Refresh
        } catch (err) { setError(`Failed to remove component: ${err.message}`); }
    };

    return (
        <AdminContainer>
            <PageTitle>Employee Salary Structure Management</PageTitle>
            {error && <p className="message-display error">{error}</p>}
            {success && <p className="message-display success">{success}</p>}

            <GridContainer>
                <div>
                    <SectionTitle>1. Define Salary Components</SectionTitle>
                    {loading.components ? <LoadingMsg/> : (
                        <Table>
                            <tbody>
                                {components.map(c => (
                                    <tr key={c.id}>
                                        <td>{c.name} ({c.type}) {c.percentageOf && `(% of ${c.percentageOf})`}</td>
                                        <td><DeleteButton onClick={() => handleDeleteComponent(c.id)}>X</DeleteButton></td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                    <Form onSubmit={handleCreateComponent}>
                        <Input type="text" placeholder="New Component Name" value={newComponent.name} onChange={e => setNewComponent({...newComponent, name: e.target.value})} required/>
                        <Select value={newComponent.type} onChange={e => setNewComponent({...newComponent, type: e.target.value})}>
                            <option value="ALLOWANCE">Allowance</option>
                            <option value="DEDUCTION">Deduction</option>
                        </Select>
                        <Input type="text" placeholder="% of (e.g., BASE_SALARY)" value={newComponent.percentageOf} onChange={e => setNewComponent({...newComponent, percentageOf: e.target.value})}/>
                        <Button type="submit">Create Component</Button>
                    </Form>
                </div>

                <div>
                    <SectionTitle>2. Configure Employee Salary</SectionTitle>
                    <Select onChange={e => handleUserSelection(e.target.value)} value={selectedUserId}>
                        <option value="">-- Select an Employee --</option>
                        {users.map(u => <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.username})</option>)}
                    </Select>

                    {selectedUserId && (
                        <>
                            <p><strong>Note:</strong> Base salary is managed on the "Employee Details" page.</p>
                            {loading.employee ? <LoadingMsg/> : (
                                <Table>
                                    <thead><tr><th>Component</th><th>Value/Percentage</th><th>Action</th></tr></thead>
                                    <tbody>
                                        {employeeComponents.map(ec => (
                                            <tr key={ec.id}>
                                                <td>{ec.salaryComponent.name}</td>
                                                <td>{ec.value}</td>
                                                <td><DeleteButton onClick={() => handleRemoveAssignment(ec.id)}>Remove</DeleteButton></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            )}

                            <Form onSubmit={handleAssignComponent}>
                                <Select value={assignment.componentId} onChange={e => setAssignment({...assignment, componentId: e.target.value})} required>
                                    <option value="">-- Assign a Component --</option>
                                    {components.map(c => <option key={c.id} value={c.id}>{c.name} ({c.type})</option>)}
                                </Select>
                                <Input type="number" step="0.01" placeholder="Value or Percentage" value={assignment.value} onChange={e => setAssignment({...assignment, value: e.target.value})} required/>
                                <Button type="submit">Assign to Employee</Button>
                            </Form>
                        </>
                    )}
                </div>
            </GridContainer>
        </AdminContainer>
    );
};

export default AdminSalaryManagement;