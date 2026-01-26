// src/pages/AdminDocumentVerificationPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { fetchPendingAttendanceCorrections, approveAttendanceCorrection, rejectAttendanceCorrection } from '../services/apiService'; // Reusing these imports for now, will create specific ones
import { fetchPendingVerificationDocs, verifyDocument, API_BASE_URL } from '../services/apiService';

// --- Styled Components ---
const PageContainer = styled.div` padding: 30px; max-width: 1400px; margin: 20px auto; `;
const PageTitle = styled.h2` color: var(--text-primary); margin-bottom: 25px; border-bottom: 2px solid var(--text-accent); padding-bottom: 10px; `;
const DocTable = styled.table` width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 0.9em; th, td { border: 1px solid var(--border-primary); padding: 10px 12px; text-align: left; vertical-align: middle; } th { background-color: var(--background-tertiary); } tbody tr:hover { background-color: var(--background-hover); } button { padding: 5px 10px; margin: 0 4px; cursor: pointer; border: none; border-radius: 4px; font-size: 0.9em; color: white; } .approve-btn { background-color: #28a745; } .reject-btn { background-color: #dc3545; }`;

const AdminDocumentVerificationPage = () => {
    const [pendingDocs, setPendingDocs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [actionLoadingId, setActionLoadingId] = useState(null);

    const loadPendingDocs = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchPendingVerificationDocs();
            setPendingDocs(data || []);
        } catch (err) { setError(err.message || 'Failed to load documents.'); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { loadPendingDocs(); }, [loadPendingDocs]);

    const handleVerification = async (documentId, isApproved) => {
        const notes = isApproved ? 'Document verified and approved.' : prompt('Please provide a reason for rejection:');
        if (!isApproved && !notes) return; // Don't proceed if rejection reason is cancelled

        setActionLoadingId(documentId);
        setError(''); setSuccess('');
        try {
            await verifyDocument(documentId, isApproved, notes);
            setSuccess(`Document ${documentId} has been ${isApproved ? 'approved' : 'rejected'}.`);
            setPendingDocs(prev => prev.filter(doc => doc.id !== documentId));
        } catch (err) { setError(err.message || 'Action failed.'); }
        finally { setActionLoadingId(null); }
    };

    return (
        <PageContainer>
            <PageTitle>Pending Document Verification</PageTitle>
            {error && <p className="message-display error">{error}</p>}
            {success && <p className="message-display success">{success}</p>}
            
            {loading ? <p>Loading documents...</p> : pendingDocs.length === 0 ? <p>No documents are currently pending verification.</p> : (
                <DocTable>
                    <thead><tr><th>Employee Name</th><th>Document Type</th><th>Uploaded On</th><th>View</th><th>Actions</th></tr></thead>
                    <tbody>
                        {pendingDocs.map(doc => (
                            <tr key={doc.id}>
                                <td>{doc.employeeName || 'N/A'}</td>
                                <td>{doc.documentType.replace('_', ' ')}</td>
                                <td>{new Date(doc.uploadDate).toLocaleString()}</td>
                                <td><a href={`${API_BASE_URL}${doc.filePath}`} target="_blank" rel="noopener noreferrer">View Document</a></td>
                                <td>
                                    <button className="approve-btn" onClick={() => handleVerification(doc.id, true)} disabled={actionLoadingId === doc.id}>Approve</button>
                                    <button className="reject-btn" onClick={() => handleVerification(doc.id, false)} disabled={actionLoadingId === doc.id}>Reject</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </DocTable>
            )}
        </PageContainer>
    );
};

export default AdminDocumentVerificationPage;