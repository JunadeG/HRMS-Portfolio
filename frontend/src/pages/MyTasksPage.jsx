// src/pages/MyTasksPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { fetchMyTasks, updateTaskStatus } from '../services/apiService';

// Reusing styles from other pages
const PageContainer = styled.div` padding: 30px; max-width: 1200px; margin: 20px auto; `;
const PageTitle = styled.h2` color: var(--text-primary); margin-bottom: 25px; border-bottom: 2px solid var(--text-accent); padding-bottom: 10px; `;
const TaskTable = styled.table`
    width: 100%; border-collapse: collapse; background-color: var(--background-secondary);
    border-radius: 8px; overflow: hidden; border: 1px solid var(--border-primary);
    box-shadow: 0 2px 8px var(--shadow-color);
    th, td { padding: 12px 15px; text-align: left; border-bottom: 1px solid var(--border-secondary); }
    th { background-color: var(--background-tertiary); }
    tbody tr:hover { background-color: var(--background-hover); }
`;
const StatusSelect = styled.select`
    padding: 6px 10px; border-radius: 5px; border: 1px solid var(--border-primary);
    background-color: var(--background-secondary); color: var(--text-primary);
`;

const MyTasksPage = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadTasks = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const data = await fetchMyTasks();
            setTasks(data || []);
        } catch (err) {
            setError(err.message || 'Failed to load tasks.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadTasks();
    }, [loadTasks]);

    const handleStatusChange = async (taskId, newStatus) => {
        try {
            await updateTaskStatus(taskId, newStatus);
            // Update local state to reflect the change immediately
            setTasks(prevTasks =>
                prevTasks.map(task =>
                    task.id === taskId ? { ...task, status: newStatus } : task
                )
            );
        } catch (err) {
            alert(`Failed to update task status: ${err.message}`);
        }
    };

    if (loading) return <PageContainer><p>Loading your tasks...</p></PageContainer>;

    return (
        <PageContainer>
            <PageTitle>My Assigned Tasks</PageTitle>
            {error && <p className="message-display error">{error}</p>}
            {tasks.length === 0 ? (
                <p>You have no tasks assigned to you.</p>
            ) : (
                <TaskTable>
                    <thead>
                        <tr>
                            <th>Status</th>
                            <th>Title</th>
                            <th>Project</th>
                            <th>Due Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tasks.map(task => (
                            <tr key={task.id}>
                                <td>
                                    <StatusSelect
                                        value={task.status}
                                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                                    >
                                        <option value="TODO">To Do</option>
                                        <option value="IN_PROGRESS">In Progress</option>
                                        <option value="DONE">Done</option>
                                    </StatusSelect>
                                </td>
                                <td>{task.title}</td>
                                <td>{task.project?.name || 'N/A'}</td>
                                <td>{task.dueDate ? new Date(task.dueDate + 'T00:00:00').toLocaleDateString() : 'N/A'}</td>
                            </tr>
                        ))}
                    </tbody>
                </TaskTable>
            )}
        </PageContainer>
    );
};

export default MyTasksPage;