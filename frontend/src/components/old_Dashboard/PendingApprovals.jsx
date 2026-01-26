// src/components/old_Dashboard/PendingApprovals.jsx
import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { fetchPendingApprovals, approveUser, rejectUser } from '../../services/apiService';

// Styled Components using CSS Variables
const ApprovalContainer = styled.div`
  padding: 25px;
  background-color: var(--background-secondary);
  color: var(--text-primary);
  border-radius: 8px;
  box-shadow: 0 2px 8px var(--shadow-color);
  margin-top: 20px;
  border: 1px solid var(--border-primary);
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
`;

const Title = styled.h2`
    margin-bottom: 20px;
    color: var(--text-primary);
    border-bottom: 1px solid var(--border-secondary);
    padding-bottom: 10px;
`;

const UserTable = styled.table`
  width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 0.9em;
  th, td { border: 1px solid var(--border-primary); padding: 10px 12px; text-align: left; vertical-align: middle; }
  th { background-color: var(--background-tertiary); color: var(--text-secondary); font-weight: 600; }
  tbody tr:nth-child(even) { background-color: var(--background-tertiary); opacity: 0.95; }
  tbody tr:hover { background-color: var(--background-hover); }
  button { padding: 5px 10px; margin-left: 6px; cursor: pointer; border: none; border-radius: 4px; font-size: 0.9em; transition: background-color 0.2s, opacity 0.2s; color: white; }
  button:disabled { opacity: 0.6; cursor: not-allowed; }
  .approve-btn { background-color: #28a745; &:hover:not(:disabled) { background-color: #218838; } }
  .reject-btn { background-color: #dc3545; &:hover:not(:disabled) { background-color: #c82333; } }
`;

const InfoMsg = styled.p`
    color: var(--text-secondary); font-size: 0.95em; margin-top: 20px; padding: 15px;
    background-color: var(--background-tertiary); border: 1px solid var(--border-secondary);
    border-radius: 4px; text-align: center;
`;
const LoadingMsg = styled.p` font-style: italic; color: var(--text-muted); margin-top: 10px; text-align: center; padding: 15px; `;

const PendingApprovals = () => {
    // State and logic remain the same
    const [pendingUsers, setPendingUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [actionLoading, setActionLoading] = useState(null);

    const clearMessages = () => { setError(''); setSuccess(''); };
    const fetchPendingUsers = useCallback(async () => { /* ... keep logic ... */
         if (!actionLoading) setLoading(true); setError('');
        try { const data = await fetchPendingApprovals(); setPendingUsers(data || []); }
        catch (err) { setError(err.message || 'Failed fetch pending.'); setPendingUsers([]); }
        finally { if (!actionLoading) setLoading(false); }
    }, [actionLoading]);
    useEffect(() => { fetchPendingUsers(); }, [fetchPendingUsers]);
    const handleApprove = async (userId) => { /* ... keep logic ... */
        setActionLoading(userId); clearMessages();
        try { const approvedUser = await approveUser(userId); setSuccess(`User ${approvedUser?.username || userId} approved.`); setPendingUsers(current => current.filter(user => user.id !== userId)); setTimeout(clearMessages, 4000); }
        catch (err) { setError(err.message || `Failed approve user ${userId}.`); } finally { setActionLoading(null); }
    };
    const handleReject = async (userId) => { /* ... keep logic ... */
         if (!window.confirm(`Reject user ID: ${userId}?`)) return; setActionLoading(userId); clearMessages();
        try { const result = await rejectUser(userId); setSuccess(result?.message || `User ${userId} rejected.`); setPendingUsers(current => current.filter(user => user.id !== userId)); setTimeout(clearMessages, 4000); }
        catch (err) { setError(err.message || `Failed reject user ${userId}.`); } finally { setActionLoading(null); }
    };


    return (
        <ApprovalContainer className="approval-container">
            <Title>Pending User Approvals</Title>
            {error && <p className="message-display error">{error}</p>}
            {success && <p className="message-display success">{success}</p>}

            {loading ? ( <LoadingMsg>Loading pending users...</LoadingMsg> )
             : pendingUsers.length === 0 && !error ? ( <InfoMsg>No users currently pending approval.</InfoMsg> )
             : pendingUsers.length > 0 ? (
                <UserTable>
                    <thead> <tr> <th>ID</th> <th>Username</th> <th>Name</th> <th>Company</th> <th>Department</th> <th>Actions</th> </tr> </thead>
                    <tbody>
                        {pendingUsers.map(user => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.username ?? 'N/A'}</td>
                                <td>{`${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || 'N/A'}</td>
                                <td>{user.company?.name ?? 'N/A'}</td>
                                <td>{user.department?.name ?? 'N/A'}</td>
                                <td>
                                    <button className="approve-btn" onClick={() => handleApprove(user.id)} disabled={!!actionLoading}> {actionLoading === user.id ? '...' : 'Approve'} </button>
                                    <button className="reject-btn" onClick={() => handleReject(user.id)} disabled={!!actionLoading}> {actionLoading === user.id ? '...' : 'Reject'} </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </UserTable>
            ) : null }
        </ApprovalContainer>
    );
};

export default PendingApprovals;