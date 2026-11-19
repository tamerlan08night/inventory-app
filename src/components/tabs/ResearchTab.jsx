import React, { useState } from 'react';

const LEVELS = [1, 2, 3, 4];

export default function ResearchTab() {
    const [selectedLevel, setSelectedLevel] = useState(1);

    return (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="research-top-panel">
                <div className="research-stat-item">
                    <span className="research-stat-label">Available Points</span>
                    <span className="research-stat-value">⭐ 3 RP</span>
                </div>

                <div className="xp-bar-container">
                    <div className="research-stat-label">Operator Experience (XP)</div>
                    <div className="xp-bar-bg">
                        <div className="xp-bar-fill"></div>
                    </div>
                    <span className="xp-text">1,350 / 2,000 XP</span>
                </div>

                <div className="research-stat-item" style={{ alignItems: 'flex-end' }}>
                    <span className="research-stat-label">Base Level</span>
                    <span className="research-stat-value">Level 2</span>
                </div>
            </div>

            <div className="research-tabs">
                {LEVELS.map((level) => (
                    <button
                        key={level}
                        className={`research-tab-btn ${selectedLevel === level ? 'active' : ''}`}
                        onClick={() => setSelectedLevel(level)}
                    >
                        Level {level}
                    </button>
                ))}
            </div>

            <div className="research-frame">
                <img src={`/Research${selectedLevel}.jpg`} alt={`Research Level ${selectedLevel}`} />
            </div>
        </div>
    );
}
