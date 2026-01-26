// src/pages/AttendancePage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { clockIn, clockOut, getAttendanceStatus, fetchAttendanceSummary } from '../services/apiService';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt } from 'react-icons/fa';
import AttendanceCorrectionModal from '../components/AttendanceCorrectionModal';

// --- Styled Components ---
const PageContainer = styled.div`
  padding: 30px;
  max-width: 1000px;
  margin: 20px auto;
`;

const PageTitle = styled.h2`
  color: var(--text-primary);
  margin-bottom: 25px;
  border-bottom: 2px solid var(--text-accent);
  padding-bottom: 10px;
  display: inline-block;
`;

const TimeClockSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 30px;
  background-color: var(--background-secondary);
  border-radius: 8px;
  margin-bottom: 30px;
  box-shadow: 0 2px 8px var(--shadow-color);
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(25, 135, 84, 0.7); }
  70% { box-shadow: 0 0 0 15px rgba(25, 135, 84, 0); }
  100% { box-shadow: 0 0 0 0 rgba(25, 135, 84, 0); }
`;

const ClockFace = styled.div`
  width: 220px;
  height: 220px;
  border-radius: 50%;
  border: 8px solid ${props => (props.$clockedIn ? 'var(--text-success)' : 'var(--text-muted)')};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 20px;
  transition: border-color 0.4s ease;
  animation: ${props => (props.$clockedIn ? pulse : 'none')} 2s infinite;
`;

const StatusText = styled.h3`
  font-size: 1.8em;
  font-weight: bold;
  margin: 0;
  color: ${props => (props.$clockedIn ? 'var(--text-success)' : 'var(--text-secondary)')};
`;

const Timer = styled.p`
  font-size: 1.4em;
  font-family: 'monospace';
  color: var(--text-primary);
  margin: 10px 0 0 0;
`;

const TimeInfo = styled.p`
    font-size: 0.9em; color: var(--text-secondary); margin: 5px 0;
`;

const ActionButton = styled.button`
  padding: 15px 40px;
  font-size: 1.2em;
  border-radius: 8px;
  cursor: pointer;
  border: none;
  font-weight: 600;
  background-color: ${props => (props.$clockIn ? 'var(--text-success)' : 'var(--text-error)')};
  color: var(--text-on-accent);
  transition: all 0.2s ease;
  &:hover:not(:disabled) { transform: translateY(-3px); }
  &:disabled { background-color: var(--text-muted); opacity: 0.6; cursor: not-allowed; }
`;

const HistorySection = styled.div`
  margin-top: 30px;
  background-color: var(--background-secondary);
  border-radius: 8px;
  padding: 25px;
  box-shadow: 0 2px 8px var(--shadow-color);
`;

const HistoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
`;

const HistoryTitle = styled.h3`
  margin: 0;
  color: var(--text-accent);
`;

const DatePickerInput = styled.button`
    background-color: var(--background-tertiary);
    border: 1px solid var(--border-primary);
    padding: 8px 15px;
    border-radius: 6px;
    color: var(--text-primary);
    font-size: 0.95em;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    &:hover { border-color: var(--border-accent); }
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-secondary);
`;

const StatCard = styled.div`
  background-color: var(--background-tertiary);
  padding: 15px;
  border-radius: 6px;
  text-align: center;
  border: 1px solid var(--border-primary);

  h4 {
    margin: 0 0 5px 0;
    font-size: 0.9em;
    color: var(--text-secondary);
    text-transform: uppercase;
  }
  p {
    margin: 0;
    font-size: 1.5em;
    font-weight: 600;
    color: var(--text-primary);
  }
`;

const HistoryTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9em;
  th, td {
    border-bottom: 1px solid var(--border-secondary);
    padding: 10px 12px;
    text-align: left;
  }
  th {
    background-color: var(--background-tertiary);
  }
  tbody tr:hover {
    background-color: var(--background-hover);
  }
