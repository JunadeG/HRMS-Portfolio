// src/pages/ProfilePage.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled from 'styled-components';
import { 
    fetchUserProfile, 
    updateUserProfile, 
    uploadProfilePicture, 
    API_BASE_URL, 
    fetchMyAssets, 
    fetchMyDocuments, 
    uploadDocument 
} from '../services/apiService';
import defaultAvatar from '../assets/images/default-avatar.png';

// --- Styled Components ---
const ProfileContainer = styled.div`
  padding: 30px;
  max-width: 800px;
  margin: 20px auto;
  background-color: var(--background-secondary);
  color: var(--text-primary);
  border-radius: 8px;
  box-shadow: 0 2px 10px var(--shadow-color);
  border: 1px solid var(--border-primary);
`;
const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 30px;
  gap: 20px;
  flex-wrap: wrap;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-secondary);
`;
const AvatarContainer = styled.div` position: relative; display: inline-block; `;
const Avatar = styled.img`
  width: 100px; height: 100px; border-radius: 50%; object-fit: cover;
  border: 3px solid var(--border-secondary); display: block;
`;
const FileInputLabel = styled.label`
    position: absolute; bottom: 0; right: 0;
    background-color: color-mix(in srgb, var(--text-accent) 80%, black);
    color: var(--text-on-accent); padding: 4px 8px; border-radius: 10px; font-size: 0.7em;
    cursor: pointer; opacity: 0.85; transition: opacity 0.2s ease;
    &:hover { opacity: 1; }
`;
const HiddenFileInput = styled.input` display: none; `;
const UserInfo = styled.div`
    flex-grow: 1; min-width: 200px;
    h2 { margin: 0 0 5px 0; color: var(--text-primary); }
    p { margin: 0; color: var(--text-secondary); font-size: 0.95em; }
`;
const HeaderActions = styled.div` margin-left: auto; flex-shrink: 0; `;
const ProfileSection = styled.div`
  margin-bottom: 25px;
  border-top: 1px solid var(--border-secondary);
  padding-top: 20px;
  &:first-of-type {
    border-top: none;
    padding-top: 0;
  }
  h3 {
    margin-top: 0; margin-bottom: 15px;
    color: var(--text-accent);
    font-size: 1.1em;
    border-bottom: 2px solid var(--text-accent);
    padding-bottom: 5px; display: inline-block;
  }
