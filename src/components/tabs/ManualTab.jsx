import React from 'react';

const SECTIONS = [
    { title: 'NATURE', image: '/Nature.jpg', alt: 'Nature' },
    { title: 'CREATURE', image: '/Creature.jpg', alt: 'Creature' },
    { title: 'ITEMS', image: '/Items.jpg', alt: 'Items' },
];

export default function ManualTab() {
    return (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '20px' }}>
                Study the environment, threats, and survival equipment.
            </p>

            <div className="manual-grid">
                {SECTIONS.map((section) => (
                    <div key={section.title} className="manual-column">
                        <div className="manual-title-box">{section.title}</div>
                        <div className="manual-frame">
                            <img src={section.image} alt={section.alt} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
