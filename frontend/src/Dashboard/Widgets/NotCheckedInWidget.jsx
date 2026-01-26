// src/Dashboard/Widgets/NotCheckedInWidget.jsx
import React from 'react';
import './Widgets.css';
import defaultAvatar from '../../assets/images/default-avatar.png';

const NotCheckedInWidget = ({ users = [], onUserClick, onShowAllClick }) => {
    return (
        <div className="not-checked-in-widget widget-card">
            <h4>Not Checked In Today</h4>
            <div className="widget-content">
                {users.length === 0 ? (
                    <p style={{ textAlign: 'center', margin: 'auto 0' }}>Everyone is checked in!</p>
                ) : (
                    <>
                        <div className="user-list-horizontal">
                            {users.map(user => (
                                <div key={user.id} className="user-summary-item" onClick={() => onUserClick(user.id)} style={{cursor: 'pointer'}}>
                                    <img
                                        src={user.profilePictureUrl || defaultAvatar}
                                        alt={user.name}
                                        className="user-avatar-small"
                                        onError={(e) => { e.target.onerror = null; e.target.src=defaultAvatar; }}
                                    />
                                    <p className="user-name-small">{user.name}</p>
                                    <p className="user-designation-small">{user.designation}</p>
                                </div>
                            ))}
                        </div>
                        {users.length > 0 && (
                            <div style={{ textAlign: 'right', marginTop: 'auto', paddingTop: '10px' }}>
                                {/* This button now has a working onClick handler */}
                                <button className="show-all-button" onClick={onShowAllClick}>
                                    Show all ({users.length}) 
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default NotCheckedInWidget;