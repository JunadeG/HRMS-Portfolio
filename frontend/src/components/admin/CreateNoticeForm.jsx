// src/components/admin/CreateNoticeForm.jsx
import React, { useState } from 'react';
import styled from 'styled-components';
import { createNotice } from '../../services/apiService';

// Styled Components using CSS Variables
const FormContainer = styled.form`
  background-color: var(--background-secondary);
  color: var(--text-primary);
  padding: 25px 30px; border-radius: 8px;
  box-shadow: 0 2px 8px var(--shadow-color);
  display: flex; flex-direction: column; gap: 18px;
  max-width: 650px; margin: 30px auto;
  border: 1px solid var(--border-primary);
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
`;

const FormTitle = styled.h2`
    text-align: center; color: var(--text-primary); margin-bottom: 15px; font-weight: 600;
    border-bottom: 1px solid var(--border-secondary); padding-bottom: 10px;
`;

const FormGroup = styled.div` display: flex; flex-direction: column; `;

const Label = styled.label` margin-bottom: 6px; font-weight: 600; font-size: 0.9em; color: var(--text-secondary); `;

const Input = styled.input`
  padding: 10px 12px; border: 1px solid var(--border-primary); border-radius: 4px; font-size: 1em;
  background-color: var(--background-secondary); color: var(--text-primary); transition: border-color 0.2s ease, box-shadow 0.2s ease;
   &:focus { outline: none; border-color: var(--border-accent); box-shadow: 0 0 0 2px color-mix(in srgb, var(--border-accent) 25%, transparent); }
   &:disabled { background-color: var(--background-tertiary); opacity: 0.7; cursor: not-allowed; }
`;

const Select = styled.select`
  padding: 10px 12px; border: 1px solid var(--border-primary); border-radius: 4px; font-size: 1em;
  background-color: var(--background-secondary); color: var(--text-primary); transition: border-color 0.2s ease, box-shadow 0.2s ease;
   &:focus { outline: none; border-color: var(--border-accent); box-shadow: 0 0 0 2px color-mix(in srgb, var(--border-accent) 25%, transparent); }
   &:disabled { background-color: var(--background-tertiary); opacity: 0.7; cursor: not-allowed; }
`;

const Button = styled.button`
  padding: 12px 20px; background-color: var(--text-accent); color: var(--text-on-accent);
  border: none; border-radius: 5px; cursor: pointer; font-size: 1em; font-weight: 500;
  margin-top: 10px; transition: background-color 0.2s, opacity 0.2s;
  &:hover:not(:disabled) { background-color: color-mix(in srgb, var(--text-accent) 85%, black); }
  &:disabled { background-color: var(--text-muted); opacity: 0.6; cursor: not-allowed; }
`;

const CreateNoticeForm = () => {
    // State and logic remain the same
    const [subject, setSubject] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [time, setTime] = useState('');
    const [priority, setPriority] = useState('MEDIUM');
    const [audience, setAudience] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const clearMessages = () => { setError(''); setSuccess(''); };
    const resetForm = () => { setSubject(''); setStartDate(''); setEndDate(''); setTime(''); setPriority('MEDIUM'); setAudience(''); };
    const handleSubmit = async (e) => { /* ... keep logic ... */
        e.preventDefault(); clearMessages(); setIsSubmitting(true);
        if (!subject.trim() || !startDate || !priority || !audience.trim()) { setError('Required fields missing.'); setIsSubmitting(false); return; }
        if (endDate && startDate && endDate < startDate) { setError('End date cannot be before start date.'); setIsSubmitting(false); return; }
        const noticeData = { subject: subject.trim(), startDate, endDate: endDate || null, time: time || null, priority, audience: audience.trim(), };
        try { await createNotice(noticeData); setSuccess('Notice created!'); resetForm(); setTimeout(clearMessages, 5000); }
        catch (err) { if (err.details && typeof err.details === 'object') { const validationErrors = Object.entries(err.details).map(([field, message]) => `${field}: ${message}`).join('\n'); setError(`Validation Failed:\n${validationErrors}`); } else { setError(err.message || 'Failed create notice.'); } }
        finally { setIsSubmitting(false); }
    };

    return (
        <FormContainer onSubmit={handleSubmit} className="form-container">
            <FormTitle>Create New Notice</FormTitle>
            {error && <p className="message-display error">{error}</p>}
            {success && <p className="message-display success">{success}</p>}

            <FormGroup>
                <Label htmlFor="subject">Subject *</Label>
                <Input type="text" id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} required maxLength={255} disabled={isSubmitting} />
            </FormGroup>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                <FormGroup style={{ flex: 1, minWidth: '180px' }}>
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} required disabled={isSubmitting} />
                </FormGroup>
                <FormGroup style={{ flex: 1, minWidth: '180px' }}>
                    <Label htmlFor="endDate">End Date (Optional)</Label>
                    <Input type="date" id="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} disabled={isSubmitting} min={startDate || undefined} />
                </FormGroup>
            </div>
            <FormGroup>
                <Label htmlFor="time">Time (Optional)</Label>
                <Input type="time" id="time" value={time} onChange={(e) => setTime(e.target.value)} disabled={isSubmitting} />
            </FormGroup>
            <FormGroup>
                <Label htmlFor="priority">Priority *</Label>
                <Select id="priority" value={priority} onChange={(e) => setPriority(e.target.value)} required disabled={isSubmitting}>
                    <option value="HIGH">High</option> <option value="MEDIUM">Medium</option> <option value="LOW">Low</option>
                </Select>
            </FormGroup>
            <FormGroup>
                <Label htmlFor="audience">Audience *</Label>
                <Input type="text" id="audience" placeholder='e.g., All, Developers, IT Department' value={audience} onChange={(e) => setAudience(e.target.value)} required maxLength={255} disabled={isSubmitting} />
            </FormGroup>
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Notice'}
            </Button>
        </FormContainer>
    );
};

export default CreateNoticeForm;