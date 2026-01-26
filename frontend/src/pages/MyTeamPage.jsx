// src/pages/MyTeamPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { fetchMyTeam, fetchPublicUserProfile, API_BASE_URL } from '../services/apiService';
import EmployeeProfileCard from '../components/admin/EmployeeProfileCard';
import defaultAvatar from '../assets/images/default-avatar.png';
import { FaTimes } from 'react-icons/fa';

// --- Styled Components ---
const PageContainer = styled.div`
  padding: 30px;
  max-width: 1200px;
  margin: 20px auto;
  animation: fadeIn 0.5s ease-out;
`;

const PageTitle = styled.h2`
  color: var(--text-primary);
  margin-bottom: 25px;
  border-bottom: 2px solid var(--text-accent);
  padding-bottom: 10px;
`;

// NEW: A styled header for each team section
const SectionHeader = styled.h3`
  font-size: 1.2em;
  color: var(--text-accent);
  margin-top: 40px;
  margin-bottom: 15px;
  border-bottom: 1px solid var(--border-secondary);
  padding-bottom: 8px;
`;

const TeamGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
`;

const MemberCard = styled.div`
  background-color: var(--background-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 5px var(--shadow-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  cursor: pointer;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 12px var(--shadow-color);
  }
`;

const MemberAvatar = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--text-accent);
  margin-bottom: 15px;
`;

const MemberName = styled.h4` margin: 0 0 5px 0; font-size: 1.2em; color: var(--text-primary); `;
const MemberJobTitle = styled.p` margin: 0 0 10px 0; font-size: 0.9em; color: var(--text-secondary); font-style: italic; `;
const MemberContact = styled.p` margin: 0; font-size: 0.85em; color: var(--text-link); word-break: break-all; `;
const LoadingMsg = styled.p` color: var(--text-muted); font-style: italic; text-align: center; padding: 40px; font-size: 1.1em; `;
const InfoMsg = styled.div` text-align: center; margin-top: 40px; padding: 30px; background-color: var(--background-tertiary); border: 1px dashed var(--border-primary); border-radius: 8px; color: var(--text-secondary); `;
const ModalOverlay = styled.div` position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0, 0, 0, 0.7); display: flex; align-items: center; justify-content: center; z-index: 1050; animation: fadeIn 0.3s; `;
const ModalContent = styled.div` background-color: var(--background-secondary); padding: 25px; border-radius: 8px; width: 90%; max-width: 800px; max-height: 90vh; overflow-y: auto; position: relative; animation: fadeInUp 0.4s ease-out; `;
const CloseButton = styled.button` position: absolute; top: 10px; right: 10px; background: transparent; border: none; font-size: 1.5rem; color: var(--text-muted); cursor: pointer; `;

// --- The Component ---
const MyTeamPage = () => {
    // MODIFICATION: State now holds the structured DTO
    const [teamData, setTeamData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [modalError, setModalError] = useState('');

    const getFullImageUrl = useCallback((path) => {
        if (!path || typeof path !== 'string' || !path.startsWith('/')) return defaultAvatar;
        const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
        return `${baseUrl}${path}`;
    }, []);

    const loadTeam = useCallback(async () => {
        try {
            setLoading(true);
            const data = await fetchMyTeam();
            setTeamData(data);
        } catch (err) {
            setError(err.message || 'Failed to load team data.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadTeam();
    }, [loadTeam]);

    const handleOpenProfileModal = async (userId) => {
        setModalLoading(true);
        setModalError('');
        setIsProfileModalOpen(true);
        try {
            const userData = await fetchPublicUserProfile(userId);
            setSelectedUser(userData);
        } catch (err) {
            setModalError(`Failed to fetch user details: ${err.message}`);
        } finally {
            setModalLoading(false);
        }
    };

    const handleCloseProfileModal = () => {
        setIsProfileModalOpen(false);
        setSelectedUser(null);
        setModalError('');
    };
    
    // Helper component to render a user card
    const UserCard = ({ user }) => (
        <MemberCard key={user.id} onClick={() => handleOpenProfileModal(user.id)}>
            <MemberAvatar 
                src={getFullImageUrl(user.profilePicturePath)} 
                alt={`${user.firstName}'s profile`}
            />
            <MemberName>{user.firstName} {user.lastName}</MemberName>
            <MemberJobTitle>{user.jobTitle || 'Job Title Not Set'}</MemberJobTitle>
            <MemberContact>{user.workEmail || user.username}</MemberContact>
        </MemberCard>
    );

    if (loading) {
        return <PageContainer><LoadingMsg>Loading your team structure...</LoadingMsg></PageContainer>;
    }

    const hasManager = teamData?.manager;
    const hasPeers = teamData?.peers && teamData.peers.length > 0;
    const hasReports = teamData?.directReports && teamData.directReports.length > 0;

    return (
        <>
            <PageContainer>
                <PageTitle>My Team Structure</PageTitle>
                {error && <p className="message-display error">{error}</p>}
                
                {!hasManager && !hasPeers && !hasReports && !error && (
                    <InfoMsg>
                        <h3>Your Team View</h3>
                        <p>This page shows your manager, peers, and direct reports. It seems you are not currently assigned a reporting manager.</p>
                    </InfoMsg>
                )}

                {/* --- Manager Section --- */}
                {hasManager && (
                    <section>
                        <SectionHeader>Your Manager</SectionHeader>
                        <UserCard user={teamData.manager} />
                    </section>
                )}
                
                {/* --- Peers Section --- */}
                {hasPeers && (
                    <section>
                        <SectionHeader>Your Peers</SectionHeader>
                        <TeamGrid>
                            {teamData.peers.map(member => <UserCard key={member.id} user={member} />)}
                        </TeamGrid>
                    </section>
                )}

                {/* --- Direct Reports Section --- */}
                {hasReports && (
                    <section>
                        <SectionHeader>Your Direct Reports</SectionHeader>
                        <TeamGrid>
                            {teamData.directReports.map(member => <UserCard key={member.id} user={member} />)}
                        </TeamGrid>
                    </section>
                )}

            </PageContainer>
            
            {isProfileModalOpen && (
                <ModalOverlay onClick={handleCloseProfileModal}>
                    <ModalContent onClick={e => e.stopPropagation()}>
                        <CloseButton onClick={handleCloseProfileModal}><FaTimes /></CloseButton>
                        {modalLoading && <LoadingMsg>Loading Profile...</LoadingMsg>}
                        {modalError && <p className="message-display error">{modalError}</p>}
                        {selectedUser && <EmployeeProfileCard user={selectedUser} />}
                    </ModalContent>
                </ModalOverlay>
            )}
        </>
    );
};

export default MyTeamPage;