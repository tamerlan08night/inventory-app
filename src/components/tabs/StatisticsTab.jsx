import React from 'react';

const STATS = [
    { icon: '📊', label: 'Distance Traveled', value: '14.2 km' },
    { icon: '🎯', label: 'Shooting Accuracy', value: '88%' },
    { icon: '⏱️', label: 'Survival Time', value: '3 days 4 hrs' },
    { icon: '🎒', label: 'Resources Collected', value: '450 kg' },
];

export default function StatisticsTab() {
    return (
        <div
            className="stats-list"
            style={{
                textAlign: 'left',
                background: 'rgba(0,0,0,0.4)',
                padding: '20px',
                borderRadius: '6px',
                width: '100%',
                maxWidth: '400px',
                margin: '0 auto',
            }}
        >
            {STATS.map((stat) => (
                <p key={stat.label}>
                    {stat.icon} <strong>{stat.label}:</strong> {stat.value}
                </p>
            ))}
        </div>
    );
}
