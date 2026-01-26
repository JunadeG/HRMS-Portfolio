// src/pages/AdminTimesheetApprovalPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { fetchPendingTimesheets, approveTimesheet, rejectTimesheet } from '../services/apiService';

// --- Styled Components ---
const PageContainer = styled.div`
  padding: 30px;
  max-width: 1400px;
  margin: 20px auto;
`;

const PageTitle = styled.h2`
  color: var(--text-primary);
  margin-bottom: 25px;
  border-bottom: 2px solid var(--text-accent);
  padding-bottom: 10px;
`;

const TimesheetCard = styled.div`
  background-color: var(--background-secondary);
  border: 1px solid var(--border-primary);
  border-left: 5px solid var(--text-accent);
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 5px var(--shadow-color);
  overflow: hidden; // To contain the table
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: var(--background-tertiary);
`;

const UserInfo = styled.div`
  h4 { margin: 0; }
  p { margin: 0; font-size: 0.9em; color: var(--text-secondary); }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
  button {
    padding: 8px 15px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-weight: 600;
    &:disabled { cursor: not-allowed; opacity: 0.6; }
  }
`;

const ApproveButton = styled.button`
  background-color: var(--text-success);
  color: white;
  &:hover:not(:disabled) { background-color: color-mix(in srgb, var(--text-success) 85%, black); }
`;

const RejectButton = styled.button`
  background-color: var(--text-error);
  color: white;
  &:hover:not(:disabled) { background-color: color-mix(in srgb, var(--text-error) 85%, black); }
`;

const DetailsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  th, td { padding: 10px 15px; text-align: left; }
  thead { background-color: var(--background-hover); }
  tbody tr:nth-child(even) { background-color: var(--background-tertiary); }
`;

const TotalHours = styled.div`
  padding: 10px 20px;
  text-align: right;
  font-weight: bold;
  font-size: 1.1em;
`;

// --- The Component ---

const AdminTimesheetApprovalPage = () => {
    const [pending, setPending] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoadingId, setActionLoadingId] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const loadPendingTimesheets = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchPendingTimesheets();
            setPending(data || []);
        } catch (err) {
            setError(err.message || "Failed to load pending timesheets.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadPendingTimesheets();
    }, [loadPendingTimesheets]);

    const handleAction = async (action, timesheetId) => {
        if (!window.confirm(`Are you sure you want to ${action} this timesheet?`)) return;

        setActionLoadingId(timesheetId);
        setError('');
        setSuccess('');

        try {
            const actionFunc = action === 'approve' ? approveTimesheet : rejectTimesheet;
            await actionFunc(timesheetId);
            setSuccess(`Timesheet #${timesheetId} has been ${action}d.`);
            // Remove the item from the list to update the UI
            setPending(prev => prev.filter(t => t.id !== timesheetId));
        } catch (err) {
            setError(err.message || `Failed to ${action} timesheet.`);
        } finally {
            setActionLoadingId(null);
        }
    };

    if (loading) return <PageContainer><PageTitle>Timesheet Approvals</PageTitle><p>Loading submitted timesheets...</p></PageContainer>;

    return (
        <PageContainer>
            <PageTitle>Timesheet Approvals</PageTitle>

            {error && <p className="message-display error">{error}</p>}
            {success && <p className="message-display success">{success}</p>}

            {pending.length === 0 ? (
                <p>There are no timesheets pending your approval.</p>
            ) : (
                pending.map(timesheet => (
                    <TimesheetCard key={timesheet.id}>
                        <CardHeader>
                            <UserInfo>
                                <h4>{timesheet.user.firstName} {timesheet.user.lastName}</h4>
                                <p>
                                    Week of: {new Date(timesheet.weekStartDate + 'T00:00:00').toLocaleDateString()} | 
                                    Submitted: {new Date(timesheet.submittedDate).toLocaleString()}
                                </p>
                            </UserInfo>
                            <ActionButtons>
                                <ApproveButton onClick={() => handleAction('approve', timesheet.id)} disabled={actionLoadingId === timesheet.id}>
                                    Approve
                                </ApproveButton>
                                <RejectButton onClick={() => handleAction('reject', timesheet.id)} disabled={actionLoadingId === timesheet.id}>
                                    Reject
                                </RejectButton>
                            </ActionButtons>
                        </CardHeader>
                        <DetailsTable>
                            <thead>
                                <tr>
                                    <th>Project</th>
                                    <th>Task Description</th>
                                    <th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th><th>Sat</th><th>Sun</th>
                                </tr>
                            </thead>
                            <tbody>
                                {timesheet.entries.map(entry => (
                                    <tr key={entry.id}>
                                        <td>{entry.project.name}</td>
                                        <td>{entry.taskDescription}</td>
                                        <td>{entry.hoursMonday}</td>
                                        <td>{entry.hoursTuesday}</td>
                                        <td>{entry.hoursWednesday}</td>
                                        <td>{entry.hoursThursday}</td>
                                        <td>{entry.hoursFriday}</td>
                                        <td>{entry.hoursSaturday}</td>
                                        <td>{entry.hoursSunday}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </DetailsTable>
                        <TotalHours>
                            Total Hours: {timesheet.totalHours.toFixed(2)}
                        </TotalHours>
                    </TimesheetCard>
                ))
            )}
        </PageContainer>
    );
};

export default AdminTimesheetApprovalPage;
