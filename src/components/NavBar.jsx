import React from 'react';
import { TABS } from '../data/tabs';

export default function NavBar({ activeTab, onChange }) {
    return (
        <div className="nav-bar">
            {TABS.map((tab) => (
                <button
                    key={tab.id}
                    className={`nav-btn ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => onChange(tab.id)}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}
