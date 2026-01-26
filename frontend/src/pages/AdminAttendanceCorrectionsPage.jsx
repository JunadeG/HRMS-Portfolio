// src/pages/AdminAttendanceCorrectionsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { fetchPendingAttendanceCorrections, approveAttendanceCorrection, rejectAttendanceCorrection } from '../services/apiService';

// --- Styled Components (reusing from other admin pages) ---
const PageContainer = styled.div` padding: 30px; max-width: 1400px; margin: 20px auto; `;
const PageTitle = styled.h2` color: var(--text-primary); margin-bottom: 25px; border-bottom: 2px solid var(--text-accent); padding-bottom: 10px; `;
const RequestTable = styled.table` width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 0.9em; th, td { border: 1px solid var(--border-primary); padding: 10px 12px; text-align: left; vertical-align: middle; } th { background-color: var(--background-tertiary); } tbody tr:hover { background-color: var(--background-hover); } button { padding: 5px 10px; margin: 0 4px; cursor: pointer; border: none; border-radius: 4px; font-size: 0.9em; color: white; } .approve-btn { background-color: #28a745; } .reject-btn { background-color: #dc3545; }`;
const TimeChange = styled.span` text-decoration: line-through; color: var(--text-muted); margin-right: 5px; `;

const AdminAttendanceCorrectionsPage = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [actionLoadingId, setActionLoadingId] = useState(null);

    const loadRequests = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchPendingAttendanceCorrections();
            setRequests(data || []);
        } catch (err) { setError(err.message || 'Failed to load requests.'); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { loadRequests(); }, [loadRequests]);

    const handleAction = async (actionType, correctionId) => {
        setActionLoadingId(correctionId);
        setError(''); setSuccess('');
        try {
            const actionFunc = actionType === 'approve' ? approveAttendanceCorrection : rejectAttendanceCorrection;
            const result = await actionFunc(correctionId);
            setSuccess(result.message);
            setRequests(prev => prev.filter(req => req.correctionId !== correctionId));
        } catch (err) { setError(err.message || 'Action failed.'); }
        finally { setActionLoadingId(null); }
    };

    return (
        <PageContainer>
            <PageTitle>Pending Attendance Corrections</PageTitle>
            {error && <p className="message-display error">{error}</p>}
            {success && <p className="message-display success">{success}</p>}

            {loading ? <p>Loading requests...</p> : requests.length === 0 ? <p>No pending attendance correction requests.</p> : (
                <RequestTable>
                    <thead><tr><th>Requester</th><th>Date</th><th>Original Times</th><th>Requested Times</th><th>Reason</th><th>Actions</th></tr></thead>
                    <tbody>
                        {requests.map(req => (
                            <tr key={req.correctionId}>
                                <td>{req.requesterName}</td>
                                <td>{req.attendanceDate}</td>
                                <td>{req.originalCheckIn || '--'} / {req.originalCheckOut || '--'}</td>
                                <td>
                                    {req.requestedCheckIn && <div><TimeChange>{req.originalCheckIn}</TimeChange> &rarr; {req.requestedCheckIn}</div>}
                                    {req.requestedCheckOut && <div><TimeChange>{req.originalCheckOut}</TimeChange> &rarr; {req.requestedCheckOut}</div>}
                                </td>
                                <td style={{whiteSpace: 'normal', minWidth: '250px'}}>{req.reason}</td>
                                <td>
                                    <button className="approve-btn" onClick={() => handleAction('approve', req.correctionId)} disabled={actionLoadingId === req.correctionId}>Approve</button>
                                    <button className="reject-btn" onClick={() => handleAction('reject', req.correctionId)} disabled={actionLoadingId === req.correctionId}>Reject</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </RequestTable>
            )}
        </PageContainer>
    );
};

export default AdminAttendanceCorrectionsPage;