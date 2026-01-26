import React from 'react';
import './Widgets.css';

const NoticeboardWidget = ({ notices = [] }) => {

    const getPriorityClass = (priority) => {
        switch (priority?.toUpperCase()) {
            case 'HIGH': return 'priority-high';
            case 'MEDIUM': return 'priority-medium';
            case 'LOW': return 'priority-low';
            default: return '';
        }
    };

    
    return (
        <div className="noticeboard-widget widget-card">
            <h4>Noticeboard</h4>
             {notices.length === 0 ? (
                <p>No active notices.</p>
             ) : (
                <table className="notice-table">
                    <thead>
                        <tr>
                            <th>Subject</th>
                            <th>Time</th>
                            <th>Start Date</th>
                            <th>End Date</th>
                            <th>Priority</th>
                            <th>Audience</th>
                        </tr>
                    </thead>
                    <tbody>
                        {notices.map((notice, index) => (
                            <tr key={index}>
                                <td>{notice.subject}</td>
                                <td>{notice.time}</td>
                                <td>{notice.startDate}</td>
                                <td>{notice.endDate}</td>
                                <td><span className={`priority-badge ${getPriorityClass(notice.priority)}`}>{notice.priority}</span></td>
                                <td>{notice.audience}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
             )}
        </div>
    );
};
export default NoticeboardWidget;