// File: src/Dashboard/Widgets/EngagementChart.jsx
import React from 'react';
import './Widgets.css'; // Assuming shared styles

// --- Step 1: Install chart libraries ---
// npm install react-chartjs-2 chart.js
// or
// yarn add react-chartjs-2 chart.js

// --- Step 2: Import necessary components ---
import { Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    Title // Import Title if you want to use it in options
} from 'chart.js';

// --- Step 3: Register Chart.js components ---
ChartJS.register(ArcElement, Tooltip, Legend, Title);


const EngagementChart = ({ data }) => { // Expects data like { Finance: 75, Development: 88, Design: 65 }

    const hasData = data && typeof data === 'object' && Object.keys(data).length > 0;

    // --- Step 4: Prepare Chart Data and Options ---
    const chartLabels = hasData ? Object.keys(data) : [];
    const chartValues = hasData ? Object.values(data) : [];

    // Define colors - add more if you have more departments
    const backgroundColors = [
        'rgba(54, 162, 235, 0.8)', // Blue
        'rgba(255, 206, 86, 0.8)', // Yellow
        'rgba(75, 192, 192, 0.8)', // Teal
        'rgba(153, 102, 255, 0.8)', // Purple
        'rgba(255, 159, 64, 0.8)', // Orange
        'rgba(255, 99, 132, 0.8)',  // Red
    ];
    const borderColors = backgroundColors.map(color => color.replace('0.8', '1')); // Make border solid

    const chartData = {
        labels: chartLabels,
        datasets: [{
            label: 'Engagement %',
            data: chartValues,
            backgroundColor: backgroundColors.slice(0, chartValues.length), // Use only needed colors
            borderColor: borderColors.slice(0, chartValues.length),
            borderWidth: 1,
        }]
    };

    const chartOptions = {
        responsive: true, // Make chart responsive
        maintainAspectRatio: false, // Allow chart to fill container height
        plugins: {
            legend: {
                position: 'bottom', // Position legend at the bottom
                labels: {
                    padding: 15, // Add padding to legend items
                    boxWidth: 12,
                    font: {
                        size: 10 // Adjust font size if needed
                    }
                }
            },
            title: {
                display: false, // Hide default chart title, use the h4 tag instead
                // text: 'Employee Engagement by Department',
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        let label = context.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed !== null) {
                             // Add '%' symbol to tooltip value
                            label += context.parsed.toFixed(1) + '%';
                        }
                        return label;
                    }
                }
            }
        },
        cutout: '60%', // Make it a doughnut chart (adjust percentage for thickness)
    };
    // --- End Chart Data/Options ---

    return (
        <div className="engagement-chart widget-card">
            <h4>Employee Engagement</h4>
             {/* Ensure wrapper has defined height for maintainAspectRatio:false */}
            <div className="chart-wrapper" style={{ height: '250px', position: 'relative' }}>
                {/* --- Step 5: Render the Doughnut chart --- */}
                {hasData ? (
                    <Doughnut data={chartData} options={chartOptions} />
                ) : (
                    <p style={{ textAlign: 'center', color: '#888', paddingTop: '50px' }}>
                        Engagement data is currently unavailable.
                    </p>
                )}
                 {/* --- End Doughnut chart --- */}
            </div>
        </div>
    );
};

export default EngagementChart;