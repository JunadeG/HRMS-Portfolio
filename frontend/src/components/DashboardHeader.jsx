// src/components/DashboardHeader.jsx
import React from 'react';
import styled from 'styled-components';
import { FaSearch, FaBuilding, FaSun, FaMoon } from 'react-icons/fa';
import defaultAvatar from '../assets/images/default-avatar.png';
import { API_BASE_URL } from '../services/apiService';
import { useNavigate } from 'react-router-dom';

const HeaderContainer = styled.header`
  width: 100%;
  padding: 12px 25px;
  background-color: var(--background-secondary);
  border-bottom: 1px solid var(--border-primary);
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
`;

const UserInfoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

// const UserAvatar = styled.img`
//   width: 40px;
//   height: 40px;
//   border-radius: 50%;
//   object-fit: cover;
// `;

const UserAvatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  cursor: pointer; /* Makes the cursor a pointer on hover */
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: scale(1.05); /* Slightly enlarges the avatar on hover */
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--border-accent) 50%, transparent);
  }
`;

const UserTextContainer = styled.div`
  display: flex;
  flex-direction: column;
  line-height: 1.3;
`;

const UserGreeting = styled.h2`
  margin: 0;
  font-size: 1.1em;
  font-weight: 600;
  color: var(--text-primary);
`;

const UserInfoDetails = styled.span`
  font-size: 0.85em;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 5px;
`;

// This container is key to grouping the right-side elements
const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 15px; /* Creates space between the search bar and the theme button */
`;

const SearchTrigger = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 15px;
  border: 1px solid var(--border-primary);
  border-radius: 6px;
  background-color: var(--background-tertiary);
  color: var(--text-muted);
  cursor: pointer;
  font-size: 0.9em;
  min-width: 250px;
  justify-content: space-between;
  transition: all 0.2s ease;

  &:hover {
    color: var(--text-primary);
    border-color: var(--border-accent);
    background-color: var(--background-hover);
  }
`;

const KbdShortcut = styled.kbd`
  background-color: var(--background-secondary);
  border: 1px solid var(--border-secondary);
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 0.8em;
`;

const ThemeToggleButton = styled.button`
  background: transparent;
  border: 1px solid var(--border-primary);
  color: var(--text-secondary);
  width: 38px;
  height: 38px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1em;
  transition: all 0.2s ease;

  &:hover {
    color: var(--text-primary);
    border-color: var(--border-accent);
    background-color: var(--background-hover);
  }
`;

const DashboardHeader = ({ user, onSearchClick, theme, toggleTheme }) => {
    
    // MODIFICATION: Initialize the navigate function
    const navigate = useNavigate();

    const getFullImageUrl = (path) => {
        if (!path) return defaultAvatar;
        return `${API_BASE_URL}${path}`;
    };

    // MODIFICATION: Create a handler function for navigation
    const handleProfileNavigation = () => {
        navigate('/profile');
    };

    return (
        <HeaderContainer>
            <UserInfoContainer>
                {user ? (
                    <>
                        {/* MODIFICATION: Add onClick and title props to the UserAvatar element */}
                        <UserAvatar 
                            src={getFullImageUrl(user.profilePicturePath)}
                            alt="User Avatar - Click to go to profile"
                            title="Go to My Profile"
                            onError={(e) => { e.target.src = defaultAvatar; }}
                            onClick={handleProfileNavigation}
                        />
                        <UserTextContainer>
                            <UserGreeting>Welcome, {user.firstName || 'User'}!</UserGreeting>
                            <UserInfoDetails>
                                {user.jobTitle || 'Employee'} at <FaBuilding style={{ marginLeft: '5px', marginRight: '2px' }} /> {user.companyName || 'Your Company'}
                            </UserInfoDetails>
                        </UserTextContainer>
                    </>
                ) : (
                    <div style={{height: '44px'}}></div>
                )}
            </UserInfoContainer>

            <HeaderActions>
                <SearchTrigger onClick={onSearchClick}>
                    <span><FaSearch style={{marginRight: '8px'}} />Search...</span>
                    <KbdShortcut>Ctrl K</KbdShortcut>
                </SearchTrigger>
                
                <ThemeToggleButton onClick={toggleTheme} title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}>
                    {theme === 'light' ? <FaMoon /> : <FaSun />}
                </ThemeToggleButton>
            </HeaderActions>
        </HeaderContainer>
    );
};

export default DashboardHeader;