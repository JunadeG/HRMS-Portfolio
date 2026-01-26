// src/components/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import {
    FaTachometerAlt, FaUserCircle, FaUserClock, FaUsersCog, FaUserCheck, FaSignOutAlt,
    FaBuilding, FaBullhorn, FaCalendarPlus, FaSun, FaMoon,
    FaCalendarAlt, FaCalendarCheck // <<< Ensure these are imported
} from 'react-icons/fa';

// Styled Components using CSS Variables (Keep existing styles)
const SidebarContainer = styled.div`
  width: 220px;
  background-color: var(--sidebar-background);
  color: var(--sidebar-text);
  padding: 20px 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.2);
  transition: background-color 0.3s ease, color 0.3s ease;
`;

const LogoContainer = styled.div`
  padding: 0 20px 20px 20px;
  text-align: center;
  border-bottom: 1px solid var(--sidebar-separator);
  margin-bottom: 20px;
   display: flex; align-items: center; justify-content: center; gap: 10px;
`;

const LogoIcon = styled(FaBuilding)`
   font-size: 1.8em;
   color: #3498db; /* Keep logo accent or use a variable */
`;

const LogoText = styled.h1`
  font-size: 1.3em;
  color: var(--sidebar-text);
  margin: 0; font-weight: 600;
`;

const SidebarNav = styled.nav` flex-grow: 1; overflow-y: auto; `;
const NavList = styled.ul` list-style: none; padding: 0; margin: 0; `;
const NavItem = styled.li` margin: 0; `;

const StyledNavLink = styled(NavLink)`
  display: flex; align-items: center; padding: 12px 20px;
  text-decoration: none;
  color: var(--sidebar-text-secondary);
  font-size: 0.95em;
  transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
  gap: 12px;
  border-left: 4px solid transparent;

  &:hover {
    background-color: var(--sidebar-hover-bg);
    color: var(--sidebar-text);
  }

  &.active {
    background-color: var(--sidebar-active-bg);
    color: var(--sidebar-text);
    font-weight: 500;
    border-left-color: var(--sidebar-active-border); /* Use variable */
  }

  svg { font-size: 1.1em; min-width: 20px; }
`;

const SidebarButton = styled.button`
  display: flex; align-items: center; gap: 12px;
  background-color: transparent; border: none;
  color: var(--sidebar-text-secondary);
  padding: 12px 20px; width: 100%; text-align: left;
  cursor: pointer; font-size: 0.95em;
  transition: background-color 0.2s ease, color 0.2s ease;
   svg { font-size: 1.1em; min-width: 20px; }
`;

const LogoutButton = styled(SidebarButton)`
  margin-top: 10px;
  border-top: 1px solid var(--sidebar-separator);
  &:hover { background-color: #e74c3c; color: #ffffff; } /* Keep red hover */
`;

const ThemeToggleButton = styled(SidebarButton)`
    margin-top: auto;
    justify-content: flex-start; /* Align items to left */
    border-top: 1px solid var(--sidebar-separator);
     &:hover {
       background-color: var(--sidebar-hover-bg);
       color: var(--sidebar-text);
     }
`;
// --- Component ---
const Sidebar = ({ userRole, onLogout, theme, toggleTheme }) => {
  // Determine if user is admin based on the role prop
  const isAdmin = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';
  // *** ADD CONSOLE LOG HERE TO CHECK ROLE RECEIVED ***
  console.log("Sidebar component received userRole prop:", userRole, "isAdmin flag calculated as:", isAdmin);

  return (
    <SidebarContainer>
      <LogoContainer>
         <LogoIcon />
        <LogoText>HRMS Portal</LogoText>
      </LogoContainer>

      <SidebarNav>
        <NavList>
          {/* Standard Links */}
          <NavItem><StyledNavLink to="/dashboard" end><FaTachometerAlt /> Dashboard</StyledNavLink></NavItem>
          <NavItem><StyledNavLink to="/profile"><FaUserCircle /> My Profile</StyledNavLink></NavItem>
           <NavItem><StyledNavLink to="/attendance"><FaUserClock /> Attendance</StyledNavLink></NavItem>

          {/* --- User Leave Link (OUTSIDE admin check) --- */}
          <NavItem><StyledNavLink to="/leave"><FaCalendarAlt /> Leave Management</StyledNavLink></NavItem>

           {/* Admin Only Links */}
           {/* --- The conditional block for admin links --- */}
           {isAdmin && (
            <>
              <NavItem><StyledNavLink to="/admin/user-management"><FaUsersCog /> User Management</StyledNavLink></NavItem>
              <NavItem><StyledNavLink to="/admin/pending-approvals"><FaUserCheck /> Pending Users</StyledNavLink></NavItem>
              {/* --- Admin Leave Approval Link (INSIDE admin check) --- */}
              <NavItem><StyledNavLink to="/admin/leave-approvals"><FaCalendarCheck /> Leave Approvals</StyledNavLink></NavItem>
              <NavItem><StyledNavLink to="/admin/create-notice"><FaBullhorn /> Create Notice</StyledNavLink></NavItem>
              <NavItem><StyledNavLink to="/admin/create-meeting"><FaCalendarPlus /> Schedule Meeting</StyledNavLink></NavItem>
            </>
          )}
          {/* --- End of conditional admin block --- */}
        </NavList>
      </SidebarNav>

      {/* Theme Toggle Button */}
      <ThemeToggleButton onClick={toggleTheme} title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}>
          {theme === 'light' ? <FaMoon /> : <FaSun />}
          <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
      </ThemeToggleButton>

      {/* Logout Button */}
      <LogoutButton onClick={onLogout}>
         <FaSignOutAlt /> Logout
      </LogoutButton>
    </SidebarContainer>
  );
};

export default Sidebar;