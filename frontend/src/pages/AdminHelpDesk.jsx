// src/pages/AdminHelpDeskPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { 
    fetchAllCompanyTickets, 
    fetchTicketDetailsForAdmin, 
    addCommentToTicket,
    updateTicketStatus,
    assignTicket,
    fetchAssignableUsers
} from '../services/apiService';
import { FaPaperPlane } from 'react-icons/fa';

// --- Styled Components ---
const PageContainer = styled.div`
  padding: 30px;
  max-width: 1600px;
  margin: 20px auto;
`;

const PageTitle = styled.h2`
  color: var(--text-primary);
  margin-bottom: 25px;
  border-bottom: 2px solid var(--text-accent);
  padding-bottom: 10px;
`;

const MainGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 30px;
  align-items: start;
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const TicketListContainer = styled.div`
  background-color: var(--background-secondary);
  border-radius: 8px;
  border: 1px solid var(--border-primary);
  max-height: 80vh;
  overflow-y: auto;
`;

const TicketListItem = styled.div`
  padding: 15px;
  border-bottom: 1px solid var(--border-secondary);
  cursor: pointer;
  background-color: ${props => props.$isSelected ? 'var(--background-hover)' : 'transparent'};
  border-left: 5px solid ${props => props.$isSelected ? 'var(--text-accent)' : 'transparent'};

  &:hover {
    background-color: var(--background-hover);
  }
  h5 { margin: 0 0 5px 0; color: var(--text-primary); }
  p { margin: 0; font-size: 0.9em; color: var(--text-secondary); }
`;

const TicketDetailContainer = styled.div`
  background-color: var(--background-secondary);
  border-radius: 8px;
  border: 1px solid var(--border-primary);
  padding: 25px;
  min-height: 500px;
`;

const StatusPill = styled.span`
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.85em;
  font-weight: 600;
  color: #fff;
  &.status-OPEN { background-color: #0d6efd; }
  &.status-IN_PROGRESS { background-color: #ffc107; color: #212529; }
  &.status-CLOSED { background-color: var(--text-muted); }
`;

const CommentSection = styled.div`
  margin-top: 20px;
  border-top: 1px solid var(--border-secondary);
  padding-top: 15px;
`;
const CommentForm = styled.form`
  display: flex;
  gap: 10px;
  margin-top: 15px;
`;
const CommentInput = styled.input`
  flex-grow: 1;
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid var(--border-primary);
`;
const PostButton = styled.button`
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  background-color: var(--text-accent);
  color: white;
  cursor: pointer;
`;

