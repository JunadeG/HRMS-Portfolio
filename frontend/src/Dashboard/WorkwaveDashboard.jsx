// src/Dashboard/WorkwaveDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { FaBuilding, FaTimes } from 'react-icons/fa';
import defaultAvatar from '../assets/images/default-avatar.png';
import { fetchDashboardData, fetchUserByIdForAdmin, fetchPublicUserProfile, API_BASE_URL } from '../services/apiService';
import './WorkwaveDashboard.css';
import './Widgets/Widgets.css';

// Import ALL Widgets and the reusable Profile Card
import KpiCard from './Widgets/KpiCard';
import EngagementChart from './Widgets/EngagementChart';
import CalendarWidget from './Widgets/CalendarWidget';
import MeetingsWidget from './Widgets/MeetingWidgets';
import ActionNeededWidget from './Widgets/ActionNeeded';
import NotCheckedInWidget from './Widgets/NotCheckedInWidget';
import NoticeboardWidget from './Widgets/NoticeboardWidget';
import BirthdaysWidget from './Widgets/BirthdaysWidget';
import EmployeeProfileCard from '../components/admin/EmployeeProfileCard';

// --- Styled Components ---
const LoadingPlaceholder = styled.div` padding: 40px; text-align: center; font-size: 1.2em; color: var(--text-secondary); `;
const ErrorPlaceholder = styled.div` padding: 20px; text-align: center; font-size: 1.1em; color: var(--text-error); background-color: color-mix(in srgb, var(--text-error) 10%, var(--background-secondary)); border: 1px solid var(--border-error); border-radius: 5px; margin: 20px; white-space: pre-wrap; `;
const ModalOverlay = styled.div` position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0, 0, 0, 0.7); display: flex; align-items: center; justify-content: center; z-index: 1050; animation: fadeIn 0.3s; `;
const ModalContent = styled.div` background-color: var(--background-secondary); padding: 25px; border-radius: 8px; width: 90%; max-width: 800px; max-height: 90vh; overflow-y: auto; position: relative; animation: fadeInUp 0.4s ease-out; `;
const CloseButton = styled.button` position: absolute; top: 10px; right: 10px; background: transparent; border: none; font-size: 1.5rem; color: var(--text-muted); cursor: pointer; `;
const LoadingMsg = styled.p` color: var(--text-muted); font-style: italic; text-align: center; padding: 40px; font-size: 1.1em; `;
const FullListModalContent = styled(ModalContent)` max-width: 500px; `;
const UserList = styled.ul` list-style: none; padding: 0; margin: 0; max-height: 60vh; overflow-y: auto; `;
const UserListItem = styled.li` display: flex; align-items: center; padding: 10px; border-bottom: 1px solid var(--border-secondary); &:last-child { border-bottom: none; } `;
const UserListAvatar = styled.img` width: 40px; height: 40px; border-radius: 50%; margin-right: 15px; object-fit: cover; `;
const UserListInfo = styled.div` display: flex; flex-direction: column; `;
const UserListName = styled.span` font-weight: 600; color: var(--text-primary); `;
const UserListJobTitle = styled.span` font-size: 0.9em; color: var(--text-secondary); `;

