import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { createMeeting, fetchAdminUsers, fetchDepartments } from '../../services/apiService';
// <<< FIX IS ON THIS LINE >>>
import { FaUsers, FaBuilding, FaRegClock, FaAlignLeft, FaCalendarAlt, FaLink } from 'react-icons/fa';

// --- Styled Components for the Redesign ---
const PageContainer = styled.div`
  background-color: var(--background-secondary);
  padding: 25px 30px;
  border-radius: 8px;
  box-shadow: 0 4px 12px var(--shadow-color);
  max-width: 900px;
  margin: 30px auto;
  border: 1px solid var(--border-primary);
`;

const FormTitle = styled.h2`
  text-align: center;
  color: var(--text-primary);
  margin-bottom: 25px;
  font-weight: 600;
  border-bottom: 2px solid var(--text-accent);
  padding-bottom: 15px;
`;

const FormGrid = styled.form`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormSection = styled.div``;

const SectionTitle = styled.h3`
  font-size: 1.1em;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FormGroup = styled.div`
  margin-bottom: 18px;
`;

const Label = styled.label`
    display: block;
    margin-bottom: 6px;
    font-weight: 500;
    font-size: 0.9em;
`;

const Input = styled.input`
    width: 100%;
    box-sizing: border-box;
    padding: 10px 12px;
    border: 1px solid var(--border-primary);
    border-radius: 4px;
    font-size: 1em;
    background-color: var(--background-secondary);
    color: var(--text-primary);
    &:focus {
      outline: none;
      border-color: var(--border-accent);
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--border-accent) 25%, transparent);
    }
`;

const TextArea = styled.textarea`
    width: 100%;
    box-sizing: border-box;
    padding: 10px 12px;
    border: 1px solid var(--border-primary);
    border-radius: 4px;
    font-size: 1em;
    background-color: var(--background-secondary);
    color: var(--text-primary);
    resize: vertical;
    min-height: 80px;
    &:focus {
      outline: none;
      border-color: var(--border-accent);
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--border-accent) 25%, transparent);
    }
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid var(--border-primary);
  margin-bottom: 15px;
`;

const TabButton = styled.button`
  padding: 10px 15px;
  border: none;
  background-color: transparent;
  color: ${props => (props.active ? 'var(--text-accent)' : 'var(--text-muted)')};
  border-bottom: 3px solid ${props => (props.active ? 'var(--text-accent)' : 'transparent')};
  cursor: pointer;
  font-weight: ${props => (props.active ? '600' : '500')};
  margin-bottom: -1px;
`;

const CheckboxList = styled.div`
  max-height: 200px;
  overflow-y: auto;
  padding: 5px;
  border: 1px solid var(--border-secondary);
  border-radius: 4px;
`;

const CheckboxItem = styled.label`
  display: block;
  padding: 8px 10px;
  cursor: pointer;
  border-radius: 4px;
  &:hover {
    background-color: var(--background-hover);
  }
  input {
    margin-right: 10px;
  }
`;

const GuestList = styled.div`
  margin-top: 15px;
  padding: 15px;
  background-color: var(--background-tertiary);
  border-radius: 4px;
  min-height: 100px;
  p {
    margin: 0 0 10px 0;
    font-weight: 500;
    color: var(--text-secondary);
  }
  span {
    font-size: 0.85em;
    color: var(--text-muted);
    word-break: break-word;
  }
`;

