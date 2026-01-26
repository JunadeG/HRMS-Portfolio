// src/pages/HelpDeskPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { createTicket, fetchMyTickets } from '../services/apiService';

// --- Styled Components ---
const PageContainer = styled.div`
  padding: 30px;
  max-width: 1100px;
  margin: 20px auto;
`;

const PageTitle = styled.h2`
  color: var(--text-primary);
  margin-bottom: 25px;
  border-bottom: 2px solid var(--text-accent);
  padding-bottom: 10px;
`;

const SectionTitle = styled.h3`
  margin-top: 30px;
  margin-bottom: 15px;
  color: var(--text-accent);
  border-bottom: 1px solid var(--border-secondary);
  padding-bottom: 8px;
`;

const TicketForm = styled.form`
  background-color: var(--background-secondary);
  padding: 25px;
  border-radius: 8px;
  border: 1px solid var(--border-primary);
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  label { font-weight: 600; }
  input, select, textarea {
    padding: 10px;
    border-radius: 4px;
    border: 1px solid var(--border-primary);
    background-color: var(--background-tertiary);
    color: var(--text-primary);
    font-size: 1em;
    &:focus {
        outline: none;
        border-color: var(--border-accent);
    }
  }
  textarea {
    min-height: 120px;
    resize: vertical;
  }
`;

const SubmitButton = styled.button`
  align-self: flex-start;
  padding: 10px 25px;
  background-color: var(--text-accent);
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1em;
  &:disabled { background-color: var(--text-muted); }
`;

const TicketTable = styled.table`
  width: 100%;
  margin-top: 20px;
  border-collapse: collapse;
  background-color: var(--background-secondary);
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--border-primary);

  th, td {
    padding: 12px 15px;
    text-align: left;
    border-bottom: 1px solid var(--border-secondary);
  }
  th { 
    background-color: var(--background-tertiary); 
    font-weight: 600;
  }
  tbody tr:hover {
    background-color: var(--background-hover);
  }
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


const HelpDeskPage = () => {
    const [myTickets, setMyTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('IT_SUPPORT');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const TICKET_CATEGORIES = {
        'IT_SUPPORT': 'IT Support',
        'HR_QUERY': 'HR Query',
        'PAYROLL_ISSUE': 'Payroll Issue'
    };

    // Fetch tickets from the API

    const loadTickets = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchMyTickets();
            setMyTickets(data || []);
        } catch (err) {
            setError(err.message || 'Failed to load your tickets.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadTickets();
    }, [loadTickets]);

    // Handle ticket submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        setSuccess('');
        try {
            await createTicket(subject, description, category);
            setSuccess('Your ticket has been submitted successfully!');
            setSubject('');
            setDescription('');
            setCategory('IT_SUPPORT');
            loadTickets(); // Refresh the list
        } catch (err) {
            setError(err.message || 'Failed to create ticket.');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    
    return ( 
        <PageContainer>
            <PageTitle>Help Desk</PageTitle>

            {error && <p className="message-display error">{error}</p>}
            {success && <p className="message-display success">{success}</p>}
            
            <SectionTitle>Create a New Ticket</SectionTitle> 

            <TicketForm onSubmit={handleSubmit}>
                <FormGroup>
                    <label htmlFor="category">Category</label>
                    <select id="category" value={category} onChange={e => setCategory(e.target.value)}>
                        {Object.entries(TICKET_CATEGORIES).map(([key, value]) => (
                            <option key={key} value={key}>{value}</option>
                        ))}
                    </select>
                </FormGroup>
                <FormGroup>
                    <label htmlFor="subject">Subject</label>
                    <input type="text" id="subject" value={subject} onChange={e => setSubject(e.target.value)} required maxLength="255" />
                </FormGroup>
                <FormGroup>
                    <label htmlFor="description">Please describe your issue in detail</label>
                    <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} required />
                </FormGroup>
                <SubmitButton type="submit" disabled={isSubmitting || !subject || !description}>
                    {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
                </SubmitButton>
            </TicketForm>

            <SectionTitle>My Tickets</SectionTitle>
            <TicketTable>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Subject</th>
                        <th>Category</th>
                        <th>Status</th>
                        <th>Last Updated</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr><td colSpan="5" style={{textAlign: 'center'}}>Loading tickets...</td></tr>
                    ) : myTickets.length > 0 ? (
                        myTickets.map(ticket => (
                            <tr key={ticket.id}>
                                <td>#{ticket.id}</td>
                                <td>{ticket.subject}</td>
                                <td>{TICKET_CATEGORIES[ticket.category]}</td>
                                <td>
                                    <StatusPill className={`status-${ticket.status}`}>
                                        {ticket.status.replace('_', ' ')}
                                    </StatusPill>
                                </td>
                                <td>{new Date(ticket.updatedAt).toLocaleString()}</td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan="5" style={{textAlign: 'center'}}>You have not submitted any tickets.</td></tr>
                    )}
                </tbody>
            </TicketTable>
        </PageContainer>
    );
};

export default HelpDeskPage;