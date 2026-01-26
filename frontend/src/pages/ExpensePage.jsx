import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { submitExpenseClaim, fetchMyClaims } from '../services/apiService';

const PageContainer = styled.div` padding: 30px; max-width: 1000px; margin: 20px auto; background-color: var(--background-secondary); border-radius: 8px; box-shadow: 0 2px 10px var(--shadow-color);`;
const PageTitle = styled.h2` color: var(--text-primary); margin-bottom: 25px; border-bottom: 2px solid var(--text-accent); padding-bottom: 10px;`;
const SectionTitle = styled.h3` margin-top: 30px; margin-bottom: 15px; color: var(--text-accent); border-bottom: 1px solid var(--border-secondary); padding-bottom: 8px;`;
const Form = styled.form` display: flex; flex-direction: column; gap: 15px; background-color: var(--background-tertiary); padding: 20px; border-radius: 8px; margin-bottom: 30px;`;
const FormGroup = styled.div` display: flex; flex-direction: column; `;
const Label = styled.label` margin-bottom: 5px; font-weight: 600; `;
const Input = styled.input` padding: 8px; border-radius: 4px; border: 1px solid var(--border-primary); `;
const Button = styled.button` padding: 10px 18px; border: none; border-radius: 5px; cursor: pointer; background-color: var(--text-accent); color: var(--text-on-accent); &:disabled { opacity: 0.5; }`;
const HistoryTable = styled.table` width: 100%; border-collapse: collapse; margin-top: 15px; th, td { border: 1px solid var(--border-primary); padding: 8px; } th { background-color: var(--background-tertiary); }`;
const StatusBadge = styled.span` padding: 3px 8px; border-radius: 12px; font-size: 0.8em; color: white; &.status-pending { background-color: #ffc107; color: #333; } &.status-approved { background-color: #28a745; } &.status-rejected { background-color: #dc3545; } &.status-paid { background-color: #17a2b8; }`;

const ExpensePage = () => {
    const [claims, setClaims] = useState([]);
    const [newClaim, setNewClaim] = useState({ purpose: '', amount: '' });
    const [receiptFile, setReceiptFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const loadClaims = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchMyClaims();
            setClaims(data || []);
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { loadClaims(); }, [loadClaims]);

    const handleFileChange = (e) => setReceiptFile(e.target.files[0]);
    const handleInputChange = (e) => setNewClaim({ ...newClaim, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newClaim.purpose || !newClaim.amount) { setError("Purpose and amount are required."); return; }
        setSubmitting(true); setError(''); setSuccess('');
        
        const formData = new FormData();
        formData.append('purpose', newClaim.purpose);
        formData.append('amount', newClaim.amount);
        if (receiptFile) { formData.append('receipt', receiptFile); }

        try {
            await submitExpenseClaim(formData);
            setSuccess('Expense claim submitted successfully!');
            setNewClaim({ purpose: '', amount: '' });
            setReceiptFile(null);
            e.target.reset(); // Reset file input
            loadClaims(); // Refresh list
        } catch (err) { setError(err.message); }
        finally { setSubmitting(false); }
    };

    return (
        <PageContainer>
            <PageTitle>Expense Reimbursement</PageTitle>
            {error && <p className="message-display error">{error}</p>}
            {success && <p className="message-display success">{success}</p>}

            <SectionTitle>Submit New Claim</SectionTitle>
            <Form onSubmit={handleSubmit}>
                <FormGroup>
                    <Label htmlFor="purpose">Purpose / Description *</Label>
                    <Input type="text" id="purpose" name="purpose" value={newClaim.purpose} onChange={handleInputChange} required />
                </FormGroup>
                <FormGroup>
                    <Label htmlFor="amount">Amount *</Label>
                    <Input type="number" id="amount" name="amount" value={newClaim.amount} onChange={handleInputChange} required step="0.01" min="0.01" />
                </FormGroup>
                <FormGroup>
                    <Label htmlFor="receipt">Upload Receipt (Optional)</Label>
                    <Input type="file" id="receipt" name="receipt" onChange={handleFileChange} />
                </FormGroup>
                <Button type="submit" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Claim'}</Button>
            </Form>
            
            <SectionTitle>My Claim History</SectionTitle>
            {loading ? <p>Loading history...</p> : (
                <HistoryTable>
                    <thead><tr><th>Date</th><th>Purpose</th><th>Amount</th><th>Status</th><th>Receipt</th></tr></thead>
                    <tbody>
                        {claims.map(claim => (
                            <tr key={claim.id}>
                                <td>{claim.submissionDate}</td>
                                <td>{claim.purpose}</td>
                                <td>{claim.amount.toFixed(2)}</td>
                                <td><StatusBadge className={`status-${claim.status.toLowerCase()}`}>{claim.status}</StatusBadge></td>
                                <td>{claim.receiptPath ? <a href={`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080'}${claim.receiptPath}`} target="_blank" rel="noopener noreferrer">View</a> : 'N/A'}</td>
                            </tr>
                        ))}
                    </tbody>
                </HistoryTable>
            )}
        </PageContainer>
    );
};

export default ExpensePage;