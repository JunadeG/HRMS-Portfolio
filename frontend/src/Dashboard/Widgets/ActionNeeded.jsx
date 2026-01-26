// src/Dashboard/Widgets/ActionNeeded.jsx
import React from 'react';
import './Widgets.css'; // Assuming shared styles are here
import { Link } from 'react-router-dom'; // For internal app navigation

/**
 * Displays a message indicating pending actions and provides a link if applicable.
 * Relies on CSS classes defined in Widgets.css for styling (e.g., action-needed-alert).
 * @param {object} props - Component props.
 * @param {string} [props.message="No pending actions."] - The message to display.
 * @param {string} [props.url] - The URL to link to for viewing actions (optional).
 */
const ActionNeededWidget = ({ message = "No pending actions.", url }) => {
    // Determine if there's a specific action based on the presence of a URL
    // and a message that doesn't indicate "no actions".
    const hasSpecificAction = url && message && !message.toLowerCase().includes("no pending actions");

    // Dynamically set the CSS class for styling based on action presence.
    const cardClass = `widget-card ${hasSpecificAction ? 'action-needed-alert' : 'action-needed-clear'}`;

    return (
        <div className={cardClass}>
            <h4>Action Needed</h4>
            <div className="widget-content"> {/* Consistent content wrapper */}
                <p>{message}</p>

                {/* Only show the link if a specific action and URL are present */}
                {hasSpecificAction && (
                    <div style={{ marginTop: '10px', textAlign: 'right' }}> {/* Aligns link */}
                        {/* Use React Router Link for internal app navigation */}
                        {url.startsWith('/') ? (
                            <Link to={url} className="action-link">
                                View Actions > {/* Use HTML entity for > */}
                            </Link>
                        ) : (
                            /* Use standard 'a' tag for external links */
                            <a href={url} target="_blank" rel="noopener noreferrer" className="action-link">
                                View Details > {/* Use HTML entity for > */}
                            </a>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActionNeededWidget;