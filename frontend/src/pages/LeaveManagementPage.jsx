// src/pages/LeaveManagementPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { requestLeave, getMyLeaveRequests, cancelLeaveRequest, getMyLeaveBalances } from '../services/apiService';
import LeaveRequestForm from '../components/LeaveRequestForm';
import LeaveBalanceChart from '../components/LeaveBalanceChart';
import 'react-datepicker/dist/react-datepicker.css'; // DatePicker CSS

// --- Styled Components ---
const LeaveContainer = styled.div`
  padding: 30px;
  max-width: 1000px;
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

const RequestTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9em;
  margin-top: 15px;
  th, td {
    border: 1px solid var(--border-primary);
    padding: 8px 10px;
    text-align: left;
    vertical-align: middle;
  }
  th {
    background-color: var(--background-tertiary);
    color: var(--text-secondary);
    font-weight: 600;
  }
  tbody tr:nth-child(even) {
    background-color: var(--background-tertiary);
    opacity: 0.95;
  }
  tbody tr:hover { background-color: var(--background-hover); }
  td:last-child { text-align: center; } /* Center align action buttons */
`;

const StatusBadge = styled.span`
    padding: 3px 8px;
    border-radius: 12px;
    font-size: 0.8em;
    font-weight: 600;
    color: white;
    text-transform: uppercase;
    background-color: grey; /* Default */
    &.status-pending { background-color: #ffc107; color: #333; }
    &.status-approved { background-color: #28a745; }
    &.status-rejected { background-color: #dc3545; }
    &.status-cancelled { background-color: #6c757d; }
`;

const CancelButton = styled.button`
  padding: 4px 8px;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85em;
  transition: background-color 0.2s, opacity 0.2s;
  &:hover:not(:disabled) { background-color: #5a6268; }
  &:disabled { background-color: var(--text-muted); opacity: 0.6; cursor: not-allowed; }
`;

const LoadingText = styled.p` color: var(--text-secondary); text-align: center; padding: 20px; font-style: italic;`;
const ErrorDisplay = styled.p` /* Using global .message-display.error from themes.css */ `;
const InfoDisplay = styled.p` /* Using global .message-display.success or .info from themes.css */ `;

const BalancesAndChartContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    margin-top: 20px;
    margin-bottom: 30px;
    padding-top: 20px;
    border-top: 1px solid var(--border-secondary);
`;

const BalancesSection = styled.div`
    flex: 1 1 300px;
    padding: 20px;
    background-color: var(--background-tertiary);
    border: 1px solid var(--border-primary);
    border-radius: 6px;
    h4 {
        margin-top:0;
        margin-bottom: 15px;
        color: var(--text-accent);
        font-size: 1.1em;
        border-bottom: 1px solid var(--border-secondary);
        padding-bottom: 8px;
    }
`;
const BalanceItem = styled.p`
    margin: 10px 0;
    font-size: 0.95em;
    color: var(--text-primary);
    display: flex;
    justify-content: space-between;
    strong {
        color: var(--text-secondary);
        font-weight: 500;
    }
    span {
        font-weight: 600;
    }
`;
const ChartContainer = styled.div`
    flex: 2 1 400px;
    min-width: 300px;
    padding: 20px;
    background-color: var(--background-secondary);
    border: 1px solid var(--border-primary);
    border-radius: 6px;
    display: flex;
    flex-direction: column;
    justify-content: center;
