// src/pages/AdminAttendancePage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { fetchCompanyAttendanceForDate } from '../services/apiService';

// --- Styled Components ---
const PageContainer = styled.div`
  padding: 30px;
  max-width: 1200px;
  margin: 20px auto;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  flex-wrap: wrap;
  gap: 20px;
`;

const PageTitle = styled.h2`
  color: var(--text-primary);
  margin: 0;
  border-bottom: 2px solid var(--text-accent);
  padding-bottom: 10px;
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  background-color: var(--background-secondary);
  padding: 15px;
  border-radius: 8px;
  border: 1px solid var(--border-primary);
`;

const DateInput = styled.input`
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid var(--border-primary);
  background-color: var(--background-tertiary);
  color: var(--text-primary);
  font-size: 1em;
`;

const TableContainer = styled.div`
  overflow-x: auto;
  background-color: var(--background-secondary);
  border-radius: 8px;
  border: 1px solid var(--border-primary);
`;

const TableControls = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  flex-grow: 1;
  justify-content: flex-end;
`;

const AttendanceTable = styled.table`
  width: 100%;
  border-collapse: collapse;
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
  
  &.status-PRESENT { background-color: var(--text-success); }
  &.status-LATE { background-color: #ffc107; color: #212529; }
  &.status-ON_LEAVE { background-color: #17a2b8; }
  &.status-ABSENT { background-color: var(--text-error); }
  &.status-N\\/A { background-color: var(--text-muted); }
`;

const AdminAttendancePage = () => {
    const [records, setRecords] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const loadAttendance = useCallback(async (date) => {
        if (!date) return;
        setLoading(true);
        setError('');
        try {
            const data = await fetchCompanyAttendanceForDate(date);
            setRecords(data || []);
        } catch (err) {
            setError(err.message || 'Failed to fetch attendance records.');
            setRecords([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAttendance(selectedDate);
    }, [selectedDate, loadAttendance]);

    const handleDateChange = (e) => {
        setSelectedDate(e.target.value);
    };

    return (
        <PageContainer>
            <PageHeader>
                <PageTitle>Employee Daily Attendance</PageTitle>
                <Controls>
                    <label htmlFor="attendance-date">Select Date:</label>
                    <DateInput 
                        type="date" 
                        id="attendance-date" 
                        value={selectedDate} 
                        onChange={handleDateChange} 
                    />
                </Controls>
            </PageHeader>
            
            {error && <p className="message-display error">{error}</p>}

            <TableContainer>
                <AttendanceTable>
                    <thead>
                        <tr>
                            <th>Employee Name</th>
                            <th>Department</th>
                            <th>Check-In Time</th>
                            <th>Check-Out Time</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" style={{ textAlign: 'center' }}>Loading records...</td></tr>
                        ) : records.length > 0 ? (
                            records.map(rec => (
                                <tr key={rec.id}>
                                    <td>{rec.employeeName}</td>
                                    <td>{rec.departmentName}</td>
                                    <td>{rec.checkInTime || '--'}</td>
                                    <td>{rec.checkOutTime || '--'}</td>
                                    <td>
                                        <StatusPill className={`status-${rec.status.replace('_', '-')}`}>
                                            {rec.status.replace('_', ' ')}
                                        </StatusPill>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="5" style={{ textAlign: 'center' }}>No attendance records found for this date.</td></tr>
                        )}
                    </tbody>
                </AttendanceTable>
            </TableContainer>
        </PageContainer>
    );
};

export default AdminAttendancePage;