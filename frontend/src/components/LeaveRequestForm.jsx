// src/components/LeaveRequestForm.jsx
import React, { useState } from 'react';
import styled from 'styled-components';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// --- Styled Components ---
const Form = styled.form`
  background-color: var(--background-tertiary);
  color: var(--text-primary);
  padding: 20px;
  border-radius: 8px;
  border: 1px solid var(--border-secondary);
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;

  .react-datepicker-wrapper {
    width: 100%;
  }
`;
const FormGroup = styled.div` display: flex; flex-direction: column; `;
const Label = styled.label` margin-bottom: 5px; font-weight: 600; font-size: 0.9em; color: var(--text-secondary); `;
const DatePickerInputStyled = styled(DatePicker)`
  width: 100%;
  padding: 9px 11px;
  border: 1px solid var(--border-primary);
  border-radius: 4px;
  font-size: 1em;
  background-color: var(--background-secondary);
  color: var(--text-primary);
  box-sizing: border-box;
  &:focus { outline: none; border-color: var(--border-accent); box-shadow: 0 0 0 2px color-mix(in srgb, var(--border-accent) 25%, transparent); }
  &:disabled { background-color: var(--background-tertiary); opacity: 0.7; cursor: not-allowed; }
`;
const TextArea = styled.textarea`
   padding: 9px 11px; border: 1px solid var(--border-primary); border-radius: 4px; font-size: 1em;
   min-height: 80px; resize: vertical; background-color: var(--background-secondary); color: var(--text-primary);
    &:focus { outline: none; border-color: var(--border-accent); box-shadow: 0 0 0 2px color-mix(in srgb, var(--border-accent) 25%, transparent); }
     &:disabled { background-color: var(--background-tertiary); opacity: 0.7; cursor: not-allowed; }
`;
// --- Styled Select (Ensure this matches your other themed selects if you have a global one) ---
const SelectStyled = styled.select`
    width: 100%;
    padding: 9px 11px;
    border: 1px solid var(--border-primary);
    border-radius: 4px;
    font-size: 1em;
    background-color: var(--background-secondary);
    color: var(--text-primary);
    box-sizing: border-box;
    appearance: none; /* To allow custom arrow */
    /* Basic arrow styling, can be improved with SVG */
    background-image: url('data:image/svg+xml;utf8,<svg fill="${props => encodeURIComponent(getComputedStyle(props.theme?.['body'] || document.body).getPropertyValue('--text-muted') || '#6c757d')}" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M1395 736q0 13-10 23l-466 466q-10 10-23 10t-23-10l-466-466q-10-10-10-23t10-23l50-50q10-10 23-10t23 10l393 393 393-393q10-10 23-10t23 10l50 50q10 10 10 23z"/></svg>');
    background-repeat: no-repeat;
    background-position: right 10px top 50%;
    background-size: 14px;
    padding-right: 30px; /* Space for the arrow */

    &:focus {
        outline: none;
        border-color: var(--border-accent);
        box-shadow: 0 0 0 2px color-mix(in srgb, var(--border-accent) 25%, transparent);
    }
    &:disabled {
        background-color: var(--background-tertiary);
        opacity: 0.7;
        cursor: not-allowed;
    }
`;
const Button = styled.button`
  padding: 10px 18px; background-color: var(--text-accent); color: var(--text-on-accent);
  border: none; border-radius: 5px; cursor: pointer; font-size: 1em; font-weight: 500;
  align-self: flex-start;
  transition: background-color 0.2s, opacity 0.2s;
  &:hover:not(:disabled) { background-color: color-mix(in srgb, var(--text-accent) 85%, black); }
  &:disabled { background-color: var(--text-muted); opacity: 0.6; cursor: not-allowed; }
`;

// Define LEAVE_TYPES here to populate the dropdown
const LEAVE_TYPES_OPTIONS = {
    PAID_LEAVE: 'Paid Leave',
    SICK_LEAVE: 'Sick Leave',
    UNPAID_LEAVE: 'Unpaid Leave',
    FLOATER_LEAVE: 'Floater Leave',
};

const LeaveRequestForm = ({ onSubmit, isSubmitting }) => {
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [reason, setReason] = useState('');
    const [leaveType, setLeaveType] = useState(''); // State for selected leave type

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!leaveType) {
            alert('Please select a leave type.');
            return;
        }
        if (!startDate || !endDate || !reason.trim()) {
            alert('Please fill in start date, end date, and reason.');
            return;
        }
        const formattedStartDate = startDate.toISOString().split('T')[0];
        const formattedEndDate = endDate.toISOString().split('T')[0];

        if (formattedEndDate < formattedStartDate) {
            alert('End date cannot be before start date.');
            return;
        }

        // *** ADDED CONSOLE.LOG HERE ***
        const leaveDataToSubmit = {
            startDate: formattedStartDate,
            endDate: formattedEndDate,
            reason: reason.trim(),
            leaveType: leaveType,
        };
        console.log("Frontend (LeaveRequestForm): Submitting leave data:", leaveDataToSubmit);
        // *** END OF ADDED CONSOLE.LOG ***

        onSubmit(leaveDataToSubmit); // Pass the constructed object

        // Reset form fields after submission
        setStartDate(null);
        setEndDate(null);
        setReason('');
        setLeaveType('');
    };

    return (
        <Form onSubmit={handleSubmit}>
            <h4>Request New Leave</h4>
            <FormGroup>
                <Label htmlFor="leave-type">Leave Type *</Label>
                <SelectStyled
                    id="leave-type"
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value)}
                    required
                    disabled={isSubmitting}
                >
                    <option value="" disabled>-- Select Leave Type --</option>
                    {Object.entries(LEAVE_TYPES_OPTIONS).map(([key, value]) => (
                        <option key={key} value={key}>{value}</option>
                    ))}
                </SelectStyled>
            </FormGroup>
            <FormGroup>
                <Label htmlFor="leave-start-date">Start Date *</Label>
                <DatePickerInputStyled
                    id="leave-start-date"
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                    selectsStart
                    startDate={startDate}
                    endDate={endDate}
                    minDate={new Date()} // This uses the client's current date
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Select start date"
                    required
                    disabled={isSubmitting}
                    autoComplete="off"
                />
            </FormGroup>
            <FormGroup>
                <Label htmlFor="leave-end-date">End Date *</Label>
                <DatePickerInputStyled
                    id="leave-end-date"
                    selected={endDate}
                    onChange={(date) => setEndDate(date)}
                    selectsEnd
                    startDate={startDate}
                    endDate={endDate}
                    minDate={startDate || new Date()} // End date min is start date or client's current date
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Select end date"
                    required
                    disabled={isSubmitting}
                    autoComplete="off"
                />
            </FormGroup>
            <FormGroup>
                <Label htmlFor="leave-reason">Reason *</Label>
                <TextArea
                    id="leave-reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                    maxLength={500}
                    placeholder="Briefly explain the reason for leave"
                    disabled={isSubmitting}
                />
            </FormGroup>
            <Button type="submit" disabled={isSubmitting || !startDate || !endDate || !reason.trim() || !leaveType}>
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </Button>
        </Form>
    );
};

export default LeaveRequestForm;