`;

const CorrectionButton = styled.button`
    padding: 4px 8px;
    font-size: 0.85em;
    border-radius: 4px;
    cursor: pointer;
    background: none;
    border: 1px solid var(--text-muted);
    color: var(--text-muted);
    &:hover {
        background-color: var(--background-hover);
        color: var(--text-primary);
    }
    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const AttendancePage = () => {
    const [status, setStatus] = useState(null);
    const [summary, setSummary] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [loading, setLoading] = useState({ status: true, summary: true });
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [elapsedTime, setElapsedTime] = useState('00:00:00');

    useEffect(() => {
        let intervalId;
        if (status?.clockedIn && status.checkInTime) {
            const [hours, minutes, seconds] = status.checkInTime.split(':').map(Number);
            const checkInDateTime = new Date();
            checkInDateTime.setHours(hours, minutes, seconds, 0);

            intervalId = setInterval(() => {
                const now = new Date();
                const diff = now - checkInDateTime;
                
                const h = String(Math.floor((diff / (1000 * 60 * 60)) % 24)).padStart(2, '0');
                const m = String(Math.floor((diff / (1000 * 60)) % 60)).padStart(2, '0');
                const s = String(Math.floor((diff / 1000) % 60)).padStart(2, '0');

                setElapsedTime(`${h}:${m}:${s}`);
            }, 1000);
        }
        return () => clearInterval(intervalId);
    }, [status]);

    const loadStatus = useCallback(async () => {
        setLoading(prev => ({...prev, status: true}));
        try {
            const statusData = await getAttendanceStatus();
            setStatus(statusData);
        } catch (err) { setError(err.message || 'Failed to load status.'); }
        finally { setLoading(prev => ({...prev, status: false})); }
    }, []);

    const loadSummary = useCallback(async (date) => {
        setLoading(prev => ({...prev, summary: true}));
        try {
            const summaryData = await fetchAttendanceSummary(date.getFullYear(), date.getMonth() + 1);
            setSummary(summaryData);
        } catch (err) { setError(err.message || 'Failed to load summary.'); }
        finally { setLoading(prev => ({...prev, summary: false})); }
    }, []);

    useEffect(() => {
        loadStatus();
    }, [loadStatus]);

    useEffect(() => {
        loadSummary(selectedDate);
    }, [selectedDate, loadSummary]);

    const handleClockAction = async () => {
        setActionLoading(true);
        setError('');
        try {
            await (status?.clockedIn ? clockOut() : clockIn());
            await loadStatus();
        } catch (err) {
            setError(`Action failed: ${err.message}`);
        } finally {
            setActionLoading(false);
        }
    };

      const handleOpenCorrectionModal = (record) => {
        setSelectedRecord(record);
        setIsModalOpen(true);
    };

    const handleCloseCorrectionModal = () => {
        setSelectedRecord(null);
        setIsModalOpen(false);
    };
    
    const handleCorrectionSubmitted = () => {
        handleCloseCorrectionModal();
        setSuccessMessage('Your correction request has been submitted for approval.');
        setTimeout(() => setSuccessMessage(''), 5000); // Hide message after 5 seconds
    };

    const CustomDatePickerInput = React.forwardRef(({ value, onClick }, ref) => (
        <DatePickerInput onClick={onClick} ref={ref}>
            <FaCalendarAlt />
            {value}
        </DatePickerInput>
    ));

    return (
        <PageContainer>
            <PageTitle>My Attendance</PageTitle>
            {error && <p className="message-display error">{error}</p>}
            
            <TimeClockSection>
                {loading.status ? <p>Loading Status...</p> : (
                    <>
                        <ClockFace $clockedIn={status?.clockedIn}>
                            <StatusText $clockedIn={status?.clockedIn}>{status?.clockedIn ? 'Clocked In' : 'Clocked Out'}</StatusText>
                            {status?.clockedIn && <Timer>{elapsedTime}</Timer>}
                        </ClockFace>
                        <ActionButton onClick={handleClockAction} disabled={actionLoading} $clockIn={!status?.clockedIn}>
                            {actionLoading ? 'Processing...' : (status?.clockedIn ? 'Clock Out' : 'Clock In')}
                        </ActionButton>
                        <div>
                            {status?.checkInTime && <TimeInfo>Today's Clock In: {status.checkInTime}</TimeInfo>}
                            {status?.checkOutTime && <TimeInfo>Today's Clock Out: {status.checkOutTime}</TimeInfo>}
                        </div>
                    </>
                )}
            </TimeClockSection>

            <HistorySection>
                <HistoryHeader>
                    <HistoryTitle>Monthly Summary & Log</HistoryTitle>
                    <DatePicker
                        selected={selectedDate}
                        onChange={(date) => setSelectedDate(date)}
                        dateFormat="MMMM yyyy"
                        showMonthYearPicker
                        customInput={<CustomDatePickerInput value={selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })} />}
                    />
                </HistoryHeader>
                {loading.summary ? <p style={{textAlign: 'center', padding: '20px'}}>Loading Summary...</p> : summary && (
                    <>
                        <SummaryGrid>
                            <StatCard><h4>Total Hours</h4><p>{summary.totalHoursWorked}</p></StatCard>
                            <StatCard><h4>Late Days</h4><p>{summary.totalLateDays}</p></StatCard>
                            <StatCard><h4>Avg. Clock In</h4><p>{summary.averageCheckIn}</p></StatCard>
                            <StatCard><h4>Avg. Clock Out</h4><p>{summary.averageCheckOut}</p></StatCard>
                        </SummaryGrid>
                        <HistoryTable>
                            <thead>
                                <tr><th>Date</th><th>Check In</th><th>Check Out</th><th>Status</th><th>Action</th></tr>
                            </thead>
                            <tbody>
                                {summary.records.map(record => (
                                    <tr key={record.id}>
                                        <td>{record.date}</td>
                                        <td>{record.checkInTime || '--'}</td>
                                        <td>{record.checkOutTime || '--'}</td>
                                        <td>{record.status.replace('_', ' ')}</td>
                                        <td>
                                            <CorrectionButton onClick={() => handleOpenCorrectionModal(record)}>
                                                Request Correction
                                            </CorrectionButton>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </HistoryTable>
                    </>
                )}
            </HistorySection>
            {isModalOpen && (
                <AttendanceCorrectionModal 
                    record={selectedRecord}
                    onClose={handleCloseCorrectionModal}
                    onSubmitted={handleCorrectionSubmitted}
                />
            )}
        </PageContainer>
    );
};

export default AttendancePage;