`;
const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px 20px;
`;
const InfoItem = styled.div`
  font-size: 0.9em;
  label { font-weight: 600; color: var(--text-secondary); display: block; margin-bottom: 4px; }
  span, input, select {
    color: var(--text-primary); display: block; width: 100%; padding: 8px;
    border: 1px solid var(--border-primary);
    background-color: var(--background-secondary);
    border-radius: 4px; box-sizing: border-box; min-height: 38px;
  }
  input:read-only, select:disabled, span {
    background-color: var(--background-tertiary);
    border-color: var(--border-secondary);
    color: var(--text-muted);
    cursor: default; line-height: 1.5;
  }
   input:focus, select:focus {
       border-color: var(--border-accent);
       background-color: var(--background-secondary);
       box-shadow: 0 0 0 2px color-mix(in srgb, var(--text-accent) 25%, transparent);
       outline: none;
   }
  select {
    appearance: none;
    background-image: url('data:image/svg+xml;utf8,<svg fill="${props => encodeURIComponent(getComputedStyle(props.theme?.['body'] || document.body).getPropertyValue('--text-muted') || '#6c757d')}" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M1395 736q0 13-10 23l-466 466q-10 10-23 10t-23-10l-466-466q-10-10-10-23t10-23l50-50q10-10 23-10t23 10l393 393 393-393q10-10 23-10t23 10l50 50q10 10 10 23z"/></svg>');
    background-repeat: no-repeat; background-position: right 10px top 50%; background-size: 14px; padding-right: 30px;
   }
`;
const EditButton = styled.button` background-color: #ff9800; color: white; padding: 8px 15px; border: none; border-radius: 5px; cursor: pointer; font-size: 0.9em; margin-right: 10px; &:hover { background-color: #e68900; } &:disabled { background-color: #cccccc; cursor: not-allowed; } `;
const SaveButton = styled.button` background-color: #4CAF50; color: white; padding: 8px 15px; border: none; border-radius: 5px; cursor: pointer; font-size: 0.9em; margin-right: 10px; &:hover { background-color: #45a049; } &:disabled { background-color: #cccccc; cursor: not-allowed; } `;
const CancelButton = styled.button` background-color: #6c757d; color: white; padding: 8px 15px; border: none; border-radius: 5px; cursor: pointer; font-size: 0.9em; &:hover { background-color: #5a6268; } &:disabled { background-color: #cccccc; cursor: not-allowed; } `;
const LoadingDisplay = styled.div` padding: 40px; text-align: center; font-style: italic; color: var(--text-secondary); `;
const ErrorDisplay = styled.p` color: var(--text-error); background-color: color-mix(in srgb, var(--text-error) 10%, var(--background-secondary)); border: 1px solid var(--border-error); border-radius: 4px; font-size: 0.9em; margin-top: 15px; white-space: pre-wrap; padding: 10px; `;
const SuccessDisplay = styled.p` color: var(--text-success); background-color: color-mix(in srgb, var(--text-success) 10%, var(--background-secondary)); border: 1px solid var(--border-success); border-radius: 4px; font-size: 0.9em; margin-top: 15px; padding: 10px; `;
const AssetList = styled.ul` list-style: none; padding: 0; margin-top: 10px; li { background-color: var(--background-tertiary); padding: 10px 15px; border-radius: 4px; margin-bottom: 8px; display: flex; justify-content: space-between; } `;
const DocumentSection = styled(ProfileSection)``;
const DocumentTable = styled.table` width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 0.9em; th, td { border-bottom: 1px solid var(--border-secondary); padding: 10px; text-align: left; } th { background-color: var(--background-tertiary); } `;
const StatusBadge = styled.span` padding: 3px 8px; border-radius: 12px; font-size: 0.8em; font-weight: 600; color: white; &.status-PENDING_VERIFICATION { background-color: #ffc107; color: #333; } &.status-VERIFIED { background-color: #28a745; } &.status-REJECTED { background-color: #dc3545; } `;
const UploadForm = styled.form` display: flex; gap: 15px; align-items: flex-end; margin-top: 20px; padding: 15px; background-color: var(--background-tertiary); border-radius: 6px; `;
const FormGroup = styled.div` display: flex; flex-direction: column; gap: 5px; label { font-weight: 600; font-size: 0.9em; color: var(--text-secondary); } input, select { width: 100%; box-sizing: border-box; padding: 8px; border: 1px solid var(--border-primary); border-radius: 4px; font-size: 1em; background-color: var(--background-secondary); color: var(--text-primary); } `;
const SubmitButton = styled.button` padding: 8px 15px; background-color: var(--text-accent); color: var(--text-on-accent); border: none; border-radius: 5px; cursor: pointer; font-weight: 500; &:disabled { opacity: 0.6; } `;

const GENDER_OPTIONS = ['MALE', 'FEMALE', 'NON_BINARY', 'PREFER_NOT_TO_SAY'];
const MARITAL_STATUS_OPTIONS = ['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED'];
const BLOOD_GROUP_OPTIONS = ['A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE', 'UNKNOWN'];

