import React, { useState } from 'react';
import { ITEM_TYPE_ICONS } from '../data/itemIcons';
import SurvivalModal from './survival/SurvivalModal';
import './PlayerPanel.css';

export default function PlayerPanel({ stats, equipment, onEquipItem, onUnequipItem }) {
    const [isSurvivalOpen, setIsSurvivalOpen] = useState(false);

    const leftSlots = [
        { type: 'helmet', icon: ITEM_TYPE_ICONS.helmet, label: 'Helmet' },
        { type: 'chest', icon: ITEM_TYPE_ICONS.chest, label: 'Chest' },
        { type: 'gloves', icon: ITEM_TYPE_ICONS.gloves, label: 'Gloves' },
        { type: 'pants', icon: ITEM_TYPE_ICONS.pants, label: 'Pants' },
        { type: 'boots', icon: ITEM_TYPE_ICONS.boots, label: 'Boots' },
    ];

    const rightSlots = [
        { type: 'module1', slotType: 'module', icon: ITEM_TYPE_ICONS.module, label: 'Module 1' },
        { type: 'module2', slotType: 'module', icon: ITEM_TYPE_ICONS.module, label: 'Module 2' },
        { type: 'module3', slotType: 'module', icon: ITEM_TYPE_ICONS.module, label: 'Module 3' },
        { type: 'backpack', slotType: 'backpack', icon: ITEM_TYPE_ICONS.backpack, label: 'Backpack' },
        { type: 'special', slotType: 'special', icon: ITEM_TYPE_ICONS.special, label: 'Special' },
    ];

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDropOnSlot = (e, targetSlotType) => {
        e.preventDefault();
        const sourceIndex = e.dataTransfer.getData('inventoryIndex');
        if (sourceIndex !== '') {
            onEquipItem(parseInt(sourceIndex), targetSlotType);
        }
    };

    return (
        <div className="player-panel panel">
            {/* Player stats */}
            <div className="stats-box">
                <div className="health-row">
                    <span className="heart-icon">❤️</span>
                    <div className="health-text">
                        <strong>{Math.round(stats.health)}%</strong>
                        <span>HEALTH</span>
                    </div>
                </div>
                <div className="other-stats">
                    <div className="stat-box-item">
                        <span>🔥 Calories</span>
                        <strong>{Math.round(stats.calories)}</strong>
                    </div>
                    <div className="stat-box-item">
                        <span>💧 Water</span>
                        <strong>{Math.round(stats.water)}%</strong>
                    </div>
                </div>
                <button
                    type="button"
                    className={`survival-open-btn ${stats.isFlowing ? 'flowing' : ''}`}
                    onClick={() => setIsSurvivalOpen(true)}
                    title="Open survival controls"
                >
                    {stats.isFlowing ? `▶ Survival ×${stats.speed}` : '⏱ Survival'}
                </button>
            </div>

            {/* Character doll and equipment slots */}
            <div className="equipment-container">
                <div className="character-silhouette">
                    <img src="/body.png" alt="Character body silhouette" />
                </div>
                <div className="equipment-slots">
                    {/* Column 1: Clothing/Armor */}
                    <div className="gear-col">
                        {leftSlots.map((slot) => {
                            const item = equipment[slot.type];
                            return (
                                <div
                                    key={slot.type}
                                    className={`gear-slot ${item ? 'equipped' : ''}`}
                                    title={slot.label}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDropOnSlot(e, slot.type)}
                                >
                                    {item ? (
                                        <span className="equipped-name" onClick={() => onUnequipItem(slot.type)} title="Click to unequip">
                      {item.name}
                    </span>
                                    ) : (
                                        slot.icon
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Column 2: Modules, Backpack, Special */}
                    <div className="gear-col">
                        {rightSlots.map((slot) => {
                            const item = equipment[slot.type];
                            return (
                                <div
                                    key={slot.type}
                                    className={`gear-slot special ${item ? 'equipped' : ''}`}
                                    title={slot.label}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDropOnSlot(e, slot.type)}
                                >
                                    {item ? (
                                        <span className="equipped-name" onClick={() => onUnequipItem(slot.type)} title="Click to unequip">
                      {item.name}
                    </span>
                                    ) : (
                                        slot.icon
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {isSurvivalOpen && (
                <SurvivalModal survival={stats} onClose={() => setIsSurvivalOpen(false)} />
            )}
        </div>
    );
}
