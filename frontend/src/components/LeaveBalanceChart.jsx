// src/components/LeaveBalanceChart.jsx
import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend, // Still need to register it, even if we hide it later
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const LeaveBalanceChart = ({ balances }) => {
    if (!balances) {
        // Added a more styled placeholder for loading
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', color: 'var(--text-secondary)' }}>
                <p>Loading balance chart...</p>
            </div>
        );
    }

    const chartData = {
        labels: ['Paid Leave', 'Sick Leave', 'Floater Leave'],
        datasets: [
            {
                // label: 'Available Days', // We'll hide the legend, so this isn't strictly necessary
                data: [
                    balances.paidLeaveBalance,
                    balances.sickLeaveBalance,
                    balances.floaterLeaveBalance,
                ],
                backgroundColor: [ // Slightly more vibrant and distinct colors
                    'rgba(75, 192, 192, 0.7)',  // Teal/Aqua
                    'rgba(255, 159, 64, 0.7)', // Orange
                    'rgba(153, 102, 255, 0.7)', // Purple
                    // Add more if you ever add more leave types to the chart
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(153, 102, 255, 1)',
                ],
                borderWidth: 1,
                borderRadius: 4, // Add rounded corners to bars
                barPercentage: 0.7, // Adjust bar width
                categoryPercentage: 0.8, // Adjust spacing between bars
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false, // <<< HIDE THE DEFAULT LEGEND
            },
            title: {
                display: true,
                text: 'Current Leave Balances (Days)',
                color: 'var(--text-primary)',
                font: {
                    size: 16, // Slightly larger title
                    weight: '600',
                },
                padding: {
                    bottom: 20 // Add some space below the title
                }
            },
            tooltip: {
                backgroundColor: 'var(--background-secondary)', // Themed tooltip
                titleColor: 'var(--text-primary)',
                bodyColor: 'var(--text-secondary)',
                borderColor: 'var(--border-primary)',
                borderWidth: 1,
                padding: 10,
                cornerRadius: 4,
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || context.label || ''; // Use x-axis label as tooltip title part
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            // Display value with one decimal place
                            label += context.parsed.y.toFixed(1) + ' days';
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    color: 'var(--text-secondary)',
                    stepSize: Math.max(1, Math.ceil(Math.max(balances.paidLeaveBalance, balances.sickLeaveBalance, balances.floaterLeaveBalance) / 5)), // Dynamic step size, at least 1
                    precision: 0, // Ensure integer ticks on y-axis if stepSize is integer
                    padding: 10,
                },
                grid: {
                    color: 'var(--border-secondary)',
                    drawBorder: false, // Hide the y-axis line itself if desired
                },
                title: { // Optional: Add a y-axis title
                    display: true,
                    text: 'Days Available',
                    color: 'var(--text-secondary)',
                    font: {
                        size: 12,
                    },
                    padding: { top: 0, bottom: 0}
                }
            },
            x: {
                ticks: {
                    color: 'var(--text-secondary)',
                    padding: 10,
                },
                grid: {
                    display: false, // Keep vertical grid lines hidden
                },
            }
        },
        // Optional: interaction mode for tooltips
        interaction: {
            mode: 'index', // Tooltip appears for items at the same x-axis index
            intersect: false,
        },
    };

    return (
        <div style={{ height: '300px', width: '100%', position: 'relative' }}>
            <Bar data={chartData} options={options} />
        </div>
    );
};

export default LeaveBalanceChart;