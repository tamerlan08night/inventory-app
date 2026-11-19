import React from 'react';
import { achievements } from '../../data/achievements';

export default function AchievementsTab() {
    return (
        <div className="achievements-grid">
            {achievements.map((achievement) => (
                <div
                    key={achievement.id}
                    className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`}
                >
                    <div className="achievement-header">
                        <span className="achievement-title">{achievement.title}</span>
                        <span className={`achievement-status ${achievement.unlocked ? 'unlocked-badge' : 'locked-badge'}`}>
                            {achievement.unlocked ? '✓ UNLOCKED' : '🔒 LOCKED'}
                        </span>
                    </div>
                    <p className="achievement-desc">{achievement.desc}</p>
                </div>
            ))}
        </div>
    );
}
