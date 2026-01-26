// src/pages/AdminProjectManagementPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { fetchAdminUsers, fetchActiveProjects, createTask, createAllocation } from '../services/apiService';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

// --- Styled Components ---
const PageContainer = styled.div`
  padding: 30px;
  max-width: 1200px;
  margin: 20px auto;
`;
const PageTitle = styled.h2`
  color: var(--text-primary);
  margin-bottom: 25px;
  border-bottom: 2px solid var(--text-accent);
  padding-bottom: 10px;
`;
const GridContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  align-items: start;
  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
`;
const FormContainer = styled.div`
  background-color: var(--background-secondary);
  padding: 25px;
  border-radius: 8px;
  border: 1px solid var(--border-primary);
  box-shadow: 0 2px 8px var(--shadow-color);
`;
const SectionTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 20px;
  color: var(--text-accent);
  border-bottom: 1px solid var(--border-secondary);
  padding-bottom: 10px;
`;
const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;
const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  label { font-weight: 600; font-size: 0.9em; color: var(--text-secondary); }
  input, select, textarea, .react-datepicker-wrapper input {
    width: 100%;
    box-sizing: border-box;
    padding: 9px 12px;
    border: 1px solid var(--border-primary);
    border-radius: 4px;
    font-size: 1em;
    background-color: var(--background-secondary);
    color: var(--text-primary);
    &:focus { outline: none; border-color: var(--border-accent); }
    &:disabled { background-color: var(--background-tertiary); cursor: not-allowed; }
  }
  textarea { min-height: 80px; resize: vertical; }
`;
const SubmitButton = styled.button`
  padding: 10px 18px;
  background-color: var(--text-accent);
  color: var(--text-on-accent);
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 500;
  align-self: flex-start;
  margin-top: 10px;
  &:disabled { opacity: 0.6; }
`;

const AdminProjectManagementPage = () => {
    const [users, setUsers] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // State for Allocation Form
    const [allocationData, setAllocationData] = useState({
        userId: '', projectId: '', startDate: null, endDate: null, allocatedHoursPerWeek: ''
    });

    // State for Task Form
    const [taskData, setTaskData] = useState({
        assigneeId: '', projectId: '', title: '', description: '', dueDate: null
    });

    const loadInitialData = useCallback(async () => {
        setLoading(true);
        try {
            const [usersData, projectsData] = await Promise.all([fetchAdminUsers(), fetchActiveProjects()]);
            setUsers(usersData.filter(u => u.status === 'APPROVED') || []);
            setProjects(projectsData || []);
        } catch (err) {
            setError(err.message || 'Failed to load initial data.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadInitialData();
    }, [loadInitialData]);

    const handleAllocationSubmit = async (e) => {
        e.preventDefault();
        setError(''); setSuccess('');
        try {
            await createAllocation(allocationData);
            setSuccess('Project allocation created successfully!');
            setAllocationData({ userId: '', projectId: '', startDate: null, endDate: null, allocatedHoursPerWeek: '' });
        } catch (err) { setError(err.message || 'Failed to create allocation.'); }
    };

    const handleTaskSubmit = async (e) => {
        e.preventDefault();
        setError(''); setSuccess('');
        try {
            await createTask(taskData);
            setSuccess('Task created and assigned successfully!');
            setTaskData({ assigneeId: '', projectId: '', title: '', description: '', dueDate: null });
        } catch (err) { setError(err.message || 'Failed to create task.'); }
    };

    if (loading) return <PageContainer><p>Loading users and projects...</p></PageContainer>;

    return (
        <PageContainer>
            <PageTitle>Project & Task Management</PageTitle>
            {error && <p className="message-display error">{error}</p>}
            {success && <p className="message-display success">{success}</p>}
            <GridContainer>
                <FormContainer>
                    <SectionTitle>Create Project Allocation</SectionTitle>
                    <Form onSubmit={handleAllocationSubmit}>
                        <FormGroup>
                            <label>Allocate User</label>
                            <select required value={allocationData.userId} onChange={e => setAllocationData({...allocationData, userId: e.target.value})}>
                                <option value="">-- Select User --</option>
                                {users.map(u => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
                            </select>
                        </FormGroup>
                        <FormGroup>
                            <label>To Project</label>
                            <select required value={allocationData.projectId} onChange={e => setAllocationData({...allocationData, projectId: e.target.value})}>
                                <option value="">-- Select Project --</option>
                                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </FormGroup>
                        <FormGroup>
                            <label>Start Date</label>
                            <DatePicker selected={allocationData.startDate} onChange={date => setAllocationData({...allocationData, startDate: date})} dateFormat="yyyy-MM-dd" />
                        </FormGroup>
                        <FormGroup>
                            <label>End Date</label>
                            <DatePicker selected={allocationData.endDate} onChange={date => setAllocationData({...allocationData, endDate: date})} dateFormat="yyyy-MM-dd" />
                        </FormGroup>
                        <FormGroup>
                            <label>Allocated Hours Per Week</label>
                            <input type="number" step="0.5" min="1" required value={allocationData.allocatedHoursPerWeek} onChange={e => setAllocationData({...allocationData, allocatedHoursPerWeek: e.target.value})} />
                        </FormGroup>
                        <SubmitButton type="submit">Create Allocation</SubmitButton>
                    </Form>
                </FormContainer>
                
                <FormContainer>
                    <SectionTitle>Assign New Task</SectionTitle>
                    <Form onSubmit={handleTaskSubmit}>
                        <FormGroup>
                            <label>Assign To User</label>
                            <select required value={taskData.assigneeId} onChange={e => setTaskData({...taskData, assigneeId: e.target.value})}>
                                <option value="">-- Select User --</option>
                                {users.map(u => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
                            </select>
                        </FormGroup>
                        <FormGroup>
                            <label>For Project</label>
                            <select required value={taskData.projectId} onChange={e => setTaskData({...taskData, projectId: e.target.value})}>
                                <option value="">-- Select Project --</option>
                                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </FormGroup>
                        <FormGroup>
                            <label>Task Title</label>
                            <input type="text" required value={taskData.title} onChange={e => setTaskData({...taskData, title: e.target.value})} />
                        </FormGroup>
                        <FormGroup>
                            <label>Description (Optional)</label>
                            <textarea value={taskData.description} onChange={e => setTaskData({...taskData, description: e.target.value})} />
                        </FormGroup>
                        <FormGroup>
                            <label>Due Date (Optional)</label>
                            <DatePicker selected={taskData.dueDate} onChange={date => setTaskData({...taskData, dueDate: date})} dateFormat="yyyy-MM-dd" />
                        </FormGroup>
                        <SubmitButton type="submit">Assign Task</SubmitButton>
                    </Form>
                </FormContainer>
            </GridContainer>
        </PageContainer>
    );
};

export default AdminProjectManagementPage;