// src/components/AttendanceCorrectionModal.jsx
import React, { useState } from 'react';
import styled from 'styled-components';
import { requestAttendanceCorrection } from '../services/apiService';

// --- Styled Components ---
const ModalOverlay = styled.div` position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0, 0, 0, 0.7); display: flex; align-items: center; justify-content: center; z-index: 1050; animation: fadeIn 0.3s; `;
const ModalContent = styled.div` background-color: var(--background-secondary); padding: 25px; border-radius: 8px; width: 90%; max-width: 500px; position: relative; animation: fadeInUp 0.4s ease-out; `;
const CloseButton = styled.button` position: absolute; top: 10px; right: 10px; background: transparent; border: none; font-size: 1.5rem; color: var(--text-muted); cursor: pointer; `;
const Form = styled.form` display: flex; flex-direction: column; gap: 15px; `;
const FormGroup = styled.div` display: flex; flex-direction: column; gap: 5px; label { font-weight: 600; font-size: 0.9em; color: var(--text-secondary); } input, textarea { width: 100%; box-sizing: border-box; padding: 9px 12px; border: 1px solid var(--border-primary); border-radius: 4px; font-size: 1em; background-color: var(--background-secondary); color: var(--text-primary); } textarea { min-height: 100px; resize: vertical; } `;
const TimeDisplay = styled.div` background-color: var(--background-tertiary); padding: 8px; border-radius: 4px; font-style: italic; color: var(--text-muted); `;
const SubmitButton = styled.button` padding: 10px 18px; background-color: var(--text-accent); color: var(--text-on-accent); border: none; border-radius: 5px; cursor: pointer; font-weight: 500; align-self: flex-start; margin-top: 10px; &:disabled { opacity: 0.6; } `;

const AttendanceCorrectionModal = ({ record, onClose, onSubmitted }) => {
    const [checkIn, setCheckIn] = useState(record.checkInTime || '');
    const [checkOut, setCheckOut] = useState(record.checkOutTime || '');
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!reason.trim()) {
            setError('A reason for the correction is required.');
            return;
        }
        setIsSubmitting(true);
        setError('');
        try {
            const correctionData = {
                attendanceRecordId: record.id,
                requestedCheckInTime: checkIn,
                requestedCheckOutTime: checkOut,
                reason,
            };
            await requestAttendanceCorrection(correctionData);
            onSubmitted(); // Call the success handler from the parent
        } catch (err) {
            setError(err.message || 'Failed to submit request.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <ModalOverlay onClick={onClose}>
            <ModalContent onClick={e => e.stopPropagation()}>
                <CloseButton onClick={onClose}>&times;</CloseButton>
                <h3>Request Attendance Correction for {record.date}</h3>
                {error && <p className="message-display error">{error}</p>}
                <Form onSubmit={handleSubmit}>
                    <FormGroup>
                        <label>Original Clock In:</label>
                        <TimeDisplay>{record.checkInTime || 'Not recorded'}</TimeDisplay>
                    </FormGroup>
                    <FormGroup>
                        <label htmlFor="checkIn">Corrected Clock In:</label>
                        <input type="time" id="checkIn" value={checkIn} onChange={e => setCheckIn(e.target.value)} />
                    </FormGroup>
                    <FormGroup>
                        <label>Original Clock Out:</label>
                        <TimeDisplay>{record.checkOutTime || 'Not recorded'}</TimeDisplay>
                    </FormGroup>
                    <FormGroup>
                        <label htmlFor="checkOut">Corrected Clock Out:</label>
                        <input type="time" id="checkOut" value={checkOut} onChange={e => setCheckOut(e.target.value)} />
                    </FormGroup>
                    <FormGroup>
                        <label htmlFor="reason">Reason for Correction *</label>
                        <textarea id="reason" value={reason} onChange={e => setReason(e.target.value)} required minLength="10" />
                    </FormGroup>
                    <SubmitButton type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Submitting...' : 'Submit Request'}
                    </SubmitButton>
                </Form>
            </ModalContent>
        </ModalOverlay>
    );
};

export default AttendanceCorrectionModal;