import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { fetchPendingClaimsForAdmin, approveClaim, rejectClaim } from '../services/apiService';

// Reusing styled components
const PageContainer = styled.div` padding: 30px; max-width: 1200px; margin: 20px auto; background-color: var(--background-secondary); border-radius: 8px; box-shadow: 0 2px 10px var(--shadow-color);`;
const PageTitle = styled.h2` color: var(--text-primary); margin-bottom: 25px; border-bottom: 2px solid var(--text-accent); padding-bottom: 10px;`;
const ClaimsTable = styled.table` width: 100%; border-collapse: collapse; margin-top: 15px; th, td { border: 1px solid var(--border-primary); padding: 10px; } th { background-color: var(--background-tertiary); }`;
const Button = styled.button` padding: 5px 10px; margin: 0 4px; border: none; border-radius: 4px; cursor: pointer; color: white; &:disabled { opacity: 0.5; }`;
const ApproveButton = styled(Button)` background-color: #28a745; `;
const RejectButton = styled(Button)` background-color: #dc3545; `;

const AdminExpenseApprovalPage = () => {
    const [pendingClaims, setPendingClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoadingId, setActionLoadingId] = useState(null);

    const loadPendingClaims = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchPendingClaimsForAdmin();
            setPendingClaims(data || []);
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { loadPendingClaims(); }, [loadPendingClaims]);

    const handleAction = async (actionType, claimId) => {
        setActionLoadingId(claimId);
        try {
            if (actionType === 'approve') {
                await approveClaim(claimId);
            } else {
                await rejectClaim(claimId);
            }
            setPendingClaims(prev => prev.filter(c => c.id !== claimId));
        } catch (err) { setError(err.message); }
        finally { setActionLoadingId(null); }
    };

    return (
        <PageContainer>
            <PageTitle>Pending Expense Claim Approvals</PageTitle>
            {error && <p className="message-display error">{error}</p>}
            {loading ? <p>Loading claims...</p> : (
                <ClaimsTable>
                    <thead><tr><th>Employee</th><th>Date</th><th>Purpose</th><th>Amount</th><th>Receipt</th><th>Actions</th></tr></thead>
                    <tbody>
                        {pendingClaims.map(claim => (
                            <tr key={claim.id}>
                                <td>{claim.user?.username || 'N/A'}</td>
                                <td>{claim.submissionDate}</td>
                                <td>{claim.purpose}</td>
                                <td>{claim.amount.toFixed(2)}</td>
                                <td>{claim.receiptPath ? <a href={`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080'}${claim.receiptPath}`} target="_blank" rel="noopener noreferrer">View</a> : 'None'}</td>
                                <td>
                                    <ApproveButton onClick={() => handleAction('approve', claim.id)} disabled={actionLoadingId === claim.id}>Approve</ApproveButton>
                                    <RejectButton onClick={() => handleAction('reject', claim.id)} disabled={actionLoadingId === claim.id}>Reject</RejectButton>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </ClaimsTable>
            )}
            {!loading && pendingClaims.length === 0 && <p>No expense claims are pending approval.</p>}
        </PageContainer>
    );
};

export default AdminExpenseApprovalPage;