const SubmitButton = styled.button`
  grid-column: 1 / -1;
  padding: 12px 25px;
  font-size: 1.1em;
  font-weight: 600;
  border: none;
  border-radius: 5px;
  background-color: var(--text-accent);
  color: var(--text-on-accent);
  cursor: pointer;
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;


const CreateMeetingForm = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [meetingLink, setMeetingLink] = useState('');
    const [allUsers, setAllUsers] = useState([]);
    const [allDepartments, setAllDepartments] = useState([]);
    const [inviteTab, setInviteTab] = useState('department');
    const [selectedDeptIds, setSelectedDeptIds] = useState(new Set());
    const [selectedUserIds, setSelectedUserIds] = useState(new Set());
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [users, depts] = await Promise.all([fetchAdminUsers(), fetchDepartments()]);
                setAllUsers(users.filter(u => u.status === 'APPROVED') || []);
                setAllDepartments(depts || []);
            } catch (err) {
                setError('Failed to load necessary data.');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const handleDeptSelect = (deptId) => {
        const newSet = new Set(selectedDeptIds);
        if (newSet.has(deptId)) newSet.delete(deptId); else newSet.add(deptId);
        setSelectedDeptIds(newSet);
    };

    const handleUserSelect = (userId) => {
        const newSet = new Set(selectedUserIds);
        if (newSet.has(userId)) newSet.delete(userId); else newSet.add(userId);
        setSelectedUserIds(newSet);
    };

    const guestList = useMemo(() => {
        const guests = new Map();
        allUsers.forEach(user => {
            if (selectedDeptIds.has(user.department?.id)) {
                guests.set(user.id, user.firstName + ' ' + user.lastName);
            }
            if (selectedUserIds.has(user.id)) {
                guests.set(user.id, user.firstName + ' ' + user.lastName);
            }
        });
        return Array.from(guests.values());
    }, [selectedDeptIds, selectedUserIds, allUsers]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setSuccess('');
        if (!title.trim() || !startTime) {
            setError('Title and Start Time are required.');
            return;
        }
        setIsSubmitting(true);
        const meetingData = {
            title: title.trim(),
            description: description.trim(),
            startTime: new Date(startTime).toISOString(),
            endTime: endTime ? new Date(endTime).toISOString() : null,
            meetingLink: meetingLink.trim(),
            attendeeUserIds: Array.from(selectedUserIds),
            attendeeDepartmentIds: Array.from(selectedDeptIds),
        };

        try {
            await createMeeting(meetingData);
            setSuccess('Meeting scheduled successfully! Invitations are being sent.');
            setTitle(''); setDescription(''); setStartTime(''); setEndTime(''); setMeetingLink('');
            setSelectedDeptIds(new Set()); setSelectedUserIds(new Set());
            setTimeout(() => setSuccess(''), 5000);
        } catch (err) {
            setError(err.message || 'Failed to schedule meeting.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <PageContainer>
            <FormTitle>Schedule a New Meeting</FormTitle>
            {error && <p className="message-display error">{error}</p>}
            {success && <p className="message-display success">{success}</p>}
            
            <FormGrid onSubmit={handleSubmit}>
                <FormSection>
                    <SectionTitle><FaCalendarAlt /> Meeting Details</SectionTitle>
                    <FormGroup>
                        <Label htmlFor="title">Title *</Label>
                        <Input id="title" type="text" value={title} onChange={e => setTitle(e.target.value)} required />
                    </FormGroup>
                    <FormGroup>
                        <Label htmlFor="description">Description (Optional)</Label>
                        <TextArea id="description" value={description} onChange={e => setDescription(e.target.value)} rows="3" />
                    </FormGroup>
                    <div style={{display: 'flex', gap: '15px'}}>
                        <FormGroup style={{flex: 1}}>
                            <Label htmlFor="startTime">Start Time *</Label>
                            <Input id="startTime" type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} required />
                        </FormGroup>
                        <FormGroup style={{flex: 1}}>
                            <Label htmlFor="endTime">End Time (Optional)</Label>
                            <Input id="endTime" type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)} min={startTime} />
                        </FormGroup>
                    </div>
                     <FormGroup>
                        <Label htmlFor="meetingLink"><FaLink /> Meeting Link (e.g., Google Meet, Teams)</Label>
                        <Input id="meetingLink" type="url" value={meetingLink} onChange={e => setMeetingLink(e.target.value)} placeholder="https://meet.google.com/xyz-abc-pqr" />
                    </FormGroup>
                </FormSection>

                <FormSection>
                    <SectionTitle><FaUsers /> Invitees</SectionTitle>
                    <TabContainer>
                        <TabButton type="button" active={inviteTab === 'department'} onClick={() => setInviteTab('department')}>By Department</TabButton>
                        <TabButton type="button" active={inviteTab === 'individual'} onClick={() => setInviteTab('individual')}>By Individual</TabButton>
                    </TabContainer>
                    
                    {loading ? <p>Loading options...</p> : (
                        inviteTab === 'department' ? (
                            <CheckboxList>
                                {allDepartments.map(dept => (
                                    <CheckboxItem key={dept.id}>
                                        <input type="checkbox" checked={selectedDeptIds.has(dept.id)} onChange={() => handleDeptSelect(dept.id)} />
                                        {dept.name}
                                    </CheckboxItem>
                                ))}
                            </CheckboxList>
                        ) : (
                            <CheckboxList>
                                {allUsers.map(user => (
                                    <CheckboxItem key={user.id}>
                                        <input type="checkbox" checked={selectedUserIds.has(user.id)} onChange={() => handleUserSelect(user.id)} />
                                        {user.firstName} {user.lastName} ({user.department?.name || 'N/A'})
                                    </CheckboxItem>
                                ))}
                            </CheckboxList>
                        )
                    )}

                    <GuestList>
                        <p>Guest List ({guestList.length})</p>
                        <span>{guestList.length > 0 ? guestList.join(', ') : 'Select departments or individuals to see the guest list.'}</span>
                    </GuestList>
                </FormSection>

                <SubmitButton type="submit" disabled={isSubmitting || loading}>
                    {isSubmitting ? 'Scheduling...' : 'Schedule Meeting & Send Invites'}
                </SubmitButton>
            </FormGrid>
        </PageContainer>
    );
};

export default CreateMeetingForm;