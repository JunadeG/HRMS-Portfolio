// src/components/Dashboard/DashboardPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// --- Import ALL Child Components used in the dashboard ---
// Admin specific:
import AdminUserManagement from './AdminUserManagement';
import PendingApprovals from './PendingApprovals';
// 'Me' section sub-tab components:
import EmployeeOverview from './EmployeeOverview';     // [cite: 350, 789]
import TimeAttendance from './TimeAttendance';       // [cite: 350, 842]
import Performance from './Performance';           // [cite: 350, 794]
import Recruitment from './Recruitment';           // [cite: 350, 797]
// Potentially other components for 'Inbox', 'My Team' if they exist
// import InboxComponent from './InboxComponent';
// import MyTeamComponent from './MyTeamComponent';

// Import Styles
import '../../styles/stylesHomePage.css'; // Main dashboard layout styles
import '../../styles/themes.css';         // Theme styles

const DashboardPage = () => {
    // --- State Variables ---
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sidebarTab, setSidebarTab] = useState(''); // Initialize empty, will be set based on role
    const [isAdmin, setIsAdmin] = useState(false);
    const [activeTab, setActiveTab] = useState('Job Details'); // Default sub-tab for 'Me' section
    const [theme, setTheme] = useState('default');
    const [logoClicks, setLogoClicks] = useState(0);

    const navigate = useNavigate();

    // --- Theme Toggle Logic ---
    const handleThemeTriggerClick = useCallback(() => {
        const newClickCount = logoClicks + 1;
        setLogoClicks(newClickCount);
        if (newClickCount >= 5) {
            setTheme(currentTheme =>
                currentTheme === 'default' ? 'dark' :
                currentTheme === 'dark' ? 'retro' : 'default'
            );
            setLogoClicks(0);
            console.log("Theme toggled!");
        } else if (newClickCount > 2) {
            console.log(`Theme toggle trigger click ${newClickCount}... keep going?`);
        }
    }, [logoClicks]);

    // --- Fetch User Data on Load ---
    useEffect(() => {
        const fetchUserData = async () => {
            setLoading(true);
            setError(null);
            setIsAdmin(false); // Reset admin status
            const token = localStorage.getItem('jwtToken');

            if (!token) {
                setError("Authentication token not found. Please log in.");
                setLoading(false);
                navigate('/');
                return;
            }

            try {
                const response = await fetch('http://localhost:8080/users/profile', {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    setUserData(data);
                    console.log("Fetched user data:", data);

                    // Check role and set initial sidebar tab
                    if (data.role === 'ADMIN' || data.role === 'SUPER_ADMIN') {
                        setIsAdmin(true);
                        // Default admin view, check if current tab is valid for admin
                         if (!sidebarTab || !['Admin Dashboard', 'Pending Approvals', 'Me', 'Inbox', 'My Team'].includes(sidebarTab)) {
                             setSidebarTab('Admin Dashboard'); // Default Admin to Admin Dashboard
                         }
                    } else {
                        setIsAdmin(false);
                         // Default user view, ensure not on admin-only tab
                         if (!sidebarTab || ['Admin Dashboard', 'Pending Approvals'].includes(sidebarTab)) {
                             setSidebarTab('Me'); // Default User to 'Me'
                         }
                    }
                     // If sidebarTab is still empty after checks (e.g., first load), set a default
                    if (!sidebarTab) {
                        setSidebarTab(data.role === 'ADMIN' || data.role === 'SUPER_ADMIN' ? 'Admin Dashboard' : 'Me');
                    }

                } else {
                    // Handle HTTP errors
                    const errorText = await response.text();
                    console.error('HTTP error fetching profile:', response.status, errorText);
                    setError(`Error fetching profile: ${response.status} ${errorText || response.statusText}`);
                    if (response.status === 401 || response.status === 403) {
                        localStorage.removeItem('jwtToken');
                        navigate('/');
                    }
                    setUserData(null);
                }
            } catch (err) {
                // Handle network errors
                console.error('Network error fetching profile:', err);
                setError(`Network error: ${err.message}.`);
                setUserData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
     // sidebarTab removed from dependency array to prevent re-fetching on tab click
    }, [navigate]);


    // --- Sidebar Item Definition ---
    const getSidebarItems = () => {
        // Items visible to everyone (User & Admin)
        const baseItems = [
            { key: 'Me', label: 'Me' },
            { key: 'Inbox', label: 'Inbox' },
            { key: 'My Team', label: 'My Team' }
        ];
        if (isAdmin) {
            // Add Admin-specific items at the beginning
            return [
                { key: 'Admin Dashboard', label: 'Admin Dashboard' },
                { key: 'Pending Approvals', label: 'Pending Approvals' },
                ...baseItems // Append the base items
            ];
        }
        // Return only base items for regular users
        return baseItems;
    };

    // --- Main Content Area Rendering ---
    const renderSidebarContent = () => {
        if (loading) {
            return <div className="user-info-container"><p>Loading dashboard...</p></div>;
        }
        // Display error prominently if it affected loading the primary view
        if (error && !userData && sidebarTab !== 'Admin Dashboard' && sidebarTab !== 'Pending Approvals') {
             return <div className="user-info-container" style={{ color: 'red' }}>Error loading user data: {error}</div>;
        }
        if (!loading && !userData && !error && sidebarTab === 'Me') {
             return <div className="user-info-container">User data not available.</div>;
        }


        const currentToken = localStorage.getItem('jwtToken');

        switch (sidebarTab) {
            case 'Me':
                 // Should only render if userData is available
                 if (!userData) return <div className="user-info-container">Loading user details... {error && `Error: ${error}`}</div>;
                return (
                    <div className="user-info-container">
                        <h2 style={{ fontSize: '1.5em', marginBottom: '10px', cursor: 'pointer', userSelect: 'none' }}
                            onClick={handleThemeTriggerClick}
                            title="Click 5 times to toggle theme"
                        >
                            {userData.username} ({userData.role})
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <p><strong>Name:</strong> {userData.firstName} {userData.lastName}</p>
                            <p><strong>Mobile:</strong> {userData.mobileNumber || 'N/A'}</p>
                            <p><strong>Company:</strong> {userData.company?.name || 'N/A'}</p>
                            <p><strong>Department:</strong> {userData.department || 'N/A'}</p>
                            {error && <p style={{color: 'orange', marginTop: '10px'}}>Note: {error}</p>}
                        </div>
                    </div>
                );

            case 'Admin Dashboard':
                if (!isAdmin) return null;
                 // Handle loading/error specifically for this admin view if necessary
                if (loading) return <p>Loading Admin data...</p>
                if (error) return <div style={{color:'red'}}>Error loading Admin Dashboard: {error}</div>
                return <AdminUserManagement token={currentToken} companyId={userData?.company?.id} />;

            case 'Pending Approvals':
                if (!isAdmin) return null;
                if (loading) return <p>Loading Approvals...</p>
                 if (error) return <div style={{color:'red'}}>Error loading Pending Approvals: {error}</div>
                return <PendingApprovals token={currentToken} />;

            // --- Render placeholders or actual components for Inbox/Team ---
            case 'Inbox':
                 if (loading) return <p>Loading Inbox...</p>
                 if (error) return <div className="widget" style={{color:'red'}}><h2>Inbox</h2>Error: {error}</div>
                // Replace with <InboxComponent /> if it exists
                return <div className="widget"><h2>Inbox</h2><p>Inbox functionality coming soon...</p></div>;
            case 'My Team':
                 if (loading) return <p>Loading Team...</p>
                 if (error) return <div className="widget" style={{color:'red'}}><h2>My Team</h2>Error: {error}</div>
                 // Replace with <MyTeamComponent /> if it exists
                return <div className="widget"><h2>My Team</h2><p>Team view functionality coming soon...</p></div>;

            default:
                 // Fallback if sidebarTab is somehow invalid
                 if (error) return <div className="user-info-container" style={{color: 'red'}}>Error: {error}</div>;
                return <div className="user-info-container">Select an option from the sidebar.</div>;
        }
    };

    // --- 'Me' Section Sub-Tab Content Rendering ---
    const renderTabContent = () => {
        // Ensure userData is available before rendering sub-tabs
        if (!userData) return <p>Loading details...</p>;

        switch (activeTab) {
            case 'Job Details':
                return (
                    <div>
                        <h2>Job Details</h2>
                        <p><strong>Position:</strong> {userData.jobTitle || 'N/A'}</p>
                        <p><strong>Department:</strong> {userData.department || 'N/A'}</p>
                        <p><strong>Start Date:</strong> {userData.startDate || 'N/A'}</p>
                        {/* Add more fields as available in your User model */}
                    </div>
                );

            // --- Render other sub-tab components ---
            case 'Employee Overview':
                 // Check if the component was imported
                 return typeof EmployeeOverview === 'function' ? <EmployeeOverview /> : <p>Employee Overview content coming soon...</p>;
            case 'Time & Attendance':
                return typeof TimeAttendance === 'function' ? <TimeAttendance /> : <p>Time & Attendance content coming soon...</p>;
            case 'Performance':
                return typeof Performance === 'function' ? <Performance /> : <p>Performance content coming soon...</p>;
            case 'Recruitment':
                return typeof Recruitment === 'function' ? <Recruitment /> : <p>Recruitment content coming soon...</p>;
            // Add more cases for other sub-tabs if needed

            default:
                return <p>Select a sub-tab to view details.</p>;
        }
    };

    // --- Get Sidebar Items ---
    const sidebarItems = getSidebarItems();

    // --- JSX Render ---
    return (
        <div className={`dashboard-page theme-${theme}`}>
            {/* Sidebar Navigation */}
            <div className="sidebar">
                <ul>
                    {sidebarItems.map(item => (
                        <li
                            key={item.key}
                            onClick={() => {
                                // setError(null); // Optionally clear errors on tab change
                                setSidebarTab(item.key);
                            }}
                            className={sidebarTab === item.key ? 'active' : ''}
                        >
                            {item.label}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Main Dashboard Content Area */}
            <div className="dashboard-content">
                {/* Render the main content based on sidebarTab */}
                {renderSidebarContent()}

                {/* --- Conditionally render the 'Me' section's sub-tabs --- */}
                {/* Show only if 'Me' is selected, not loading, and user data exists */}
                {sidebarTab === 'Me' && !loading && userData && (
                    <>
                        {/* Sub-tab navigation bar */}
                        <div className="tabs">
                            <button className={activeTab === 'Job Details' ? 'active' : ''} onClick={() => setActiveTab('Job Details')}>Job Details</button>
                            {/* --- Add buttons for other sub-tabs --- */}
                            <button className={activeTab === 'Employee Overview' ? 'active' : ''} onClick={() => setActiveTab('Employee Overview')}>Overview</button>
                            <button className={activeTab === 'Time & Attendance' ? 'active' : ''} onClick={() => setActiveTab('Time & Attendance')}>Time & Attendance</button>
                            <button className={activeTab === 'Performance' ? 'active' : ''} onClick={() => setActiveTab('Performance')}>Performance</button>
                            <button className={activeTab === 'Recruitment' ? 'active' : ''} onClick={() => setActiveTab('Recruitment')}>Recruitment</button>
                        </div>

                        {/* Content area for the selected sub-tab */}
                        <div className="tab-content">
                            {renderTabContent()}
                        </div>
                    </>
                )}
                 {/* Display loading message specifically for the 'Me' tab area if needed */}
                 {sidebarTab === 'Me' && loading && <p style={{marginTop: '20px'}}>Loading user details for tabs...</p>}
            </div>
        </div>
    );
};

export default DashboardPage;