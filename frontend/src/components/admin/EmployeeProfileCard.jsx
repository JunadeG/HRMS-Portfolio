import React from 'react';
import styled from 'styled-components';
import defaultAvatar from '../../assets/images/default-avatar.png';
import { API_BASE_URL } from '../../services/apiService';

// --- Styled Components (No Changes) ---
const CardContainer = styled.div`
  background-color: var(--background-secondary);
  color: var(--text-primary);
  padding: 25px;
  border-radius: 8px;
`;
const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-secondary);
`;
const Avatar = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--border-primary);
`;
const UserInfo = styled.div`
  h3 { margin: 0 0 5px 0; font-size: 1.4em; color: var(--text-primary); }
  p { margin: 0; color: var(--text-secondary); font-size: 0.9em; }
`;
const ProfileSection = styled.div`
  margin-top: 20px;
  h4 {
    margin-bottom: 10px;
    color: var(--text-accent);
    border-bottom: 1px solid var(--border-secondary);
    padding-bottom: 5px;
  }
`;
const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px 18px;
`;
const InfoItem = styled.div`
  font-size: 0.9em;
  label {
    font-weight: 600;
    color: var(--text-muted);
    display: block;
    font-size: 0.9em;
    margin-bottom: 3px;
  }
  span {
    color: var(--text-primary);
  }
`;

// --- The Component ---
const EmployeeProfileCard = ({ user }) => {
  if (!user) {
    return <CardContainer>No user data provided.</CardContainer>;
  }

  const getFullImageUrl = (path) => {
    // Note: The DTO from the backend sends 'profilePicturePath'
    if (!path || typeof path !== 'string' || !path.startsWith('/')) return defaultAvatar;
    const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
    return `${baseUrl}${path}`;
  };

  const renderInfo = (label, value) => (
    <InfoItem>
      <label>{label}</label>
      <span>{value || 'N/A'}</span>
    </InfoItem>
  );

  return (
    <CardContainer>
      <ProfileHeader>
        <Avatar src={getFullImageUrl(user.profilePicturePath)} alt={`${user.firstName}'s avatar`} />
        <UserInfo>
          <h3>{`${user.firstName || ''} ${user.lastName || ''}`}</h3>
          <p>{user.jobTitle || 'Job Title Not Set'}</p>
          {/* The DTO provides departmentName directly */}
          <p>{user.departmentName || 'No Department'}</p>
        </UserInfo>
      </ProfileHeader>

      <ProfileSection>
        <h4>Work Details</h4>
        <InfoGrid>
          {renderInfo('Employee ID', user.employeeId)}
          {renderInfo('Work Email', user.workEmail)}
          {/* <<< --- THIS IS THE CORRECTED PART --- >>> */}
          {/* Read the simple string 'reportingManagerName' from the DTO */}
          {renderInfo('Reporting Manager', user.reportingManagerName)}
          {/* Read the simple string 'projectManagerName' from the DTO */}
          {renderInfo('Project Manager', user.projectManagerName)}
        </InfoGrid>
      </ProfileSection>

      <ProfileSection>
        <h4>Contact Information</h4>
        <InfoGrid>
          {renderInfo('Mobile Number', user.mobileNumber)}
          {renderInfo('Alternate Contact', user.alternateContactNumber)}
          {renderInfo('Personal Email', user.email)}
          {renderInfo('Address', user.address)}
        </InfoGrid>
      </ProfileSection>

      <ProfileSection>
        <h4>Personal Details</h4>
        <InfoGrid>
            {renderInfo('Date of Birth', user.dateOfBirth)}
            {renderInfo('Gender', user.gender?.replace('_', ' '))}
            {renderInfo('Marital Status', user.maritalStatus?.replace('_', ' '))}
            {renderInfo('Nationality', user.nationality)}
            {renderInfo('Blood Group', user.bloodGroup?.replace('_', ' '))}
        </InfoGrid>
      </ProfileSection>
    </CardContainer>
  );
};

export default EmployeeProfileCard;