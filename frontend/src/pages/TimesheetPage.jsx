// src/pages/TimesheetPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import {
    fetchActiveProjects,
    fetchCurrentTimesheet,
    saveTimesheet,
    submitTimesheet,
    fetchTimesheetHistory,
    fetchRejectedTimesheets,
    fetchPastDueTimesheets,
    recallTimesheet,
    fetchMyTasks,
    fetchMyProjectAllocations,
    fetchProjectTimeSummary,
    fetchBillingTimeSummary,
    updateTaskStatus
} from '../services/apiService';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt, FaTimes } from 'react-icons/fa';
import TimesheetEntry from '../components/TimesheetEntry';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

// --- Styled Components ---
const PageContainer = styled.div` padding: 30px; max-width: 1200px; margin: 20px auto; `;
const PageTitle = styled.h2` color: var(--text-primary); margin-bottom: 10px; `;
const SubNav = styled.div` display: flex; flex-wrap: wrap; gap: 10px; border-bottom: 1px solid var(--border-primary); margin-bottom: 25px; `;
const SubNavButton = styled.button`
    padding: 10px 15px; border: none; background-color: transparent; cursor: pointer;
    color: var(--text-secondary); font-weight: 500; border-bottom: 3px solid transparent; margin-bottom: -1px;
    &.active { color: var(--text-accent); border-bottom-color: var(--text-accent); }
`;
const ViewContainer = styled.div` animation: fadeIn 0.5s ease-out; `;
const HeaderControls = styled.div` display: flex; justify-content: flex-end; align-items: center; margin-bottom: 20px; gap: 10px; .react-datepicker-wrapper { width: auto; } `;
const DatePickerInput = styled.button`
    background-color: var(--background-secondary); border: 1px solid var(--border-primary); padding: 8px 15px;
    border-radius: 6px; color: var(--text-primary); font-size: 0.95em; cursor: pointer;
    display: flex; align-items: center; gap: 8px;
    &:hover { border-color: var(--border-accent); }
`;
const HistoryTable = styled.table`
    width: 100%; border-collapse: collapse; background-color: var(--background-secondary);
    border-radius: 8px; overflow: hidden; border: 1px solid var(--border-primary);
    box-shadow: 0 2px 8px var(--shadow-color);
    th, td { padding: 12px 15px; text-align: left; border-bottom: 1px solid var(--border-secondary); }
    th { background-color: var(--background-tertiary); }
    tbody tr:hover { background-color: var(--background-hover); }
    td.total-hours { font-weight: bold; }
`;
const StatusBadge = styled.span`
    padding: 5px 12px; border-radius: 15px; font-size: 0.8em; font-weight: 600; color: white;
    &.status-DRAFT { background-color: #007bff; } &.status-SUBMITTED { background-color: #ffc107; color: #212529; }
    &.status-APPROVED { background-color: #28a745; } &.status-REJECTED { background-color: #dc3545; }
    &.status-TODO { background-color: var(--text-muted); } &.status-IN_PROGRESS { background-color: var(--text-link); }
    &.status-DONE { background-color: var(--text-success); }
`;
const Placeholder = styled.div` padding: 40px; text-align: center; color: var(--text-muted); background-color: var(--background-tertiary); border-radius: 8px; `;
const PageHeader = styled.div` display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; `;
const ActionButton = styled.button`
    padding: 6px 12px; font-size: 0.9em; border-radius: 5px; cursor: pointer; border: none; font-weight: 500;
    background-color: var(--text-link); color: var(--text-on-accent); transition: background-color 0.2s ease;
    &:hover:not(:disabled) { background-color: color-mix(in srgb, var(--text-link) 85%, black); }
`;
const RecallButton = styled(ActionButton)`
    background-color: var(--text-muted);
    &:hover:not(:disabled) { background-color: color-mix(in srgb, var(--text-muted) 85%, black); }
`;
const ModalOverlay = styled.div` position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0, 0, 0, 0.7); display: flex; align-items: center; justify-content: center; z-index: 1050; animation: fadeIn 0.3s; `;
const ModalContent = styled.div` background-color: var(--background-secondary); padding: 25px; border-radius: 8px; width: 90%; max-width: 1100px; max-height: 90vh; overflow-y: auto; position: relative; animation: fadeInUp 0.4s ease-out; `;
const CloseButton = styled.button` position: absolute; top: 10px; right: 10px; background: transparent; border: none; font-size: 1.5rem; color: var(--text-muted); cursor: pointer; `;
const SummaryGrid = styled.div` display: grid; grid-template-columns: 1fr 2fr; gap: 30px; align-items: start; @media (max-width: 768px) { grid-template-columns: 1fr; } `;
const SummaryCards = styled.div` display: flex; flex-direction: column; gap: 15px; `;
const SummaryCard = styled.div`
    background-color: var(--background-secondary); border-radius: 8px; padding: 20px; border: 1px solid var(--border-primary);
    box-shadow: 0 2px 5px var(--shadow-color); border-left: 4px solid ${props => props.color || 'var(--border-primary)'};
    h4 { margin: 0 0 5px 0; font-size: 0.9em; color: var(--text-secondary); text-transform: uppercase; }
    p { margin: 0; font-size: 1.8em; font-weight: 700; color: var(--text-primary); }
`;
const ChartContainer = styled.div` padding: 20px; background-color: var(--background-secondary); border-radius: 8px; border: 1px solid var(--border-primary); height: 350px; `;

