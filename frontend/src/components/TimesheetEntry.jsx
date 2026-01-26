// src/components/TimesheetEntry.jsx
import React from 'react';
import styled from 'styled-components';
import { FaPlus, FaTrash } from 'react-icons/fa';

// --- Styled Components ---
const TimesheetTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9em;
  th, td {
    border: 1px solid var(--border-primary);
    padding: 8px;
    text-align: center;
    vertical-align: middle;
  }
  th {
    background-color: var(--background-tertiary);
  }
  tbody tr:hover {
    background-color: var(--background-hover);
  }
  input, select {
    width: 100%;
    padding: 6px;
    border-radius: 4px;
    border: 1px solid var(--border-primary);
    background-color: var(--background-secondary);
    color: var(--text-primary);
    box-sizing: border-box;
    &:disabled {
      background-color: var(--background-tertiary);
      cursor: not-allowed;
      color: var(--text-muted);
    }
  }
  input[type="number"] {
    text-align: center;
  }
`;

const ActionBar = styled.div`
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const AddButton = styled.button`
  background: none;
  border: 1px dashed var(--text-accent);
  color: var(--text-accent);
  padding: 8px 12px;
  border-radius: 5px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  &:hover:not(:disabled) { background-color: var(--background-hover); }
  &:disabled { opacity: 0.6; border-style: solid; }
`;

const SubmitButton = styled.button`
  padding: 10px 20px;
  background-color: var(--text-success);
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 600;
  &:disabled { background-color: #cccccc; }
`;

const SaveButton = styled(SubmitButton)`
  background-color: var(--text-link);
  margin-right: 10px;
`;

// --- The Component ---
const TimesheetEntry = ({ timesheetData, projects, onEntryChange, onSave, isSaving, onAddRow, onRemoveRow }) => {
    const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
    const billingTypes = ['NON_BILLABLE', 'BILLABLE', 'TIME_OFF'];

    // This is the definitive logic. The form is read-only ONLY if it has been SUBMITTED or APPROVED.
    // DRAFT and REJECTED statuses are editable.
    const isReadOnly = timesheetData?.status === 'SUBMITTED' || timesheetData?.status === 'APPROVED';

    return (
        <>
            <TimesheetTable>
                <thead>
                    <tr>
                        <th style={{width: '20%'}}>Project</th>
                        <th style={{width: '15%'}}>Billing Type</th>
                        <th style={{width: '25%'}}>Task Description</th>
                        {days.map(day => <th key={day} style={{textTransform: 'capitalize'}}>{day.substring(0,3)}</th>)}
                        <th style={{width: '5%'}}>Del</th>
                    </tr>
                </thead>
                <tbody>
                    {timesheetData?.entries.map((entry, index) => (
                        <tr key={index}>
                            <td>
                                <select 
                                    value={entry.project?.id || ''} 
                                    onChange={(e) => onEntryChange(index, 'project', projects.find(p => p.id === parseInt(e.target.value)))}
                                    disabled={isReadOnly}
                                >
                                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </td>
                            <td>
                                <select
                                    value={entry.billingType || 'NON_BILLABLE'}
                                    onChange={(e) => onEntryChange(index, 'billingType', e.target.value)}
                                    disabled={isReadOnly}
                                >
                                    {billingTypes.map(type => (
                                        <option key={type} value={type}>{type.replace('_', ' ')}</option>
                                    ))}
                                </select>
                            </td>
                            <td><input type="text" value={entry.taskDescription || ''} onChange={(e) => onEntryChange(index, 'taskDescription', e.target.value)} disabled={isReadOnly}/></td>
                            {days.map(day => (
                                <td key={day}>
                                    <input 
                                        type="number" 
                                        min="0" max="24" step="0.5" 
                                        value={entry[`hours${day.charAt(0).toUpperCase() + day.slice(1)}`] || 0}
                                        onChange={(e) => onEntryChange(index, `hours${day.charAt(0).toUpperCase() + day.slice(1)}`, e.target.value)}
                                        disabled={isReadOnly}
                                    />
                                </td>
                            ))}
                            <td>
                                <button onClick={() => onRemoveRow(index)} disabled={isReadOnly} style={{background: 'none', border: 'none', color: 'var(--text-error)', cursor: 'pointer'}}><FaTrash /></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </TimesheetTable>

            <ActionBar>
                <AddButton onClick={onAddRow} disabled={isReadOnly}>
                    <FaPlus /> Add Row
                </AddButton>
                <div>
                    {!isReadOnly && (
                        <>
                            <SaveButton onClick={() => onSave(false)} disabled={isSaving}>
                                {isSaving ? 'Saving...' : 'Save Draft'}
                            </SaveButton>
                            <SubmitButton onClick={() => onSave(true)} disabled={isSaving}>
                                {isSaving ? 'Submitting...' : 'Submit for Approval'}
                            </SubmitButton>
                        </>
                    )}
                </div>
            </ActionBar>
        </>
    );
};

export default TimesheetEntry;