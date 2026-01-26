import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaRegUserCircle, FaBuilding } from 'react-icons/fa'; // Icons
import { fetchUserProfile, getAttendanceStatus, clockIn, clockOut } from '../services/apiService'; // Import API

// --- Styled Components ---
const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 25px; /* Increased padding */
  background-color: #ffffff; /* White background */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Subtle shadow */
  height: 60px; /* Fixed height */
  position: sticky; /* Make header sticky */
  top: 0;
  z-index: 100; /* Ensure it's above sidebar content if needed */
  width: 100%; /* Take full width */
  box-sizing: border-box;
`;

const UserInfoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 15px; /* Space between elements */
`;

const WelcomeText = styled.span`
  font-size: 1em;
  color: #333;
  font-weight: 500;
`;

const CompanyInfo = styled.span`
  font-size: 0.9em;
  color: #666;
  display: flex;
  align-items: center;
  gap: 5px;
  background-color: #f0f0f0; /* Light background */
  padding: 4px 8px;
  border-radius: 4px;
`;

const ClockButton = styled.button`
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;
  display: flex;
  align-items: center;
  gap: 5px;
  background-color: ${props => (props.clockedIn ? '#dc3545' : '#28a745')}; /* Red if clocked in, Green if out */
  color: white;
  &:disabled {
      background-color: #ccc;
      cursor: not-allowed;
  }
`;


const Header = ({ isLoggedIn }) => { // Removed onLogout, Sidebar handles it
    const [userData, setUserData] = useState(null);
    const [attendanceStatus, setAttendanceStatus] = useState(null);
    const [loadingStatus, setLoadingStatus] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState('');


    useEffect(() => {
        const loadData = async () => {
             if (!isLoggedIn) {
                 setUserData(null);
                 setAttendanceStatus(null);
                 return;
             }
             setLoadingStatus(true);
             setError('');
            try {
                // Fetch profile and status in parallel
                const [profile, status] = await Promise.all([
                    fetchUserProfile(),
                    getAttendanceStatus()
                ]);
                setUserData(profile);
                setAttendanceStatus(status);
            } catch (err) {
                console.error("Header load error:", err);
                setError("Failed to load header data.");
                 // Handle auth errors specifically if needed
                 if (err.message.includes("Authentication failed")) {
                     // Logout logic might be needed here or rely on App.jsx
                 }
            } finally {
                 setLoadingStatus(false);
            }
        };
        loadData();
    }, [isLoggedIn]); // Rerun when login status changes


    const handleClockAction = async () => {
         setActionLoading(true);
         setError('');
         try {
             if (attendanceStatus?.clockedIn) {
                 await clockOut();
             } else {
                 await clockIn();
             }
             // Refresh status
             const newStatus = await getAttendanceStatus();
             setAttendanceStatus(newStatus);
         } catch (err) {
              console.error("Clock action error:", err);
              setError(`Clock action failed: ${err.message}`);
         } finally {
              setActionLoading(false);
         }
     };


     // Only render if logged in and data is available
     if (!isLoggedIn || !userData) {
         // Optionally return a simplified header for logged-out state or null
         return null;
         /* Example Logged Out Header:
         return (
             <HeaderContainer>
                 <Logo>HRMS</Logo>
                 <Nav>Links for logged out users</Nav>
             </HeaderContainer>
         );
         */
     }


    return (
        <HeaderContainer>
             {/* Left side can be logo or empty */}
             <div>{/* Placeholder for left content */}</div>

             {/* Right side: User Info & Clock Button */}
            <UserInfoContainer>
                <WelcomeText>
                    Hi, {userData.firstName || userData.username}!
                </WelcomeText>

                 {userData.company && (
                    <CompanyInfo>
                        <FaBuilding /> {userData.company.name}
                     </CompanyInfo>
                 )}

                 {/* Clock In/Out Button */}
                 {loadingStatus ? (
                     <span>Loading status...</span>
                 ) : attendanceStatus ? (
                     <ClockButton
                         onClick={handleClockAction}
                         disabled={actionLoading || loadingStatus}
                         clockedIn={attendanceStatus.clockedIn}
                     >
                         {actionLoading ? '...' : (attendanceStatus.clockedIn ? 'Clock Out' : 'Clock In')}
                     </ClockButton>
                 ) : (
                      <span title={error}>Status N/A</span> // Show error on title
                 )}
                  {error && <span style={{color: 'red', fontSize: '0.8em', marginLeft: '10px'}}>{error}</span>}

            </UserInfoContainer>
        </HeaderContainer>
    );
};

export default Header;