// src/Dashboard/Widgets/KpiCard.jsx
import React from 'react';
import './Widgets.css';
import { FaArrowUp, FaArrowDown, FaMinus, FaUsers, FaUserCheck, FaBriefcase } from 'react-icons/fa';

const KpiCard = ({ title, value, trend }) => {
    // Logic to determine the trend icon and color
    const renderTrend = () => {
        const trendValue = parseInt(trend, 10);
        if (isNaN(trendValue)) return null; // Don't render if trend is not a number

        let TrendIcon = FaMinus;
        let trendClass = 'trend-neutral';

        if (trendValue > 0) {
            TrendIcon = FaArrowUp;
            trendClass = 'trend-positive';
        } else if (trendValue < 0) {
            TrendIcon = FaArrowDown;
            trendClass = 'trend-negative';
        }

        // Only show the trend if it's not zero
        if (trendValue !== 0) {
            return (
                <div className={`kpi-trend ${trendClass}`}>
                    <TrendIcon />
                    <span>{Math.abs(trendValue)}</span>
                </div>
            );
        }
        return null; // Return null if trend is 0
    };

    // Logic to select a primary icon based on the card title
    const renderTitleIcon = () => {
        switch (title.toLowerCase()) {
            case 'employees':
                return <FaUsers />;
            case 'attendees today':
                return <FaUserCheck />;
            case 'active recruitment':
                return <FaBriefcase />;
            default:
                return null;
        }
    };

    return (
        <div className="kpi-card widget-card">
            <div className="kpi-header">
                <p className="kpi-title">{title}</p>
                <div className="kpi-icon">{renderTitleIcon()}</div>
            </div>
            <p className="kpi-value">{value}</p>
            {renderTrend()}
        </div>
    );
};
export default KpiCard;