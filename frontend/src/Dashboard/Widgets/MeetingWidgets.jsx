import React, { useState } from 'react';
import { FaCheckCircle, FaTimesCircle, FaQuestionCircle } from 'react-icons/fa';
import { respondToMeeting } from '../../services/apiService'; // CORRECTED PATH
import './Widgets.css';

const formatInstantToLocalTime = (instantString) => {
    if (!instantString) return "N/A";
    try {
        return new Date(instantString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
        return "Invalid Date";
    }
};

const StatusIcon = ({ status }) => {
    if (status === 'ACCEPTED') return <FaCheckCircle color="var(--text-success)" title="Accepted" />;
    if (status === 'DECLINED') return <FaTimesCircle color="var(--text-error)" title="Declined" />;
    return <FaQuestionCircle color="var(--text-muted)" title="Pending" />;
};

const MeetingsWidget = ({ meetings = [], onUpdate }) => {
    const [expandedMeetingId, setExpandedMeetingId] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);

    const handleToggleDetails = (meetingId) => {
        setExpandedMeetingId(prevId => (prevId === meetingId ? null : meetingId));
    };

    const handleResponse = async (meetingId, response) => {
        setActionLoading(meetingId);
        try {
            await respondToMeeting(meetingId, response);
            if(onUpdate) onUpdate(); 
        } catch (error) {
            console.error(`Failed to respond to meeting ${meetingId}:`, error);
            alert(`Error: ${error.message}`);
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="meetings-widget widget-card">
            <h4>My Upcoming Schedule</h4>
            <div className="widget-content">
                {!meetings || meetings.length === 0 ? (
                    <p className="widget-placeholder" style={{textAlign: 'center', color: 'var(--text-muted)', margin: 'auto 0' }}>
                        No upcoming meetings.
                    </p>
                ) : (
                    <ul className="meetings-list-interactive">
                        {meetings.map(meeting => (
                            <li key={meeting.id} className="meeting-item-interactive">
                                <div className="meeting-main-info" onClick={() => handleToggleDetails(meeting.id)}>
                                    <span className="meeting-time-interactive">{formatInstantToLocalTime(meeting.startTime)}</span>
                                    <div className="meeting-details-interactive">
                                        <span className="meeting-title-interactive">{meeting.title}</span>
                                        <span className="meeting-creator-interactive">Hosted by: {meeting.creatorName}</span>
                                    </div>
                                    <div className="meeting-status-icon">
                                        <StatusIcon status={meeting.currentUserStatus} />
                                    </div>
                                </div>
                                
                                {meeting.currentUserStatus === 'PENDING' && (
                                    <div className="meeting-actions">
                                        <button onClick={() => handleResponse(meeting.id, 'ACCEPTED')} disabled={actionLoading === meeting.id} className="accept">Accept</button>
                                        <button onClick={() => handleResponse(meeting.id, 'DECLINED')} disabled={actionLoading === meeting.id} className="decline">Decline</button>
                                    </div>
                                )}

                                {expandedMeetingId === meeting.id && (
                                    <div className="meeting-attendee-list">
                                        <strong>Attendees:</strong>
                                        <ul>
                                            {meeting.attendees.map(att => (
                                                <li key={att.userId}><StatusIcon status={att.status} /> {att.name}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default MeetingsWidget;