const TimesheetPage = () => {
    const [activeTab, setActiveTab] = useState('currentWeek');
    const [history, setHistory] = useState([]);
    const [rejected, setRejected] = useState([]);
    const [pastDue, setPastDue] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentTimesheet, setCurrentTimesheet] = useState(null);
    const [timesheetToEdit, setTimesheetToEdit] = useState(null);
    const [projects, setProjects] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isRecallingId, setIsRecallingId] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [projectSummary, setProjectSummary] = useState([]);
    const [billingSummary, setBillingSummary] = useState([]);
    const [myTasks, setMyTasks] = useState([]);
    const [projectAllocations, setProjectAllocations] = useState([]);

    const weekDisplay = useMemo(() => {
        const timesheet = isEditModalOpen ? timesheetToEdit : currentTimesheet;
        if (!timesheet?.weekStartDate) return '';
        const startDate = new Date(timesheet.weekStartDate + 'T00:00:00');
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        const options = { month: 'long', day: 'numeric' };
        return `${startDate.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', options)}`;
    }, [currentTimesheet, timesheetToEdit, isEditModalOpen]);

    const loadDataForTab = useCallback(async (tab) => {
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            if (tab === 'currentWeek') {
                const [timesheet, projectData] = await Promise.all([fetchCurrentTimesheet(), fetchActiveProjects()]);
                setCurrentTimesheet(timesheet);
                setProjects(projectData || []);
            } else if (tab === 'history') {
                const data = await fetchTimesheetHistory(selectedDate.getFullYear(), selectedDate.getMonth() + 1);
                setHistory(data || []);
            } else if (tab === 'rejected') {
                const data = await fetchRejectedTimesheets();
                setRejected(data || []);
            } else if (tab === 'pastDue') {
                const data = await fetchPastDueTimesheets();
                setPastDue(data || []);
            } else if (tab === 'project') {
                const data = await fetchProjectTimeSummary(selectedDate.getFullYear(), selectedDate.getMonth() + 1);
                setProjectSummary(data || []);
            } else if (tab === 'summary') {
                const data = await fetchBillingTimeSummary(selectedDate.getFullYear(), selectedDate.getMonth() + 1);
                setBillingSummary(data || []);
            } else if (tab === 'myTasks') {
                const data = await fetchMyTasks();
                setMyTasks(data || []);
            } else if (tab === 'projectAllocations') {
                const data = await fetchMyProjectAllocations();
                setProjectAllocations(data || []);
            }
        } catch (err) {
            setError(err.message || `Failed to load data for ${tab} tab.`);
        } finally {
            setLoading(false);
        }
    }, [selectedDate]);

    useEffect(() => {
        loadDataForTab(activeTab);
    }, [activeTab, loadDataForTab]);

    const handleOpenEditModal = async (timesheet) => {
        setTimesheetToEdit(timesheet);
        setIsEditModalOpen(true);
        try {
            const projectData = await fetchActiveProjects();
            setProjects(projectData || []);
        } catch (err) {
            setError("Could not load project list for editing. Please try again.");
            setIsEditModalOpen(false);
        }
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setTimesheetToEdit(null);
    };

    const handleEntryChange = (index, field, value, isModal) => {
        const setter = isModal ? setTimesheetToEdit : setCurrentTimesheet;
        setter(prev => {
            const newEntries = [...prev.entries];
            newEntries[index] = { ...newEntries[index], [field]: value };
            return { ...prev, entries: newEntries };
        });
    };

    const handleAddRow = (isModal) => {
        const setter = isModal ? setTimesheetToEdit : setCurrentTimesheet;
        if (!projects.length > 0) { setError("No active projects available."); return; }
        setter(prev => {
            const newEntry = { id: null, projectId: projects[0].id, project: projects[0], taskDescription: '', billingType: 'NON_BILLABLE', hoursMonday: 0, hoursTuesday: 0, hoursWednesday: 0, hoursThursday: 0, hoursFriday: 0, hoursSaturday: 0, hoursSunday: 0 };
            return { ...prev, entries: [...prev.entries, newEntry] };
        });
    };

    const handleRemoveRow = (index, isModal) => {
        const setter = isModal ? setTimesheetToEdit : setCurrentTimesheet;
        setter(prev => ({ ...prev, entries: prev.entries.filter((_, i) => i !== index) }));
    };

    const handleSave = async (isSubmitting = false) => {
        setIsSaving(true);
        setError('');
        setSuccess('');
        const timesheetToSave = isEditModalOpen ? timesheetToEdit : currentTimesheet;
        const originalStatus = timesheetToSave.status;

        try {
            const entriesToSave = timesheetToSave.entries.map(entry => ({
                id: entry.id, projectId: entry.project?.id || entry.projectId,
                taskDescription: entry.taskDescription, billingType: entry.billingType || 'NON_BILLABLE',
                hoursMonday: parseFloat(entry.hoursMonday) || 0, hoursTuesday: parseFloat(entry.hoursTuesday) || 0,
                hoursWednesday: parseFloat(entry.hoursWednesday) || 0, hoursThursday: parseFloat(entry.hoursThursday) || 0,
                hoursFriday: parseFloat(entry.hoursFriday) || 0, hoursSaturday: parseFloat(entry.hoursSaturday) || 0,
                hoursSunday: parseFloat(entry.hoursSunday) || 0,
            }));

            if (isSubmitting) {
                await saveTimesheet(timesheetToSave.id, entriesToSave);
                await submitTimesheet(timesheetToSave.id);
                setSuccess('Timesheet submitted successfully!');
                
                if (isEditModalOpen) {
                    handleCloseEditModal();
                    if (originalStatus === 'REJECTED') {
                        loadDataForTab('rejected');
                    } else if (originalStatus === 'DRAFT') {
                        loadDataForTab('pastDue');
                    }
                } else {
                    setActiveTab('history');
                }
            } else {
                const saved = await saveTimesheet(timesheetToSave.id, entriesToSave);
                isEditModalOpen ? setTimesheetToEdit(saved) : setCurrentTimesheet(saved);
                setSuccess('Draft saved successfully!');
            }
        } catch (err) { setError(err.message || 'An error occurred.'); }
        finally { setIsSaving(false); }
    };

    const handleRecall = async (timesheetId) => {
        if (!window.confirm("Are you sure you want to recall this submitted timesheet?")) return;
        setIsRecallingId(timesheetId);
        setError('');
        try {
            await recallTimesheet(timesheetId);
            setSuccess("Timesheet recalled successfully.");
            await loadDataForTab(activeTab);
        } catch (err) { setError(err.message || "Failed to recall timesheet."); }
        finally { setIsRecallingId(null); }
    };

    // THIS FUNCTION IS NOW IN THE CORRECT SCOPE
    const handleTaskStatusChange = async (taskId, newStatus) => {
        try {
            const updatedTask = await updateTaskStatus(taskId, newStatus);
            setMyTasks(prevTasks => 
                prevTasks.map(task => 
                    task.id === taskId ? { ...task, status: updatedTask.status } : task
                )
            );
        } catch (err) {
            setError(err.message || "Failed to update task status.");
        }
    };

    const CustomDatePickerInput = React.forwardRef(({ value, onClick }, ref) => (
        <DatePickerInput onClick={onClick} ref={ref}>
            <FaCalendarAlt /> {value}
        </DatePickerInput>
    ));

    const renderContent = () => {
        if (loading && !isEditModalOpen) return <Placeholder>Loading...</Placeholder>;
        if (error) return <Placeholder>{error}</Placeholder>;

        switch (activeTab) {
            case 'currentWeek':
                return (
                    <ViewContainer>
                        <PageHeader>
                            <div>
                                <PageTitle>Current Week Timesheet</PageTitle>
                                <span style={{color: 'var(--text-secondary)'}}>{weekDisplay}</span>
                            </div>
                            {currentTimesheet && <StatusBadge className={`status-${currentTimesheet.status}`}>{currentTimesheet.status}</StatusBadge>}
                        </PageHeader>
                        <TimesheetEntry
                            timesheetData={currentTimesheet} projects={projects} isSaving={isSaving}
                            onEntryChange={(index, field, value) => handleEntryChange(index, field, value, false)}
                            onAddRow={() => handleAddRow(false)}
                            onRemoveRow={(index) => handleRemoveRow(index, false)}
                            onSave={handleSave}
                        />
                    </ViewContainer>
                );
            case 'history':
                return (
                    <ViewContainer>
                        <HeaderControls>
                            <DatePicker selected={selectedDate} onChange={(date) => setSelectedDate(date)} dateFormat="MMMM yyyy" showMonthYearPicker customInput={<CustomDatePickerInput />} />
                        </HeaderControls>
                        {history.length === 0 ? <Placeholder>No timesheets found for this period.</Placeholder> : (
                            <HistoryTable>
                                <thead><tr><th>Week Of</th><th>Total Hours</th><th>Status</th><th>Submitted On</th><th>Actioned On</th><th>Action</th></tr></thead>
                                <tbody>
                                    {history.map(ts => (
                                        <tr key={ts.id}>
                                            <td>{new Date(ts.weekStartDate + 'T00:00:00').toLocaleDateString()}</td>
                                            <td className="total-hours">{ts.totalHours.toFixed(2)}</td>
                                            <td><StatusBadge className={`status-${ts.status}`}>{ts.status}</StatusBadge></td>
                                            <td>{ts.submittedDate ? new Date(ts.submittedDate).toLocaleString() : 'N/A'}</td>
                                            <td>{ts.approvedDate ? new Date(ts.approvedDate).toLocaleString() : 'N/A'}</td>
                                            <td>
                                                {ts.status === 'SUBMITTED' && (
                                                    <RecallButton onClick={() => handleRecall(ts.id)} disabled={isRecallingId === ts.id}>
                                                        {isRecallingId === ts.id ? '...' : 'Recall'}
                                                    </RecallButton>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </HistoryTable>
                        )}
                    </ViewContainer>
                );
            case 'rejected':
                return (
                    <ViewContainer>
                        {rejected.length === 0 ? <Placeholder>You have no rejected timesheets.</Placeholder> : (
                            <HistoryTable>
                                <thead><tr><th>Week Of</th><th>Total Hours</th><th>Status</th><th>Rejected On</th><th>Action</th></tr></thead>
                                <tbody>
                                    {rejected.map(ts => (
                                        <tr key={ts.id}>
                                            <td>{new Date(ts.weekStartDate + 'T00:00:00').toLocaleDateString()}</td>
                                            <td className="total-hours">{ts.totalHours.toFixed(2)}</td>
                                            <td><StatusBadge className={`status-${ts.status}`}>{ts.status}</StatusBadge></td>
                                            <td>{ts.approvedDate ? new Date(ts.approvedDate).toLocaleString() : 'N/A'}</td>
                                            <td><ActionButton onClick={() => handleOpenEditModal(ts)}>View/Edit</ActionButton></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </HistoryTable>
                        )}
                    </ViewContainer>
                );
            case 'pastDue':
                return (
                    <ViewContainer>
                        {pastDue.length === 0 ? <Placeholder>You have no past due timesheets. Great job!</Placeholder> : (
                            <HistoryTable>
                                <thead><tr><th>Week Of</th><th>Total Hours</th><th>Status</th><th>Action</th></tr></thead>
                                <tbody>
                                    {pastDue.map(ts => (
                                        <tr key={ts.id}>
                                            <td>{new Date(ts.weekStartDate + 'T00:00:00').toLocaleDateString()}</td>
                                            <td className="total-hours">{ts.totalHours.toFixed(2)}</td>
                                            <td><StatusBadge className={`status-${ts.status}`}>{ts.status}</StatusBadge></td>
                                            <td><ActionButton onClick={() => handleOpenEditModal(ts)}>Complete Now</ActionButton></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </HistoryTable>
                        )}
                    </ViewContainer>
                );
            case 'project':
                return (
                    <ViewContainer>
                        <HeaderControls>
                            <DatePicker selected={selectedDate} onChange={(date) => setSelectedDate(date)} dateFormat="MMMM yyyy" showMonthYearPicker customInput={<CustomDatePickerInput />} />
                        </HeaderControls>
                        {projectSummary.length === 0 ? <Placeholder>No hours logged against projects for this period.</Placeholder> : (
                            <HistoryTable>
                                <thead><tr><th>Project Name</th><th style={{textAlign: 'right'}}>Total Hours</th></tr></thead>
                                <tbody>
                                    {projectSummary.map(summary => (
                                        <tr key={summary.projectId}>
                                            <td>{summary.projectName}</td>
                                            <td className="total-hours" style={{textAlign: 'right'}}>{summary.totalHours.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </HistoryTable>
                        )}
                    </ViewContainer>
                );
            case 'summary':
                const chartData = {
                    labels: billingSummary.map(s => s.billingType.replace('_', ' ')),
                    datasets: [{
                        data: billingSummary.map(s => s.totalHours),
                        backgroundColor: ['rgba(54, 162, 235, 0.8)', 'rgba(255, 206, 86, 0.8)', 'rgba(153, 102, 255, 0.8)'],
                        borderColor: ['rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)', 'rgba(153, 102, 255, 1)'],
                        borderWidth: 1,
                    }]
                };
                const totalHours = billingSummary.reduce((sum, s) => sum + parseFloat(s.totalHours), 0);
                const billableHours = billingSummary.find(s => s.billingType === 'BILLABLE')?.totalHours || 0;
                const nonBillableHours = billingSummary.find(s => s.billingType === 'NON_BILLABLE')?.totalHours || 0;

                return (
                    <ViewContainer>
                        <HeaderControls>
                            <DatePicker selected={selectedDate} onChange={(date) => setSelectedDate(date)} dateFormat="MMMM yyyy" showMonthYearPicker customInput={<CustomDatePickerInput />} />
                        </HeaderControls>
                        {billingSummary.length === 0 ? <Placeholder>No hours logged for this period.</Placeholder> : (
                            <SummaryGrid>
                                <SummaryCards>
                                    <SummaryCard color="var(--text-accent)"><h4>Total Hours Logged</h4><p>{totalHours.toFixed(2)}</p></SummaryCard>
                                    <SummaryCard color="rgba(54, 162, 235, 1)"><h4>Billable Hours</h4><p>{parseFloat(billableHours).toFixed(2)}</p></SummaryCard>
                                    <SummaryCard color="rgba(255, 206, 86, 1)"><h4>Non-Billable Hours</h4><p>{parseFloat(nonBillableHours).toFixed(2)}</p></SummaryCard>
                                </SummaryCards>
                                <ChartContainer><Doughnut data={chartData} options={{ maintainAspectRatio: false }} /></ChartContainer>
                            </SummaryGrid>
                        )}
                    </ViewContainer>
                );
            case 'myTasks':
                return (
                    <ViewContainer>
                        {myTasks.length === 0 ? <Placeholder>You have no tasks assigned to you.</Placeholder> :
                         (
                            <HistoryTable>
                                <thead><tr><th>Status</th><th>Task Title</th><th>Project</th><th>Due Date</th></tr></thead>
                                <tbody>
                                    {myTasks.map(task => (
                                        <tr key={task.id}>
                                            <td>
                                                <select 
                                                    value={task.status} 
                                                    onChange={(e) => handleTaskStatusChange(task.id, e.target.value)}
                                                    style={{padding: '6px', borderRadius: '4px', border: '1px solid var(--border-primary)'}}
                                                >
                                                    <option value="TODO">To Do</option>
                                                    <option value="IN_PROGRESS">In Progress</option>
                                                    <option value="DONE">Done</option>
                                                </select>
                                            </td>
                                            <td>{task.title}</td>
                                            <td>{task.project.name}</td>
                                            <td>{task.dueDate ? new Date(task.dueDate + 'T00:00:00').toLocaleDateString() : 'N/A'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </HistoryTable>
                         )
                        }
                    </ViewContainer>
                );
            case 'projectAllocations':
                return (
                    <ViewContainer>
                        {projectAllocations.length === 0 ? <Placeholder>You have no current or upcoming project allocations.</Placeholder> :
                         (
                            <HistoryTable>
                                <thead><tr><th>Project Name</th><th>Start Date</th><th>End Date</th><th style={{textAlign: 'right'}}>Hours / Week</th></tr></thead>
                                <tbody>
                                    {projectAllocations.map(alloc => (
                                        <tr key={alloc.id}>
                                            <td>{alloc.project.name}</td>
                                            <td>{new Date(alloc.startDate + 'T00:00:00').toLocaleDateString()}</td>
                                            <td>{new Date(alloc.endDate + 'T00:00:00').toLocaleDateString()}</td>
                                            <td className="total-hours" style={{textAlign: 'right'}}>{alloc.allocatedHoursPerWeek.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </HistoryTable>
                         )
                        }
                    </ViewContainer>
                );
            default:
                return <Placeholder>Please select a tab.</Placeholder>;
        }
    };
    
    return (
        <PageContainer>
            <PageTitle>Timesheets</PageTitle>
            {success && <p className="message-display success">{success}</p>}
            <SubNav>
                <SubNavButton className={activeTab === 'currentWeek' ? 'active' : ''} onClick={() => setActiveTab('currentWeek')}>Current Week</SubNavButton>
                <SubNavButton className={activeTab === 'history' ? 'active' : ''} onClick={() => setActiveTab('history')}>All Timesheets</SubNavButton>
                <SubNavButton className={activeTab === 'pastDue' ? 'active' : ''} onClick={() => setActiveTab('pastDue')}>Past Due</SubNavButton>
                <SubNavButton className={activeTab === 'rejected' ? 'active' : ''} onClick={() => setActiveTab('rejected')}>Rejected Timesheets</SubNavButton>
                <SubNavButton className={activeTab === 'project' ? 'active' : ''} onClick={() => setActiveTab('project')}>Project Timesheets</SubNavButton>
                <SubNavButton className={activeTab === 'summary' ? 'active' : ''} onClick={() => setActiveTab('summary')}>Time Summary</SubNavButton>
                <SubNavButton className={activeTab === 'myTasks' ? 'active' : ''} onClick={() => setActiveTab('myTasks')}>My Tasks</SubNavButton>
                <SubNavButton className={activeTab === 'projectAllocations' ? 'active' : ''} onClick={() => setActiveTab('projectAllocations')}>My Project Allocations</SubNavButton>
            </SubNav>

            {renderContent()}

            {isEditModalOpen && (
                <ModalOverlay onClick={handleCloseEditModal}>
                    <ModalContent onClick={e => e.stopPropagation()}>
                        <CloseButton onClick={handleCloseEditModal}><FaTimes /></CloseButton>
                        <PageHeader>
                            <div>
                                <PageTitle>
                                    {`Editing Timesheet for week of ${timesheetToEdit?.weekStartDate}`}
                                </PageTitle>
                                <span style={{color: 'var(--text-secondary)'}}>{weekDisplay}</span>
                            </div>
                            {timesheetToEdit && <StatusBadge className={`status-${timesheetToEdit.status}`}>{timesheetToEdit.status}</StatusBadge>}
                        </PageHeader>
                        <TimesheetEntry
                            timesheetData={timesheetToEdit}
                            projects={projects}
                            isSaving={isSaving}
                            onEntryChange={(index, field, value) => handleEntryChange(index, field, value, true)}
                            onAddRow={() => handleAddRow(true)}
                            onRemoveRow={(index) => handleRemoveRow(index, true)}
                            onSave={handleSave}
                        />
                    </ModalContent>
                </ModalOverlay>
            )}
        </PageContainer>
    );
};

export default TimesheetPage;