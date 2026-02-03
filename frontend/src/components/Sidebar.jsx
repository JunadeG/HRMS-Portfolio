import React from 'react';
import { NavLink } from 'react-router-dom';
// import { FaTasks } from 'react-icons/fa';
import styled from 'styled-components';
import {
    FaTachometerAlt, FaUserCircle, FaUserClock, FaUsersCog, FaUserCheck, FaSignOutAlt,
    FaBuilding, FaBullhorn, FaCalendarPlus,
    FaCalendarAlt, FaCalendarCheck, FaDollarSign, FaMoneyBillWave, FaFileInvoiceDollar,
    FaUsers, FaRegClock, FaCheckSquare, FaLifeRing, FaTasks, FaDesktop,  FaFileAlt
} from 'react-icons/fa';

// --- STYLED COMPONENTS ---

const SidebarContainer = styled.aside`
  width: 240px;
  background-color: var(--sidebar-background);
  color: var(--sidebar-text);
  height: 100vh;
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s ease;
  flex-shrink: 0;
  border-right: 1px solid var(--sidebar-separator);
`;

const LogoContainer = styled.div`
  padding: 1.5rem 1.75rem;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;
  flex-shrink: 0;
  border-bottom: 1px solid var(--sidebar-separator);
`;

const LogoIcon = styled(FaBuilding)`
   font-size: 2em;
   color: var(--sidebar-active-border);
`;

const LogoText = styled.h1`
  font-size: 1.25em;
  color: var(--sidebar-text);
  margin: 0;
  font-weight: 600;
  letter-spacing: 0.5px;
`;

const SidebarNav = styled.nav`
  flex-grow: 1;
  overflow-y: auto;
  padding-top: 1rem;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: #4a6a8a;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: var(--sidebar-active-border);
  }
`;

const NavList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const NavItem = styled.li`
  margin: 0 0.75rem;
`;

const StyledNavLink = styled(NavLink)`
  display: flex;
  align-items: center;
  padding: 14px 20px;
  text-decoration: none;
  color: var(--sidebar-text-secondary);
  font-size: 0.9em;
  font-weight: 500;
  transition: all 0.2s ease-in-out;
  gap: 15px;
  border-radius: 6px;
  margin-bottom: 0.25rem;

  &:hover {
    background-color: var(--sidebar-hover-bg);
    color: var(--sidebar-text);
  }

  &.active {
    background-color: var(--sidebar-active-bg);
    color: var(--sidebar-text);
    font-weight: 600;
    
    svg {
      color: var(--sidebar-active-border);
    }
  }
  
  svg {
    font-size: 1.2em;
    min-width: 24px;
    flex-shrink: 0;
    transition: color 0.2s ease-in-out;
  }
`;

const NavGroupHeader = styled.h5`
  color: var(--sidebar-text-secondary);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 1.5rem 2.25rem 0.5rem;
`;

const FooterContainer = styled.div`
  margin-top: auto;
  padding: 0.75rem;
  border-top: 1px solid var(--sidebar-separator);
  flex-shrink: 0;
`;

const SidebarButton = styled.button`
  display: flex;
  align-items: center;
  gap: 15px;
  background-color: transparent;
  border: none;
  color: var(--sidebar-text-secondary);
  padding: 12px 20px;
  width: 100%;
  text-align: left;
  cursor: pointer;
  font-size: 0.9em;
  font-weight: 500;
  border-radius: 6px;
  transition: background-color 0.2s ease, color 0.2s ease;

  &:hover {
    background-color: var(--sidebar-hover-bg);
    color: var(--sidebar-text);
  }
  
  svg {
    font-size: 1.2em;
    min-width: 24px;
  }
`;

const LogoutButton = styled(SidebarButton)`
  &:hover {
    background-color: #c0392b;
    color: #ffffff;
  }
`;