const AdminHelpDeskPage = () => {
    const [allTickets, setAllTickets] = useState([]);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [assignableUsers, setAssignableUsers] = useState([]);
    const [loading, setLoading] = useState({ list: true, detail: false });
    const [error, setError] = useState('');
    const [newComment, setNewComment] = useState('');

    const TICKET_CATEGORIES = { 'IT_SUPPORT': 'IT Support', 'HR_QUERY': 'HR Query', 'PAYROLL_ISSUE': 'Payroll Issue' };
    const TICKET_STATUSES = ['OPEN', 'IN_PROGRESS', 'CLOSED'];

    const loadAllTickets = useCallback(async () => {
        setLoading(prev => ({ ...prev, list: true }));
        try {
            const data = await fetchAllCompanyTickets();
            setAllTickets(data || []);
        } catch (err) {
            setError(err.message || 'Failed to load tickets.');
        } finally {
            setLoading(prev => ({ ...prev, list: false }));
        }
    }, []);

    useEffect(() => {
        loadAllTickets();
        fetchAssignableUsers().then(setAssignableUsers);
    }, [loadAllTickets]);

    const handleSelectTicket = async (ticketId) => {
        setLoading(prev => ({ ...prev, detail: true }));
        setSelectedTicket(null);
        setError('');
        try {
            const data = await fetchTicketDetailsForAdmin(ticketId);
            setSelectedTicket(data);
        } catch (err) {
            setError(err.message || 'Failed to load ticket details.');
        } finally {
            setLoading(prev => ({ ...prev, detail: false }));
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || !selectedTicket) return;
        try {
            const addedComment = await addCommentToTicket(selectedTicket.id, newComment);
            setSelectedTicket(prev => ({
                ...prev,
                comments: [...prev.comments, addedComment]
            }));
            setNewComment('');
        } catch (err) {
            setError(err.message || 'Failed to add comment.');
        }
    };

    const handleStatusChange = async (e) => {
        const newStatus = e.target.value;
        try {
            const updatedTicket = await updateTicketStatus(selectedTicket.id, newStatus);
            setSelectedTicket(updatedTicket);
            loadAllTickets();
        } catch (err) {
            setError(err.message || 'Failed to update status.');
        }
    };

    const handleAssigneeChange = async (e) => {
        const assigneeId = e.target.value;
        if (!assigneeId) return;
        try {
            const updatedTicket = await assignTicket(selectedTicket.id, assigneeId);
            setSelectedTicket(updatedTicket);
            loadAllTickets();
        } catch (err) {
            setError(err.message || 'Failed to assign ticket.');
        }
    };

    return (
        <PageContainer>
            <PageTitle>Manage Help Desk Tickets</PageTitle>
            {error && <p className="message-display error">{error}</p>}
            
            <MainGrid>
                <TicketListContainer>
                    {loading.list ? <p style={{padding: '15px'}}>Loading tickets...</p> : allTickets.map(ticket => (
                        <TicketListItem 
                            key={ticket.id} 
                            onClick={() => handleSelectTicket(ticket.id)}
                            $isSelected={selectedTicket?.id === ticket.id}
                        >
                            <h5>#{ticket.id} - {ticket.subject}</h5>
                            <p>
                                <strong>Requester:</strong> {ticket.creatorName} | 
                                <strong> Status:</strong> <StatusPill className={`status-${ticket.status.replace('_', '-')}`}>{ticket.status.replace('_', ' ')}</StatusPill>
                            </p>
                        </TicketListItem>
                    ))}
                </TicketListContainer>

                <TicketDetailContainer>
                    {loading.detail ? <p>Loading details...</p> : !selectedTicket ? (
                        <p>Select a ticket from the list to view its details.</p>
                    ) : (
                        <div>
                            <h3>#{selectedTicket.id}: {selectedTicket.subject}</h3>
                            <div>
                                <p><strong>Requester:</strong> {selectedTicket.creatorName}</p>
                                <p><strong>Category:</strong> {TICKET_CATEGORIES[selectedTicket.category]}</p>
                                <p><strong>Submitted:</strong> {new Date(selectedTicket.createdAt).toLocaleString()}</p>
                                <p><strong>Assigned To:</strong> {selectedTicket.assigneeName}</p>
                            </div>

                            <div style={{ display: 'flex', gap: '20px', margin: '20px 0' }}>
                                <select value={selectedTicket.status} onChange={handleStatusChange}>
                                    {TICKET_STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                                </select>
                                <select value={selectedTicket.assigneeId || ''} onChange={handleAssigneeChange}>
                                    <option value="">Unassigned</option>
                                    {assignableUsers.map(u => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
                                </select>
                            </div>

                            <p style={{ whiteSpace: 'pre-wrap', backgroundColor: 'var(--background-tertiary)', padding: '15px', borderRadius: '4px' }}>{selectedTicket.description}</p>

                            <CommentSection>
                                <h4>Conversation</h4>
                                {(selectedTicket.comments || []).map((comment, index) => (
                                    <div key={index} style={{marginBottom: '15px', borderBottom: '1px solid var(--border-secondary)', paddingBottom: '10px'}}>
                                        <strong>{comment.authorName}</strong> <small>({new Date(comment.createdAt).toLocaleString()})</small>
                                        <p style={{margin: '5px 0 0 0'}}>{comment.content}</p>
                                    </div>
                                ))}
                                <CommentForm onSubmit={handleAddComment}>
                                    <CommentInput 
                                        type="text" 
                                        placeholder="Add a comment or update..." 
                                        value={newComment}
                                        onChange={e => setNewComment(e.target.value)}
                                    />
                                    <PostButton type="submit"><FaPaperPlane /></PostButton>
                                </CommentForm>
                            </CommentSection>
                        </div>
                    )}
                </TicketDetailContainer>
            </MainGrid>
        </PageContainer>
    );
};

export default AdminHelpDeskPage;