`;
// --- END NEW STYLES ---

// Matches backend LeaveType enum for display purposes
const LEAVE_TYPE_DISPLAY = {
    PAID_LEAVE: 'Paid Leave',
    SICK_LEAVE: 'Sick Leave',
    UNPAID_LEAVE: 'Unpaid Leave',
    FLOATER_LEAVE: 'Floater Leave',
};

const LeaveManagementPage = () => {
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [leaveBalances, setLeaveBalances] = useState(null);
    const [loadingRequests, setLoadingRequests] = useState(true);
    const [loadingBalances, setLoadingBalances] = useState(true);
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [cancellingId, setCancellingId] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const clearMessages = () => { setError(''); setSuccess(''); };

    const fetchRequests = useCallback(async () => {
        if (!cancellingId) setLoadingRequests(true);
        // Do not clear error/success here to allow messages from other actions to persist
        try {
            const data = await getMyLeaveRequests();
            const sortedData = (data || []).sort((a, b) =>
                new Date(b.requestDate) - new Date(a.requestDate)
            );
            setLeaveRequests(sortedData);
        } catch (err) {
            console.error("Error fetching leave requests:", err);
            setError(prev => (prev ? prev + "; " : "") + `Failed to load leave requests: ${err.message}`);
            setLeaveRequests([]);
        } finally {
            if (!cancellingId) setLoadingRequests(false);
        }
    }, [cancellingId]);

    const fetchBalances = useCallback(async () => {
        setLoadingBalances(true);
        // Do not clear error/success here
        try {
            const data = await getMyLeaveBalances();
            setLeaveBalances(data);
        } catch (err) {
            console.error("Error fetching leave balances:", err);
            setError(prev => (prev ? prev + "; " : "") + `Failed to load leave balances: ${err.message}`);
            setLeaveBalances(null);
        } finally {
            setLoadingBalances(false);
        }
    }, []);

    useEffect(() => {
        fetchRequests();
        fetchBalances();
    }, [fetchRequests, fetchBalances]);

    const handleLeaveSubmit = async (leaveData) => {
        setLoadingSubmit(true);
        clearMessages(); // Clear previous messages before new submission
        try {
            const newRequest = await requestLeave(leaveData);
            setSuccess('Leave request submitted successfully!');
            setLeaveRequests(prev =>
                [newRequest, ...prev].sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate))
            );
            // Conditionally refresh balances if the leave type affects them.
            // Note: Balances are only *deducted* on approval by admin,
            // but fetching here ensures the UI reflects any immediate state change if your backend were to pre-validate.
            // For now, it primarily ensures the UI is consistent if the backend ever changes to deduct on submit (unlikely for this flow).
            if (leaveData.leaveType === 'PAID_LEAVE' || leaveData.leaveType === 'SICK_LEAVE' || leaveData.leaveType === 'FLOATER_LEAVE') {
                fetchBalances();
            }
        } catch (err) {
            console.error("Error submitting leave request:", err);
            setError(`Failed to submit request: ${err.message}`);
        } finally {
            setLoadingSubmit(false);
            setTimeout(clearMessages, 7000); // Longer timeout for user to read message
        }
    };

    const handleCancel = async (requestId) => {
        if (!window.confirm(`Are you sure you want to cancel leave request ID ${requestId}? This cannot be undone.`)) {
            return;
        }
        setCancellingId(requestId);
        clearMessages(); // Clear previous messages
        try {
            const requestToCancel = leaveRequests.find(req => req.id === requestId);

            await cancelLeaveRequest(requestId);
            setSuccess(`Leave request ${requestId} cancelled successfully.`);
            setLeaveRequests(prev => prev.map(req =>
                req.id === requestId ? { ...req, status: 'CANCELLED' } : req
            ));

            // If a leave type that *would have affected* balances upon approval was cancelled,
            // it's good practice to refresh balances, though no deduction had occurred yet.
            // This keeps the UI consistent.
            if (requestToCancel && (requestToCancel.leaveType === 'PAID_LEAVE' || requestToCancel.leaveType === 'SICK_LEAVE' || requestToCancel.leaveType === 'FLOATER_LEAVE')) {
                fetchBalances();
            }
        } catch (err) {
            console.error(`Error cancelling leave request ${requestId}:`, err);
            if (err.message.includes('404') || err.message.toLowerCase().includes('not found')) {
                 setError(`Failed to cancel request ${requestId}: The cancel feature might not be available yet or the request was already processed.`);
            } else {
                setError(`Failed to cancel request ${requestId}: ${err.message}`);
            }
        } finally {
            setCancellingId(null);
            setTimeout(clearMessages, 7000); // Longer timeout
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

    const getStatusClass = (status) => `status-${status?.toLowerCase() || 'unknown'}`;

    return (
        <LeaveContainer>
            <PageTitle>Leave Management</PageTitle>

            {/* Global error/success messages for the page */}
            {error && <ErrorDisplay className="message-display error">{error}</ErrorDisplay>}
            {success && !error && <InfoDisplay className="message-display success">{success}</InfoDisplay>}

            <LeaveRequestForm onSubmit={handleLeaveSubmit} isSubmitting={loadingSubmit} />

            <SectionTitle>My Leave Balances</SectionTitle>
            {loadingBalances ? (
                <LoadingText>Loading balances...</LoadingText>
            ) : leaveBalances ? (
                <BalancesAndChartContainer>
                    <BalancesSection>
                        <h4>Current Balances</h4>
                        <BalanceItem><strong>Paid Leave:</strong> <span>{leaveBalances.paidLeaveBalance.toFixed(1)} days</span></BalanceItem>
                        <BalanceItem><strong>Sick Leave:</strong> <span>{leaveBalances.sickLeaveBalance.toFixed(1)} days</span></BalanceItem>
                        <BalanceItem><strong>Floater Leave:</strong> <span>{leaveBalances.floaterLeaveBalance.toFixed(1)} days</span></BalanceItem>
                        <BalanceItem><strong>Unpaid Leave:</strong> <span>Tracked as requested</span></BalanceItem>
                    </BalancesSection>
                    <ChartContainer>
                        <LeaveBalanceChart balances={{
                            paidLeaveBalance: leaveBalances.paidLeaveBalance,
                            sickLeaveBalance: leaveBalances.sickLeaveBalance,
                            floaterLeaveBalance: leaveBalances.floaterLeaveBalance
                            // Unpaid leave is not charted as a "balance"
                        }} />
                    </ChartContainer>
                </BalancesAndChartContainer>
            ) : (
                // Only show "balances unavailable" if there isn't already a more specific "failed to load balances" error
                !error.includes("Failed to load leave balances") &&
                <InfoDisplay className="message-display info">Leave balances are currently unavailable.</InfoDisplay>
            )}

            <SectionTitle>My Leave Requests</SectionTitle>
            {loadingRequests ? (
                <LoadingText>Loading leave history...</LoadingText>
            ) : leaveRequests.length === 0 && !error.includes("Failed to load leave requests") ? (
                <InfoDisplay className="message-display info">You have no leave requests.</InfoDisplay>
            ) : (
                <RequestTable>
                    <thead>
                        <tr>
                            <th>Leave Type</th>
                            <th>Start Date</th>
                            <th>End Date</th>
                            <th>Reason</th>
                            <th>Status</th>
                            <th>Requested On</th>
                            <th>Actioned By / On</th>
                            <th>Actions</th>
                            
                        </tr>
                    </thead>
                    <tbody>
                        {leaveRequests.map(req => (
                            <tr key={req.id}>
                                <td>{LEAVE_TYPE_DISPLAY[req.leaveType] || req.leaveType || 'N/A'}</td>
                                <td>{formatDate(req.startDate)}</td>
                                <td>{formatDate(req.endDate)}</td>
                                <td style={{ maxWidth: '200px', whiteSpace: 'normal' }}>{req.reason}</td>
                                <td>
                                    <StatusBadge className={getStatusClass(req.status)}>
                                        {req.status || 'N/A'}
                                    </StatusBadge>
                                </td>
                                <td>{formatDateTime(req.requestDate)}</td>
                                <td>
                                    {req.approverName && !['PENDING', 'CANCELLED'].includes(req.status)
                                        ? `${req.approverName} (${formatDateTime(req.approvalDate)})`
                                        : (req.status !== 'PENDING' && req.status !== 'CANCELLED' ? 'N/A' : '')}
                                </td>
                                <td>
                                    {req.status === 'PENDING' && (
                                        <CancelButton
                                            onClick={() => handleCancel(req.id)}
                                            disabled={cancellingId === req.id}
                                        >
                                            {cancellingId === req.id ? '...' : 'Cancel'}
                                        </CancelButton>
                                    )}
                                    {/* No action shown for non-pending requests from user's view */}
                                    {req.status !== 'PENDING' && '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </RequestTable>
            )}
        </LeaveContainer>
    );
};

export default LeaveManagementPage;