// --- The Component ---
const Sidebar = ({ userRole, onLogout }) => {
  const isAdmin = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';

  return (
    <SidebarContainer>
      <LogoContainer>
        <LogoIcon />
        <div>
          <LogoText>HRMS Portal</LogoText>
          <span style={{ fontSize: '0.6em', opacity: 0.7, display: 'block' }}>By Junade</span>
        </div>
      </LogoContainer>

      <SidebarNav>
        <NavList>
          {/* --- USER SECTION --- */}
          <NavGroupHeader>Workspace</NavGroupHeader>
          <NavItem><StyledNavLink to="/dashboard" end><FaTachometerAlt /> Dashboard</StyledNavLink></NavItem>
          <NavItem><StyledNavLink to="/my-team"><FaUsers /> My Team</StyledNavLink></NavItem>
          <NavItem><StyledNavLink to="/attendance"><FaUserClock /> Attendance</StyledNavLink></NavItem>
          <NavItem><StyledNavLink to="/leave"><FaCalendarAlt /> Leave</StyledNavLink></NavItem>
          <NavItem><StyledNavLink to="/timesheets"><FaRegClock /> Timesheets</StyledNavLink></NavItem>
          <NavItem><StyledNavLink to="/payslips"><FaFileInvoiceDollar /> Payslips</StyledNavLink></NavItem>
           <NavItem><StyledNavLink to="/help-desk"><FaLifeRing /> Help Desk</StyledNavLink></NavItem>
           <NavItem><StyledNavLink to="/my-tasks"><FaTasks /> My Tasks</StyledNavLink></NavItem>
          
          {/* --- ADMIN SECTION (Conditionally Rendered) --- */}
          {isAdmin && (
            <>
              <NavGroupHeader>Administration</NavGroupHeader>
              <NavItem><StyledNavLink to="/admin/user-management"><FaUsersCog /> User Management</StyledNavLink></NavItem>
              <NavItem><StyledNavLink to="/admin/pending-approvals"><FaUserCheck /> Pending Users</StyledNavLink></NavItem>
              <NavItem><StyledNavLink to="/admin/attendance-records"><FaUserClock /> Employee Attendance</StyledNavLink></NavItem>
              <NavItem><StyledNavLink to="/admin/attendance-corrections"><FaUserClock /> Correction Requests</StyledNavLink></NavItem>
              <NavItem><StyledNavLink to="/admin/leave-approvals"><FaCalendarCheck /> Leave Approvals</StyledNavLink></NavItem>
              <NavItem><StyledNavLink to="/admin/timesheet-approvals"><FaCheckSquare /> Timesheet Approvals</StyledNavLink></NavItem>
               <NavItem><StyledNavLink to="/admin/manage-tickets"><FaLifeRing /> Manage Tickets</StyledNavLink></NavItem>
              <NavItem><StyledNavLink to="/admin/payroll-config"><FaDollarSign /> Payroll Config</StyledNavLink></NavItem>
              <NavItem><StyledNavLink to="/admin/salary-management"><FaMoneyBillWave /> Employee Salary</StyledNavLink></NavItem>
              <NavItem><StyledNavLink to="/admin/create-notice"><FaBullhorn /> Create Notice</StyledNavLink></NavItem>
              <NavItem><StyledNavLink to="/admin/create-meeting"><FaCalendarPlus /> Schedule Meeting</StyledNavLink></NavItem>
               <NavItem><StyledNavLink to="/admin/project-management"><FaTasks /> Project Management</StyledNavLink></NavItem>
               <NavItem><StyledNavLink to="/admin/asset-management"><FaDesktop /> Asset Management</StyledNavLink></NavItem>
               <NavItem><StyledNavLink to="/admin/document-verification"><FaFileAlt /> Document Verification</StyledNavLink></NavItem>
               
            </>
          )}
        </NavList>
      </SidebarNav>

      <FooterContainer>
        <StyledNavLink to="/profile" style={{marginBottom: '0.25rem'}}><FaUserCircle /> My Profile</StyledNavLink>
        <LogoutButton onClick={onLogout}>
           <FaSignOutAlt /> Logout
        </LogoutButton>
      </FooterContainer>
    </SidebarContainer>
  );
};

export default Sidebar;