import React, { useState } from 'react';
import DevSpawnModal from './dev/DevSpawnModal';
import { CONSUME_ICONS } from '../data/itemIcons';
import { getItemTooltip } from '../utils/itemFormat';
import './InventoryGrid.css';

export default function InventoryGrid({ inventory, maxWeight, currentWeight, onAddItem, onRemoveItem, onMoveItem, onConsumeItem }) {
    const [isDevOpen, setIsDevOpen] = useState(false);
    const [draggedIndex, setDraggedIndex] = useState(null);

    // Calculate the fill percentage based on the total weight from App.jsx
    const weightPercent = Math.min((parseFloat(currentWeight) / maxWeight) * 100, 100);

    const handleDragStart = (e, index) => {
        setDraggedIndex(index);
        e.dataTransfer.setData('inventoryIndex', index);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e, targetIndex) => {
        e.preventDefault();
        if (draggedIndex === null) return;
        onMoveItem(draggedIndex, targetIndex);
        setDraggedIndex(null);
    };

    return (
        <div className="inventory-container">
            {/* Top weight bar */}
            <div className="weight-section panel">
                <div className="weight-bar-bg">
                    <div
                        className="weight-bar-fill"
                        style={{ width: `${weightPercent}%` }}
                    ></div>
                </div>
                <div className="weight-text">
                    <span className="weight-current">{currentWeight}</span> / <span className="weight-max">{maxWeight} KG</span>
                </div>
            </div>

            {/* Slot grid; a backpack can add extra slots that scroll into view */}
            <div className="inventory-scroll panel">
                <div className="inventory-grid">
                    {inventory.map((item, index) => (
                        <div
                            key={index}
                            className={`inventory-slot ${item ? 'filled' : ''}`}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, index)}
                        >
                            {item ? (
                                <>
                                    <div
                                        className="item-card"
                                        draggable
                                        title={getItemTooltip(item)}
                                        onDragStart={(e) => handleDragStart(e, index)}
                                    >
                                        <span className="item-name">{item.name}</span>
                                        <span className="item-type-badge">{item.type}</span>
                                        {item.value > 0 && (
                                            <span className="item-val">
                                                {item.type === 'food' ? `+${item.value} kcal` : item.type === 'drink' ? `+${item.value}% H2O` : ''}
                                            </span>
                                        )}
                                        {item.count > 1 && <span className="item-count">x{item.count}</span>}
                                    </div>
                                    {CONSUME_ICONS[item.type] && (
                                        <button
                                            type="button"
                                            className="consume-item-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onConsumeItem(index);
                                            }}
                                            title={
                                                item.type === 'food'
                                                    ? `Eat (+${item.value ?? 0} kcal)`
                                                    : `Drink (+${item.value ?? 0}% H2O)`
                                            }
                                        >
                                            {CONSUME_ICONS[item.type]}
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        className="remove-item-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onRemoveItem(index);
                                        }}
                                        title="Drop item"
                                    >
                                        ×
                                    </button>
                                </>
                            ) : null}
                        </div>
                    ))}
                </div>
            </div>

            {/* DEV spawn */}
            <div className="dev-toolbar">
                <button
                    type="button"
                    className="dev-open-btn"
                    onClick={() => setIsDevOpen(true)}
                    title="Open developer spawn menu"
                >
                    ⚙ DEV
                </button>
            </div>

            {isDevOpen && (
                <DevSpawnModal onClose={() => setIsDevOpen(false)} onSpawn={onAddItem} />
            )}
        </div>
    );
}
