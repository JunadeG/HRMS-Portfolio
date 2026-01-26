import React, { useState, useEffect, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { searchEmployees, API_BASE_URL } from '../services/apiService';
import defaultAvatar from '../assets/images/default-avatar.png';
import { FaSearch, FaUsers, FaTachometerAlt, FaUserCircle, FaLifeRing, FaFileInvoiceDollar, FaRegClock, FaCalendarAlt, FaUserClock, FaUsersCog, FaUserCheck, FaCalendarCheck, FaMoneyBillWave, FaDollarSign, FaBullhorn, FaCalendarPlus, FaCheckSquare } from 'react-icons/fa';

// --- Styled Components ---
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  padding-top: 15vh;
  z-index: 2000;
  backdrop-filter: blur(5px);
`;
const PaletteContainer = styled.div`
  width: 100%;
  max-width: 600px;
  background: var(--background-secondary);
  border-radius: 8px;
  box-shadow: 0 5px 25px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;
const SearchInputWrapper = styled.div`
  display: flex;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid var(--border-primary);
  gap: 12px;
  
  svg {
    color: var(--text-muted);
    font-size: 1.2em;
  }
`;
const SearchInput = styled.input`
  width: 100%;
  border: none;
  background: transparent;
  font-size: 1.2em;
  color: var(--text-primary);
  &:focus {
    outline: none;
  }
`;
const ResultsContainer = styled.div`
  padding: 8px;
  overflow-y: auto;
  max-height: 400px;
`;
const ResultGroupLabel = styled.h5`
  color: var(--text-muted);
  font-size: 0.8em;
  padding: 10px 15px;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 1px;
`;
const ResultItem = styled.li`
  padding: 10px 15px;
  display: flex;
  align-items: center;
  gap: 15px;
  cursor: pointer;
  border-radius: 6px;
  background-color: ${props => props.$isSelected ? 'var(--background-hover)' : 'transparent'};
  
  svg { color: var(--text-secondary); }
  span { font-weight: 500; color: var(--text-primary); }
`;
const EmployeeResultItem = styled(ResultItem)`
  .job-title {
    font-size: 0.9em;
    color: var(--text-muted);
    margin-left: auto;
    font-weight: 400;
  }
`;
const AuthorAvatar = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
`;
const NoResults = styled.div`
  text-align: center;
  padding: 40px;
  color: var(--text-muted);
`;

const SearchPalette = ({ userRole, onClose, onSelectEmployee }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [employeeResults, setEmployeeResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const navigate = useNavigate();
    const isAdmin = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';

    const allCommands = useMemo(() => {
        const commands = [
            { type: 'page', name: 'Dashboard', path: '/dashboard', icon: <FaTachometerAlt /> },
            { type: 'page', name: 'My Team', path: '/my-team', icon: <FaUsers /> },
            { type: 'page', name: 'My Profile', path: '/profile', icon: <FaUserCircle /> },
            { type: 'page', name: 'Attendance', path: '/attendance', icon: <FaUserClock /> },
            { type: 'page', name: 'Leave', path: '/leave', icon: <FaCalendarAlt /> },
            { type: 'page', name: 'Timesheets', path: '/timesheets', icon: <FaRegClock /> },
            { type: 'page', name: 'Payslips', path: '/payslips', icon: <FaFileInvoiceDollar /> },
            { type: 'page', name: 'Help Desk', path: '/help-desk', icon: <FaLifeRing /> },
        ];
        if (isAdmin) {
            commands.push(
                { type: 'page', name: 'User Management', path: '/admin/user-management', icon: <FaUsersCog /> },
                { type: 'page', name: 'Pending Approvals', path: '/admin/pending-approvals', icon: <FaUserCheck /> },
                { type: 'page', name: 'Leave Approvals', path: '/admin/leave-approvals', icon: <FaCalendarCheck /> },
                { type: 'page', name: 'Timesheet Approvals', path: '/admin/timesheet-approvals', icon: <FaCheckSquare /> },
                { type: 'page', name: 'Manage Tickets', path: '/admin/manage-tickets', icon: <FaLifeRing /> },
                { type: 'page', name: 'Employee Salary', path: '/admin/salary-management', icon: <FaMoneyBillWave /> },
                { type: 'page', name: 'Payroll Config', path: '/admin/payroll-config', icon: <FaDollarSign /> },
                { type: 'page', name: 'Create Notice', path: '/admin/create-notice', icon: <FaBullhorn /> },
                { type: 'page', name: 'Schedule Meeting', path: '/admin/create-meeting', icon: <FaCalendarPlus /> }
            );
        }
        return commands;
    }, [isAdmin]);

    const pageResults = useMemo(() => {
        if (!searchTerm) return allCommands; // Show all pages if search is empty
        return allCommands.filter(cmd =>
            cmd.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, allCommands]);

    useEffect(() => {
        if (searchTerm.length < 2) {
            setEmployeeResults([]);
            return;
        }
        setLoading(true);
        const timerId = setTimeout(() => {
            searchEmployees(searchTerm).then(data => {
                setEmployeeResults(data.map(e => ({ ...e, type: 'employee' })) || []);
            }).finally(() => setLoading(false));
        }, 300);
        return () => clearTimeout(timerId);
    }, [searchTerm]);

    const combinedResults = useMemo(() => [...pageResults, ...employeeResults], [pageResults, employeeResults]);

    const handleSelect = useCallback((result) => {
        if (!result) return;
        if (result.type === 'page') {
            navigate(result.path);
        } else if (result.type === 'employee') {
            onSelectEmployee(result.id);
        }
        onClose();
    }, [navigate, onClose, onSelectEmployee]);
    
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % (combinedResults.length || 1));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + combinedResults.length) % (combinedResults.length || 1));
            } else if (e.key === 'Enter') {
                e.preventDefault();
                handleSelect(combinedResults[selectedIndex]);
            } else if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [combinedResults, selectedIndex, handleSelect]);
    
    useEffect(() => {
        setSelectedIndex(0);
    }, [searchTerm]);

    const getFullImageUrl = (path) => {
        if (!path) return defaultAvatar;
        return `${API_BASE_URL}${path}`;
    };

    return (
        <ModalOverlay onClick={onClose}>
            <PaletteContainer onClick={(e) => e.stopPropagation()}>
                <SearchInputWrapper>
                    <FaSearch />
                    <SearchInput 
                        type="text"
                        placeholder="Search for pages or employees..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus
                    />
                </SearchInputWrapper>
                <ResultsContainer>
                    {combinedResults.length > 0 ? (
                        <>
                            {pageResults.length > 0 && searchTerm && <ResultGroupLabel>Pages</ResultGroupLabel>}
                            <ul>
                                {pageResults.map((result, index) => (
                                    <ResultItem key={result.path} $isSelected={index === selectedIndex} onClick={() => handleSelect(result)} onMouseMove={() => setSelectedIndex(index)}>
                                        {result.icon}
                                        <span>{result.name}</span>
                                    </ResultItem>
                                ))}
                            </ul>
                            
                            {employeeResults.length > 0 && <ResultGroupLabel>Employees</ResultGroupLabel>}
                            <ul>
                                {employeeResults.map((result, index) => (
                                    <EmployeeResultItem key={result.id} $isSelected={index + pageResults.length === selectedIndex} onClick={() => handleSelect(result)} onMouseMove={() => setSelectedIndex(index + pageResults.length)}>
                                        <AuthorAvatar src={getFullImageUrl(result.profilePicturePath)} />
                                        <span>{result.fullName}</span>
                                        <span className="job-title">{result.jobTitle}</span>
                                    </EmployeeResultItem>
                                ))}
                            </ul>
                        </>
                    ) : !loading ? (
                        <NoResults>No results found for "{searchTerm}"</NoResults>
                    ) : null}
                    {loading && <p style={{textAlign: 'center', padding: '20px'}}>Searching...</p>}
                </ResultsContainer>
            </PaletteContainer>
        </ModalOverlay>
    );
};

export default SearchPalette;