const ProfilePage = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [profilePictureFile, setProfilePictureFile] = useState(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
    const [myAssets, setMyAssets] = useState([]);
    const [myDocuments, setMyDocuments] = useState([]);
    const [documentType, setDocumentType] = useState('PASSPORT');
    const [documentFile, setDocumentFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    const getFullImageUrl = useCallback((path) => {
        if (!path || typeof path !== 'string' || !path.startsWith('/')) return defaultAvatar;
        const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
        return `${baseUrl}${path}`;
    }, []);

    const loadData = useCallback(async () => {
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const [profileData, assetsData, documentsData] = await Promise.all([
                fetchUserProfile(),
                fetchMyAssets(),
                fetchMyDocuments()
            ]);
            setUserData(profileData);
            setEditData(profileData || {});
            setImagePreviewUrl(getFullImageUrl(profileData?.profilePicturePath));
            setMyAssets(assetsData || []);
            setMyDocuments(documentsData || []);
        } catch (err) {
            setError(`Profile Load Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }, [getFullImageUrl]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleDocumentUpload = async (e) => {
        e.preventDefault();
        if (!documentFile) {
            setError("Please select a file to upload.");
            return;
        }
        setIsUploading(true);
        setError('');
        setSuccess('');

        const formData = new FormData();
        formData.append('documentType', documentType);
        formData.append('file', documentFile);

        try {
            const newDocument = await uploadDocument(formData);
            setSuccess("Document uploaded successfully. It is now pending verification.");
            setMyDocuments(prevDocs => [newDocument, ...prevDocs].sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate)));
            setDocumentFile(null);
            if(fileInputRef.current) fileInputRef.current.value = "";
        } catch (err) {
            setError(err.message || "Failed to upload document.");
        } finally {
            setIsUploading(false);
        }
    };
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            setError('File is too large (Max 5MB).');
            return;
        }
        setProfilePictureFile(file);
        setImagePreviewUrl(URL.createObjectURL(file));
    };

    const handleEditToggle = () => {
        if (isEditing) {
            setEditData(userData);
            setImagePreviewUrl(getFullImageUrl(userData?.profilePicturePath));
            setProfilePictureFile(null);
            setError('');
        }
        setIsEditing(!isEditing);
    };

    const handleSave = async () => {
        setError(''); setSuccess(''); setIsSaving(true);
        let profileUpdateSuccess = false;
        
        try {
            const payload = { ...editData };
            if (payload.gender === "") payload.gender = null;
            if (payload.maritalStatus === "") payload.maritalStatus = null;
            if (payload.bloodGroup === "") payload.bloodGroup = null;

            const updatedUserDTO = await updateUserProfile(payload);
            setUserData(updatedUserDTO);
            setEditData(updatedUserDTO);
            setSuccess('Profile details updated.');
            profileUpdateSuccess = true;
        } catch (err) { setError(`Failed to update details: ${err.message}`); }

        if (profilePictureFile) {
            try {
                const formData = new FormData();
                formData.append('profilePicture', profilePictureFile);
                const pictureResult = await uploadProfilePicture(formData);
                setUserData(prev => ({ ...prev, profilePicturePath: pictureResult.profilePicturePath }));
                setSuccess(prev => (prev ? `${prev} ` : '') + 'Profile picture updated.');
                setProfilePictureFile(null);
            } catch (err) { setError(prev => (prev ? `${prev}; ` : '') + `Picture upload failed: ${err.message}`); }
        }
        
        setIsSaving(false);
        if (profileUpdateSuccess) {
            setIsEditing(false);
        }
    };

    const renderField = (label, fieldName, type = 'text', options = null) => {
        const value = isEditing ? (editData[fieldName] ?? '') : (userData?.[fieldName]);
        return (
            <InfoItem>
                <label htmlFor={`profile-${fieldName}`}>{label}:</label>
                {isEditing ? (
                    options ? (
                        <select id={`profile-${fieldName}`} name={fieldName} value={value} onChange={handleInputChange} disabled={isSaving}>
                            <option value="">-- Select --</option>
                            {options.map(opt => (<option key={opt} value={opt}>{opt.replace(/_/g, ' ')}</option>))}
                        </select>
                    ) : (
                        <input type={type} id={`profile-${fieldName}`} name={fieldName} value={value} onChange={handleInputChange} disabled={isSaving} />
                    )
                ) : (
                    <span>{value ? (options ? value.replace(/_/g, ' ') : value) : 'N/A'}</span>
                )}
            </InfoItem>
        );
    };

    if (loading) return <ProfileContainer><LoadingDisplay>Loading profile...</LoadingDisplay></ProfileContainer>;
    if (error && !userData) return <ProfileContainer><ErrorDisplay>{error}</ErrorDisplay></ProfileContainer>;
    if (!userData) return <ProfileContainer><LoadingDisplay>Profile data not available.</LoadingDisplay></ProfileContainer>;

    return (
        <ProfileContainer>
            <ProfileHeader>
                <AvatarContainer>
                    <Avatar src={imagePreviewUrl} alt="Profile Avatar" onError={(e) => { e.target.src = defaultAvatar; }} />
                    {isEditing && (
                        <> 
                          <FileInputLabel htmlFor="profilePictureInput">Change</FileInputLabel> 
                          <HiddenFileInput type="file" id="profilePictureInput" name="profilePicture" accept="image/png, image/jpeg, image/gif" onChange={handleFileChange} disabled={isSaving} /> 
                        </>
                    )}
                </AvatarContainer>
                <UserInfo>
                    <h2>{userData.firstName} {userData.lastName}</h2>
                    <p>{userData.jobTitle || 'Job Title Not Set'}</p>
                    <p>{userData.departmentName || 'No Department'}</p>
                </UserInfo>
                <HeaderActions>
                    {!isEditing 
                        ? (<EditButton onClick={handleEditToggle} disabled={isSaving}>Edit Profile</EditButton>)
                        : (<> 
                            <SaveButton onClick={handleSave} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</SaveButton> 
                            <CancelButton onClick={handleEditToggle} disabled={isSaving}>Cancel</CancelButton> 
                           </>)
                    }
                </HeaderActions>
            </ProfileHeader>

            {(error && <ErrorDisplay>{error}</ErrorDisplay>) || (success && <SuccessDisplay>{success}</SuccessDisplay>)}

            <ProfileSection>
                <h3>Work Details</h3>
                <InfoGrid>
                    {renderField('Employee ID', 'employeeId')}
                    {renderField('Work Email', 'workEmail', 'email')}
                    {renderField('Department', 'departmentName')}
                    {renderField('Reporting Manager', 'reportingManagerName')}
                    {renderField('Project Manager', 'projectManagerName')}
                </InfoGrid>
            </ProfileSection>

            <ProfileSection>
                <h3>Contact Information</h3>
                <InfoGrid>
                    {renderField('Mobile Number', 'mobileNumber', 'tel')}
                    {renderField('Alternate Contact', 'alternateContactNumber', 'tel')}
                    {renderField('Personal Email', 'email', 'email')}
                    {renderField('Address', 'address')}
                </InfoGrid>
            </ProfileSection>
            
            <ProfileSection>
                <h3>Personal Details</h3>
                <InfoGrid>
                    {renderField('Date of Birth', 'dateOfBirth', 'date')}
                    {renderField('Gender', 'gender', 'select', GENDER_OPTIONS)}
                    {renderField('Marital Status', 'maritalStatus', 'select', MARITAL_STATUS_OPTIONS)}
                    {renderField('Nationality', 'nationality')}
                    {renderField('Blood Group', 'bloodGroup', 'select', BLOOD_GROUP_OPTIONS)}
                </InfoGrid>
            </ProfileSection>

            <DocumentSection>
                <h3>KYC / Document Management</h3>
                <UploadForm onSubmit={handleDocumentUpload}>
                    <FormGroup style={{flex: 2}}>
                        <label>Document Type</label>
                        <select value={documentType} onChange={e => setDocumentType(e.target.value)}>
                            <option value="PASSPORT">Passport</option>
                            <option value="DRIVERS_LICENSE">Driver's License</option>
                            <option value="CERTIFICATION">Certification / Degree</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </FormGroup>
                    <FormGroup style={{flex: 3}}>
                        <label>Upload File (PDF, JPG, PNG)</label>
                        <input type="file" ref={fileInputRef} onChange={e => setDocumentFile(e.target.files[0])} accept=".pdf,.jpg,.jpeg,.png" required />
                    </FormGroup>
                    <SubmitButton type="submit" disabled={isUploading}>
                        {isUploading ? 'Uploading...' : 'Upload'}
                    </SubmitButton>
                </UploadForm>

                <DocumentTable>
                    <thead>
                        <tr>
                            <th>Document Type</th>
                            <th>Uploaded On</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {myDocuments.length === 0 ? (
                            <tr><td colSpan="4" style={{textAlign: 'center'}}>You have not uploaded any documents.</td></tr>
                        ) : myDocuments.map(doc => (
                            <tr key={doc.id}>
                                <td>{doc.documentType.replace('_', ' ')}</td>
                                <td>{new Date(doc.uploadDate).toLocaleDateString()}</td>
                                <td><StatusBadge className={`status-${doc.status}`}>{doc.status.replace('_', ' ')}</StatusBadge></td>
                                <td>
                                    <a href={`${API_BASE_URL}${doc.filePath}`} target="_blank" rel="noopener noreferrer">View</a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </DocumentTable>
            </DocumentSection>
            
            <ProfileSection>
                <h3>My Assigned Assets</h3>
                {myAssets.length > 0 ? (
                    <AssetList>
                        {myAssets.map(alloc => (
                            <li key={alloc.id}>
                                <span><strong>{alloc.asset.assetName}</strong> ({alloc.asset.assetType})</span>
                                <span>S/N: {alloc.asset.serialNumber}</span>
                            </li>
                        ))}
                    </AssetList>
                ) : (
                    <p>No assets are currently allocated to you.</p>
                )}
            </ProfileSection>

            <ProfileSection>
                <h3>Bank & Payroll Details</h3>
                <InfoGrid>
                    {renderField('Bank Name', 'bankName')}
                    {renderField('Bank Account Number', 'bankAccountNumber')}
                    {renderField('Bank IFSC / Branch Code', 'bankIfscCode')}
                </InfoGrid>
            </ProfileSection>

            <ProfileSection>
                <h3>Emergency Contact</h3>
                <InfoGrid>
                    {renderField('Contact Name', 'emergencyContactName')}
                    {renderField('Contact Phone', 'emergencyContactPhone', 'tel')}
                </InfoGrid>
            </ProfileSection>
        </ProfileContainer>
    );
};

export default ProfilePage;