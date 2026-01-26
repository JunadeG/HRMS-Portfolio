// src/App.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { fetchUserProfile, fetchUserByIdForAdmin, fetchPublicUserProfile } from './services/apiService';
import GlobalStyles from './styles/GlobalStyles';
import './styles/themes.css';


// Import all components and pages
import Sidebar from './components/Sidebar';
import DashboardHeader from './components/DashboardHeader';
import SearchPalette from './components/SearchPalette';
import EmployeeProfileCard from './components/admin/EmployeeProfileCard';
import HomePage from './components/HomePage';
import WorkwaveDashboard from './Dashboard/WorkwaveDashboard';
import PayslipPage from './pages/PayslipPage';
import ProfilePage from './pages/ProfilePage';
import AttendancePage from './pages/AttendancePage';
import LeaveManagementPage from './pages/LeaveManagementPage';
import MyTeamPage from './pages/MyTeamPage';
import TimesheetPage from './pages/TimesheetPage';
import HelpDeskPage from './pages/HelpDeskPage';
import AdminUserManagement from './components/old_Dashboard/AdminUserManagement';
import PendingApprovals from './components/old_Dashboard/PendingApprovals';
import CreateNoticeForm from './components/admin/CreateNoticeForm';
import CreateMeetingForm from './components/admin/CreateMeetingForm';
import AdminLeaveApprovalPage from './pages/AdminLeaveApprovalPage';
import AdminTimesheetApprovalPage from './pages/AdminTimesheetApprovalPage';
import AdminHelpDeskPage from './pages/AdminHelpDesk';
import AdminAttendancePage from './pages/AdminAttendancePage';
import AdminPayrollConfigurationPage from './pages/AdminPayrollConfiguration';
import AdminSalaryManagement from './pages/AdminSalaryManagement';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import ResetPasswordPage from './components/old_Dashboard/ResetPasswordPage';
import RegistrationPopup from './components/RegistrationPopup';
import AdminProjectManagementPage from './pages/AdminProjectManagementPage'; 
import AdminAttendanceCorrectionsPage from './pages/AdminAttendanceCorrectionsPage';
import AdminAssetManagementPage from './pages/AdminAssetManagementPage';
import AdminDocumentVerificationPage from './pages/AdminDocumentVerificationPage';
import MyTasksPage from './pages/MyTasksPage';




// --- Styled Components for Modal & Loading ---
const ModalOverlay = styled.div` position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0, 0, 0, 0.7); display: flex; align-items: center; justify-content: center; z-index: 1050; animation: fadeIn 0.3s; `;
const ModalContent = styled.div` background-color: var(--background-secondary); padding: 25px; border-radius: 8px; width: 90%; max-width: 800px; max-height: 90vh; overflow-y: auto; position: relative; animation: fadeInUp 0.4s ease-out; `;
const CloseButton = styled.button` position: absolute; top: 10px; right: 10px; background: transparent; border: none; font-size: 1.5rem; color: var(--text-muted); cursor: pointer; `;
const LoadingMsg = styled.p` color: var(--text-muted); font-style: italic; text-align: center; padding: 40px; font-size: 1.1em; `;
const LoadingIndicator = ({ message = "Loading..." }) => ( <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>{message}</div> );

// --- Reusable Profile Modal ---
const EmployeeProfileModal = ({ userId, onClose, userRole }) => {
    const [modalUser, setModalUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadProfile = async () => {
            if (!userId) return;
            setLoading(true);
            try {
                const isAdmin = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';
                const profileData = isAdmin ? await fetchUserByIdForAdmin(userId) : await fetchPublicUserProfile(userId);
                setModalUser(profileData);
            } catch (err) {
                setError(err.message || 'Failed to load profile.');
            } finally {
                setLoading(false);
            }
        };
        loadProfile();
    }, [userId, userRole]);

    return (
        <ModalOverlay onClick={onClose}>
            <ModalContent onClick={e => e.stopPropagation()}>
                <CloseButton onClick={onClose}>×</CloseButton>
                {loading && <LoadingMsg>Loading Profile...</LoadingMsg>}
                {error && <p className="message-display error">{error}</p>}
                {modalUser && <EmployeeProfileCard user={modalUser} />}
            </ModalContent>
        </ModalOverlay>
    );
};

// --- Main Layout ---
// <<< --- THIS IS THE CORRECTED COMPONENT --- >>>
const ProtectedLayout = ({ user, logout, children, onSearchClick, theme, toggleTheme }) => (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        {/* REMOVED theme and toggleTheme from Sidebar */}
        <Sidebar userRole={user.role} onLogout={logout} /> 
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* ADDED theme and toggleTheme props to DashboardHeader */}
            <DashboardHeader 
              user={user} 
              onSearchClick={onSearchClick} 
              theme={theme} 
              toggleTheme={toggleTheme} 
            />
            <main style={{ flexGrow: 1, overflowY: 'auto' }}>
                <div style={{ padding: '25px' }}>{children}</div>
            </main>
        </div>
    </div>
);

