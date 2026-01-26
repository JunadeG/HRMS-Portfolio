// src/pages/AdminLeaveApprovalPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { getPendingLeaveRequests, approveLeaveRequest, rejectLeaveRequest } from '../services/apiService';

// --- Styled Components ---
const ApprovalContainer = styled.div`
  padding: 30px; max-width: 1200px; margin: 20px auto;
  background-color: var(--background-secondary); color: var(--text-primary);
  border-radius: 8px; box-shadow: 0 2px 10px var(--shadow-color);
  border: 1px solid var(--border-primary);
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
`;
const Title = styled.h2`
    color: var(--text-primary); margin-bottom: 25px; border-bottom: 2px solid var(--text-accent);
    padding-bottom: 10px; display: inline-block;
`;
const RequestTable = styled.table`
  width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 0.9em;
  th, td {
    border: 1px solid var(--border-primary); padding: 10px 12px; text-align: left; vertical-align: middle;
  }
  th {
    background-color: var(--background-tertiary); color: var(--text-secondary); font-weight: 600;
  }
  tbody tr:nth-child(even) { background-color: var(--background-tertiary); opacity: 0.95; }
  tbody tr:hover { background-color: var(--background-hover); }
  button {
    padding: 5px 10px; margin: 0 4px; cursor: pointer; border: none; border-radius: 4px;
    font-size: 0.9em; transition: background-color 0.2s, opacity 0.2s; color: white;
  }
  button:disabled { opacity: 0.6; cursor: not-allowed; }
  .approve-btn { background-color: #28a745; &:hover:not(:disabled) { background-color: #218838; } }
  .reject-btn { background-color: #dc3545; &:hover:not(:disabled) { background-color: #c82333; } }
  .action-cell { min-width: 140px; text-align: center !important; }
`;
const LoadingMsg = styled.p` color: var(--text-secondary); text-align: center; padding: 20px; font-style: italic;`;
const ErrorDisplay = styled.p` /* Use .message-display.error from themes.css */ `;
const InfoMsg = styled.p` /* Use .message-display.success or .info from themes.css */ `;
// --- End Styled Components ---

// Matches backend LeaveType enum for display purposes
const LEAVE_TYPE_DISPLAY = {
    PAID_LEAVE: 'Paid Leave',
    SICK_LEAVE: 'Sick Leave',
    UNPAID_LEAVE: 'Unpaid Leave',
    FLOATER_LEAVE: 'Floater Leave',
};

const AdminLeaveApprovalPage = () => {
    const [pendingRequests, setPendingRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [actionLoading, setActionLoading] = useState(null);

    const clearMessages = () => { setError(''); setSuccess(''); };

    const fetchPending = useCallback(async () => {
        if (!actionLoading) setLoading(true);
        try {
            const data = await getPendingLeaveRequests();
            setPendingRequests(data || []);
        } catch (err) {
            console.error("Error fetching pending leave requests:", err);
            setError(`Failed to load requests: ${err.message}`);
            setPendingRequests([]);
        } finally {
             if (!actionLoading) setLoading(false);
        }
    }, [actionLoading]);

    useEffect(() => {
        fetchPending();
    }, [fetchPending]);

    const handleAction = async (actionType, requestId) => {
        if (actionType === 'reject') {
            if (!window.confirm(`Are you sure you want to reject leave request ID ${requestId}?`)) {
                return;
            }
        }
        setActionLoading(requestId);
        clearMessages();
        try {
            let resultMessage = '';
            if (actionType === 'approve') {
                await approveLeaveRequest(requestId);
                resultMessage = `Request ID ${requestId} approved successfully.`;
            } else if (actionType === 'reject') {
                await rejectLeaveRequest(requestId);
                resultMessage = `Request ID ${requestId} rejected successfully.`;
            } else {
                throw new Error("Invalid action type specified.");
            }
            setSuccess(resultMessage);
            setPendingRequests(prev => prev.filter(req => req.id !== requestId));
        } catch (err) {
            console.error(`Error ${actionType}ing leave request ${requestId}:`, err);
            setError(`Failed to ${actionType} request ${requestId}: ${err.message}`);
        } finally {
            setActionLoading(null);
            setTimeout(clearMessages, 5000);
        }
    };

    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return 'N/A';
        try {
             return new Date(dateTimeString).toLocaleString(undefined, {
                year: 'numeric', month: 'short', day: 'numeric',
                hour: 'numeric', minute: '2-digit', hour12: true
            });
        } catch (e) { return dateTimeString; }
    };
     const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
         try {
             return new Date(dateString + 'T00:00:00Z').toLocaleDateString(undefined, {
                 year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC'
                });
        } catch (e) { return dateString; }
    };

    return (
        <ApprovalContainer className="approval-container">
            <Title>Pending Leave Approvals</Title>

            {error && <ErrorDisplay className="message-display error">{error}</ErrorDisplay>}
            {success && <InfoMsg className="message-display success">{success}</InfoMsg>}

            {loading ? (
                <LoadingMsg>Loading pending requests...</LoadingMsg>
            ) : pendingRequests.length === 0 && !error.includes("Failed to load requests") ? (
                <InfoMsg className="message-display info">No leave requests currently pending approval.</InfoMsg>
            ) : (
                <RequestTable>
                    <thead>
                        <tr>
                            <th>Requester</th>
                            <th>Username</th>
                            <th>Leave Type</th> {/* <<< NEW COLUMN */}
                            <th>Start Date</th>
                            <th>End Date</th>
                            <th>Reason</th>
                            <th>Requested On</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pendingRequests.map(req => (
                            <tr key={req.id}>
                                <td>{req.requesterName || 'N/A'}</td>
                                <td>{req.requesterUsername || 'N/A'}</td>
                                <td>{LEAVE_TYPE_DISPLAY[req.leaveType] || req.leaveType || 'N/A'}</td> {/* <<< DISPLAY LEAVE TYPE */}
                                <td>{formatDate(req.startDate)}</td>
                                <td>{formatDate(req.endDate)}</td>
                                <td style={{ maxWidth: '250px', whiteSpace: 'normal' }}>{req.reason}</td>
                                <td>{formatDateTime(req.requestDate)}</td>
                                <td className="action-cell">
                                    <button
                                        className="approve-btn"
                                        onClick={() => handleAction('approve', req.id)}
                                        disabled={actionLoading === req.id}
                                    >
                                        {actionLoading === req.id ? '...' : 'Approve'}
                                    </button>
                                    <button
                                        className="reject-btn"
                                        onClick={() => handleAction('reject', req.id)}
                                        disabled={actionLoading === req.id}
                                    >
                                        {actionLoading === req.id ? '...' : 'Reject'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </RequestTable>
            )}
        </ApprovalContainer>
    );
};

export default AdminLeaveApprovalPage;