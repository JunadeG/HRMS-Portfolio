// DashboardPage.jsx

import React, { useState, useEffect } from 'react'; // [cite: 215]
import { useNavigate } from 'react-router-dom'; // [cite: 216]
import EmployeeOverview from './EmployeeOverview'; // [cite: 216]
import EmployeeManagement from './EmployeeManagement'; // [cite: 216]
import TimeAttendance from './TimeAttendance'; // [cite: 216]
import Performance from './Performance'; // [cite: 217]
import Recruitment from './Recruitment'; // [cite: 217]
// Removed Sidebar import as sidebar structure is now inside this component
// import Sidebar from './Sidebar';
import Announcements from './Announcements'; // [cite: 217]
import EmployeeDemographics from './EmployeeDemographics'; // [cite: 217]
import '../../styles/styles.css'; // [cite: 218]
import '../../styles/stylesHomePage.css'; // [cite: 218]
// --- Import the new CSS file for themes ---
import '../../styles/themes.css';


const DashboardPage = () => { // [cite: 218]
    const [activeTab, setActiveTab] = useState('Job Details'); // [cite: 218]
    const navigate = useNavigate(); // [cite: 219]
    const [userData, setUserData] = useState(null); // [cite: 219]
    const [loading, setLoading] = useState(true); // [cite: 219]
    const [error, setError] = useState(null); // [cite: 219]
    const [sidebarTab, setSidebarTab] = useState('Me'); // [cite: 220]

    // --- Theme State and Logic ---
    const [theme, setTheme] = useState('default'); // 'default', 'dark', 'retro'
    const [logoClicks, setLogoClicks] = useState(0); // Counter for trigger

    const handleThemeTriggerClick = () => { // Renamed for clarity
        const newClickCount = logoClicks + 1;
        setLogoClicks(newClickCount);

        if (newClickCount >= 5) { // Trigger after 5 clicks
            setTheme(currentTheme => {
                if (currentTheme === 'default') return 'dark';
                if (currentTheme === 'dark') return 'retro';
                return 'default'; // Cycle back
            });
            setLogoClicks(0); // Reset counter
            console.log("Theme toggled!");
        } else if (newClickCount > 2) {
            console.log(`Theme toggle trigger click ${newClickCount}... keep going?`);
        }
    };
    // --- End Theme State and Logic ---

    useEffect(() => { //
        const fetchUserData = async () => {
            setLoading(true);
            setError(null); // Reset error state on new fetch
            try {
                const token = localStorage.getItem('jwtToken');
                console.log('Token from localStorage:', token); // [cite: 221]

                if (!token) {
                    setError("No token found. Please log in.");
                    setLoading(false);
                    // Optionally redirect to login
                    // navigate('/');
                    return;
                }

                const response = await fetch('http://localhost:8080/users/profile', { // [cite: 222]
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`, // [cite: 223]
                        'Content-Type': 'application/json' // [cite: 223]
                    }
                });

                console.log('Raw Response Status:', response.status); // [cite: 224] (Log status)

                if (response.ok) {
                    const data = await response.json(); // [cite: 225]
                    console.log('Fetched user data:', data); // [cite: 226]
                    setUserData(data);
                    setError(null); // Clear error on success
                } else {
                    // Handle non-OK responses more robustly
                    const errorText = await response.text();
                    console.error('HTTP error:', response.status, errorText); // [cite: 230]
                    if (response.status === 401 || response.status === 403) {
                         setError('Authentication failed. Please log in again.');
                         // Optionally clear token and redirect
                         // localStorage.removeItem('jwtToken');
                         // navigate('/');
                    } else if (response.status === 404) {
                         setError('User profile not found.'); // [cite: 227]
                    } else {
                       setError(`Error fetching user data: ${response.status} ${errorText || response.statusText}`); // [cite: 230]
                    }
                     setUserData(null); // Clear data on error [cite: 228, 232]
                }
            } catch (err) {
                console.error('Fetch error:', err); // [cite: 232]
                setError(`Network error or server unavailable: ${err.message}`); // [cite: 232]
                setUserData(null); // [cite: 232]
            } finally {
                setLoading(false); // [cite: 233]
            }
        };

        fetchUserData();
    }, [navigate]); // Added navigate to dependency array if used inside effect for redirection

    const renderTabContent = () => { // [cite: 234]
        switch (activeTab) {
            case 'Job Details': // [cite: 234]
                return (
                    <div>
                        <h2>Job Details</h2>
                        <p>This section displays details about the job.</p> {/* [cite: 235] */}
                    </div>
                );
            case 'Employee Overview': // [cite: 236]
                return <EmployeeOverview />; // [cite: 236]
            case 'Time & Attendance': // [cite: 237]
                return <TimeAttendance />; // [cite: 237]
            case 'Performance': // [cite: 238]
                return <Performance />; // [cite: 238]
            case 'Recruitment': // [cite: 239]
                return <Recruitment />; // [cite: 239]
            default: // [cite: 240]
                return (
                    <div>
                        <h2>Select a Tab</h2>
                        <p>Please select a tab to view its content.</p> {/* [cite: 241] */}
                    </div>
                ); // [cite: 241]
        } // [cite: 242]
    };

    const renderSidebarContent = () => {
      // Moved content rendering logic here based on sidebarTab
      if (loading) {
          return <p>Loading user details...</p>;
      }
      if (error) {
          // Display error prominently if sidebar content depends on user data
          return <div className="user-info-container" style={{ color: 'red' }}>Error loading data: {error}</div>;
      }
      if (!userData) {
          // Handle case where loading is false, no error, but no user data (e.g., 404)
          return <div className="user-info-container">User data not available.</div>;
      }
  
      console.log("userData in renderSidebarContent:", userData); // ADDED THIS LINE!
  
      switch (sidebarTab) {
          case 'Me':
              return (
                  <div className="user-info-container">
                      {/* Make username clickable for theme toggle */}
                      <h2
                          style={{ fontSize: '1.5em', marginBottom: '10px', cursor: 'pointer', userSelect: 'none' }}
                          onClick={handleThemeTriggerClick}
                          title="Click 5 times to toggle theme"
                      >
                          {userData?.username || 'Username'}
                      </h2>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                          <p><strong>First Name:</strong> {userData?.firstName || 'N/A'}</p>
                          <p><strong>Last Name:</strong> {userData?.lastName || 'N/A'}</p>
                          <p><strong>Mobile Number:</strong> {userData?.mobileNumber || 'N/A'}</p>
                          <p><strong>Company:</strong> {userData?.company || 'N/A'}</p>
                          <p><strong>Role:</strong> {userData?.role || 'N/A'}</p> {/* Placeholder fix - REPLACE THIS */}
                      </div>
                  </div>
              );
          case 'Inbox':
              return <div className="widget"><h2>Inbox</h2><p>Inbox content goes here...</p></div>; // Added basic structure
          case 'My Team':
              return <div className="widget"><h2>My Team</h2><p>Team information goes here...</p></div>; // Added basic structure
          default:
              // Fallback to 'Me' content if sidebarTab is somehow invalid
              return <div className="user-info-container"><h2>User Details</h2><p>Loading...</p></div>;
      }
  };


    // Main return statement
    return (
         // Apply the theme class dynamically
        <div className={`dashboard-page theme-${theme}`}> {/* [cite: 251] */}
            <div className="sidebar"> {/* [cite: 251] */}
                 {/* Removed the extra H3, assuming structure from stylesHomePage.css */}
                <ul>
                    <li
                        onClick={() => setSidebarTab('Me')} // [cite: 252]
                        className={sidebarTab === 'Me' ? 'active' : ''} // [cite: 252]
                    >
                        Me {/* [cite: 252] */}
                    </li> {/* [cite: 253] */}
                    <li
                        onClick={() => setSidebarTab('Inbox')} // [cite: 253]
                        className={sidebarTab === 'Inbox' ? 'active' : ''} // [cite: 253]
                    >
                        Inbox {/* [cite: 254] */}
                    </li>
                    <li
                        onClick={() => setSidebarTab('My Team')} // [cite: 254]
                        className={sidebarTab === 'My Team' ? 'active' : ''} // [cite: 255]
                    >
                        My Team {/* [cite: 255] */}
                    </li>
                </ul>
            </div> {/* [cite: 256] */}

            <div className="dashboard-content"> {/* [cite: 256] */}
                {/* Render content based on sidebar selection */}
                 {renderSidebarContent()}

                {/* Only show tabs if 'Me' is selected and data is loaded */}
                 {!loading && !error && userData && sidebarTab === 'Me' && (
                    <>
                        <div className="tabs"> {/* [cite: 256] */}
                            <button
                                className={activeTab === 'Job Details' ? 'active' : ''} // [cite: 258]
                                onClick={() => setActiveTab('Job Details')} // [cite: 258]
                            >
                                Job Details {/* [cite: 258] */}
                            </button> {/* [cite: 259] */}
                            <button
                                className={activeTab === 'Employee Overview' ? 'active' : ''} // [cite: 260]
                                onClick={() => setActiveTab('Employee Overview')} // [cite: 260]
                            >
                                Employee Overview {/* [cite: 260] */}
                            </button> {/* [cite: 261] */}
                            {/* Leave Management tab - to be added later */}
                            <button
                                className={activeTab === 'Time & Attendance' ? 'active' : ''} // [cite: 262]
                                onClick={() => setActiveTab('Time & Attendance')} // [cite: 262]
                            >
                                Time & Attendance {/* [cite: 262] */}
                            </button> {/* [cite: 263] */}
                            <button
                                className={activeTab === 'Performance' ? 'active' : ''} // [cite: 264]
                                onClick={() => setActiveTab('Performance')} // [cite: 264]
                            >
                                Performance {/* [cite: 264] */}
                            </button> {/* [cite: 265] */}
                            <button
                                className={activeTab === 'Recruitment' ? 'active' : ''} // [cite: 266]
                                onClick={() => setActiveTab('Recruitment')} // [cite: 266]
                            >
                                Recruitment {/* [cite: 266] */}
                            </button> {/* [cite: 267] */}
                        </div> {/* [cite: 267] */}

                        <div className="tab-content"> {/* [cite: 267] */}
                            {renderTabContent()} {/* [cite: 268] */}
                        </div> {/* [cite: 268] */}
                     </>
                )}

                 {/* Removed redundant divs for Inbox/Team content rendering*/}

            </div>
        </div>
    ); // [cite: 270]
};

export default DashboardPage; // [cite: 270]