const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [loadingAuth, setLoadingAuth] = useState(true);
    const [isPaletteOpen, setIsPaletteOpen] = useState(false);
    const [profileModalUserId, setProfileModalUserId] = useState(null);
    const [isRegistrationPopupOpen, setIsRegistrationPopupOpen] = useState(false);

    // <<< --- THEME LOGIC IS CORRECT AND STAYS HERE --- >>>
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('hrms-theme');
        if (savedTheme) return savedTheme;
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        return prefersDark ? 'dark' : 'light';
    });

    useEffect(() => {
        document.body.className = '';
        document.body.classList.add(`${theme}-theme`);
        localStorage.setItem('hrms-theme', theme);
    }, [theme]);

    const toggleTheme = useCallback(() => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    }, []);
    // --- END THEME LOGIC ---

    const handleLoginSuccess = useCallback(async () => {
        setLoadingAuth(true);
        try {
            const userProfile = await fetchUserProfile();
            setUser(userProfile);
            setIsLoggedIn(true);
        } catch (error) {
            console.error("Login success - failed to fetch profile:", error);
            localStorage.removeItem('jwtToken');
            setUser(null);
            setIsLoggedIn(false);
        } finally {
            setLoadingAuth(false);
        }
    }, []);

    useEffect(() => {
        handleLoginSuccess();
    }, [handleLoginSuccess]);

    const handleLogout = useCallback(() => {
        localStorage.removeItem('jwtToken');
        setUser(null);
        setIsLoggedIn(false);
    }, []);

    const handleSelectEmployeeFromSearch = (employeeId) => {
        setProfileModalUserId(employeeId);
    };
    
    if (loadingAuth) {
        return <LoadingIndicator message="Initializing Application..." />;
    }

    const ProtectedRoute = ({ children }) => {
        const location = useLocation();
        if (!isLoggedIn || !user) {
            return <Navigate to="/login" state={{ from: location }} replace />;
        }
        
        const childrenWithProps = React.Children.map(children, child => {
            if (React.isValidElement(child)) {
                return React.cloneElement(child, { userRole: user.role });
            }
            return child;
        });

        return childrenWithProps;
    };

    return (
        <Router>
            <GlobalStyles />
            {isPaletteOpen && user && <SearchPalette userRole={user.role} onClose={() => setIsPaletteOpen(false)} onSelectEmployee={handleSelectEmployeeFromSearch} />}
            {profileModalUserId && user && <EmployeeProfileModal userId={profileModalUserId} onClose={() => setProfileModalUserId(null)} userRole={user.role} />}

            <Routes>
                <Route path="/login" element={!isLoggedIn ? <HomePage onLoginSuccess={handleLoginSuccess} onRegisterClick={() => setIsRegistrationPopupOpen(true)} /> : <Navigate to="/dashboard" />} />
                <Route path="/forgot-password" element={!isLoggedIn ? <ForgotPasswordPage /> : <Navigate to="/dashboard" />} />
                <Route path="/reset-password/:token" element={!isLoggedIn ? <ResetPasswordPage /> : <Navigate to="/dashboard" />} />
                
                <Route path="/*" element={isLoggedIn && user ? (
                    // <<< --- PASS THEME PROPS DOWN TO THE LAYOUT --- >>>
                    <ProtectedLayout user={user} logout={handleLogout} onSearchClick={() => setIsPaletteOpen(true)} theme={theme} toggleTheme={toggleTheme}>
                        <Routes>
                            <Route path="/dashboard" element={<WorkwaveDashboard />} />
                            <Route path="/my-team" element={<MyTeamPage />} />
                            <Route path="/profile" element={<ProfilePage />} />
                            <Route path="/attendance" element={<AttendancePage />} />
                            <Route path="/leave" element={<LeaveManagementPage />} />
                            <Route path="/timesheets" element={<TimesheetPage />} />
                            <Route path="/payslips" element={<PayslipPage />} />
                            <Route path="/help-desk" element={<HelpDeskPage />} />
                            <Route path="/my-tasks" element={<MyTasksPage />} />
                            
                            
                            
                            <Route path="/admin/user-management" element={<AdminUserManagement />} />
                            <Route path="/admin/manage-tickets" element={<AdminHelpDeskPage />} />
                            <Route path="/admin/attendance-records" element={<AdminAttendancePage />} />
                            <Route path="/admin/pending-approvals" element={<PendingApprovals />} />
                            <Route path="/admin/leave-approvals" element={<AdminLeaveApprovalPage />} />
                            <Route path="/admin/timesheet-approvals" element={<AdminTimesheetApprovalPage />} />
                            <Route path="/admin/payroll-config" element={<AdminPayrollConfigurationPage />} />
                            <Route path="/admin/salary-management" element={<AdminSalaryManagement />} />
                            <Route path="/admin/create-notice" element={<CreateNoticeForm />} />
                            <Route path="/admin/create-meeting" element={<CreateMeetingForm />} />
                            <Route path="/admin/project-management" element={<AdminProjectManagementPage />} />
                            <Route path="/admin/attendance-corrections" element={<AdminAttendanceCorrectionsPage />} />
                            <Route path="/admin/asset-management" element={<AdminAssetManagementPage />} />
                            <Route path="/admin/document-verification" element={<AdminDocumentVerificationPage />} />
                            

                            <Route path="*" element={<Navigate to="/dashboard" />} />
                        </Routes>
                    </ProtectedLayout>
                ) : (
                    <Navigate to="/login" />
                )} />
            </Routes>
            <RegistrationPopup isOpen={isRegistrationPopupOpen} onClose={() => setIsRegistrationPopupOpen(false)} />
        </Router>
    );
};

export default App;