const WorkwaveDashboard = ({ userRole }) => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState('');
    const isAdmin = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';

    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [selectedUserForModal, setSelectedUserForModal] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [modalError, setModalError] = useState('');
    
    const [isNotCheckedInModalOpen, setIsNotCheckedInModalOpen] = useState(false);

    const getFullImageUrl = useCallback((path) => {
        if (!path) return defaultAvatar;
        const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
        return `${baseUrl}${path}`;
    }, []);

    const loadDashboardInfo = useCallback(async (isRefresh = false) => {
        if (!isRefresh) setLoading(true); else setIsRefreshing(true);
        try {
            const dashData = await fetchDashboardData();
            setDashboardData(dashData || {});
            setError('');
        } catch (err) {
            setError(err.message || "Failed to load dashboard data.");
            if (!isRefresh) setDashboardData(null);
        } finally {
            if (!isRefresh) setLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    useEffect(() => { loadDashboardInfo(false); }, [loadDashboardInfo]);

    const handleOpenProfileModal = async (userId) => {
        setModalLoading(true);
        setModalError('');
        setIsProfileModalOpen(true);
        try {
           const userData = isAdmin ? await fetchUserByIdForAdmin(userId) : await fetchPublicUserProfile(userId); 
           setSelectedUserForModal(userData);
        } catch (err) {
            setModalError(`Failed to fetch user details: ${err.message}`);
        } finally {
            setModalLoading(false);
        }
    };

    const handleCloseProfileModal = () => {
        setIsProfileModalOpen(false);
        setSelectedUserForModal(null);
        setModalError('');
    };

    const handleOpenNotCheckedInModal = () => {
        setIsNotCheckedInModalOpen(true);
    };

    const handleCloseNotCheckedInModal = () => {
        setIsNotCheckedInModalOpen(false);
    };
    
    if (loading) return <LoadingPlaceholder>Loading Dashboard...</LoadingPlaceholder>;
    if (error && !dashboardData) return <ErrorPlaceholder>Error: {error}<button onClick={() => loadDashboardInfo(false)}>Retry</button></ErrorPlaceholder>;

    const {
        kpis = {}, engagementChart = {}, upcomingMeetings = [],
        actionNeeded = null, notCheckedInUsers = [], notices = [],
        upcomingBirthdays = [],
        recentBirthdays = []
    } = dashboardData || {};

    const employeeKpi = kpis.employee || { value: 'N/A', trend: '' };
    const attendeesKpi = kpis.attendees || { value: 'N/A', trend: '' };
    const recruitmentKpi = kpis.recruitment || { value: 'N/A', trend: '' };
    const engagementData = engagementChart.engagementByDepartment || {};

    return (
        <>
            <div className="workwave-dashboard">
                {/* The global header from App.jsx handles the welcome banner. */}
                {/* This dashboard body is now clean. */}

                {isRefreshing && <div style={{ textAlign: 'center', padding: '5px', fontSize: '0.8em', color: 'var(--text-muted)' }}>Refreshing data...</div>}
                
                {/* Row 1: KPIs */}
                {/* MODIFICATION: Add animation classes */}
                <div className="dashboard-row layout-kpi-row dashboard-row-animate">
                    <KpiCard title="Employees" value={employeeKpi.value} trend={employeeKpi.trend} />
                    <KpiCard title="Attendees Today" value={attendeesKpi.value} trend={attendeesKpi.trend} />
                    <KpiCard title="Active Recruitment" value={recruitmentKpi.value} trend={recruitmentKpi.trend} />
                </div>

                {/* Row 2: Engagement Chart and Calendar */}
                {/* MODIFICATION: Add animation classes with a delay */}
                <div className="dashboard-row layout-chart-calendar-row dashboard-row-animate delay-1">
                    <div className="engagement-chart-container widget-card"><EngagementChart data={engagementData} /></div>
                    <div className="calendar-container"><CalendarWidget /></div>
                </div>

                {/* Row 3: Meetings & Not Checked In */}
                {/* MODIFICATION: Add animation classes with a delay */}
                <div className="dashboard-row layout-meetings-absent-row dashboard-row-animate delay-2">
                    <div className="meetings-action-group-container">
                        <MeetingsWidget meetings={upcomingMeetings} onUpdate={() => loadDashboardInfo(true)} />
                    </div>
                    <div className="not-checked-in-container widget-card">
                        <NotCheckedInWidget 
                            users={notCheckedInUsers} 
                            onUserClick={handleOpenProfileModal}
                            onShowAllClick={handleOpenNotCheckedInModal} 
                        />
                    </div>
                </div>

                {/* Row 4: Action Needed (Admin only) */}
                {isAdmin && (
                    // MODIFICATION: Add animation classes with a delay
                    <div className="dashboard-row dashboard-row-animate delay-3">
                        <div className="noticeboard-container">
                            {actionNeeded ? (
                                <ActionNeededWidget message={actionNeeded.message} url={actionNeeded.callToActionUrl} />
                            ) : (
                                <div className="widget-card action-needed-clear">
                                    <h4>Action Needed</h4>
                                    <div className="widget-content"><p>No pending actions requiring attention.</p></div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                
                {/* Row 5: Birthdays and Notices */}
                {/* MODIFICATION: Add animation classes with a delay */}
                <div className="dashboard-row dashboard-row-animate delay-4">
                    <div style={{ flex: '1 1 400px', minWidth: '320px' }}>
                        <BirthdaysWidget upcoming={upcomingBirthdays} recent={recentBirthdays} />
                    </div>
                    <div style={{ flex: '2 1 600px', minWidth: '400px' }}>
                         <NoticeboardWidget notices={notices} />
                    </div>
                </div>
            </div>

            {/* All Modals */}
            {isProfileModalOpen && (
                <ModalOverlay onClick={handleCloseProfileModal}>
                    <ModalContent onClick={e => e.stopPropagation()}>
                        <CloseButton onClick={handleCloseProfileModal}><FaTimes /></CloseButton>
                        {modalLoading && <LoadingMsg>Loading Profile...</LoadingMsg>}
                        {modalError && <p className="message-display error">{modalError}</p>}
                        {selectedUserForModal && <EmployeeProfileCard user={selectedUserForModal} />}
                    </ModalContent>
                </ModalOverlay>
            )}
            

            {isNotCheckedInModalOpen && (
                <ModalOverlay onClick={handleCloseNotCheckedInModal}>
                    <FullListModalContent onClick={e => e.stopPropagation()}>
                        <CloseButton onClick={handleCloseNotCheckedInModal}><FaTimes /></CloseButton>
                        <h3 style={{marginTop: 0, borderBottom: '1px solid var(--border-primary)', paddingBottom: '10px'}}>
                            Not Checked In Today ({notCheckedInUsers.length})
                        </h3>
                        <UserList>
                            {notCheckedInUsers.map(user => (
                                <UserListItem key={user.id}>
                                    <UserListAvatar 
                                        src={getFullImageUrl(user.profilePictureUrl)}
                                        alt={user.name}
                                        onError={(e) => { e.target.onerror = null; e.target.src=defaultAvatar; }}
                                    />
                                    <UserListInfo>
                                        <UserListName>{user.name}</UserListName>
                                        <UserListJobTitle>{user.designation}</UserListJobTitle>
                                    </UserListInfo>
                                </UserListItem>
                            ))}
                        </UserList>
                    </FullListModalContent>
                </ModalOverlay>
            )}
        </>
    );
};

export default WorkwaveDashboard;