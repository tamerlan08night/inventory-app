import React from 'react';
import { CONSUME_ICONS } from '../data/itemIcons';
import './Hotbar.css';

export default function Hotbar({ hotbarItems, onDropToHotbar, onRemoveFromHotbar, onConsumeFromHotbar }) {
    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e, index) => {
        e.preventDefault();
        const sourceIndex = e.dataTransfer.getData('inventoryIndex');
        if (sourceIndex !== '') {
            onDropToHotbar(parseInt(sourceIndex), index);
        }
    };

    return (
        <div className="hotbar-container panel">
            {hotbarItems.map((item, index) => (
                <div
                    key={index}
                    className={`hotbar-slot ${item ? 'filled' : ''}`}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                >
                    <span className="hotbar-key">{index === 9 ? 0 : index + 1}</span>
                    {item ? (
                        <div className="hotbar-item-card">
                            <span className="hotbar-item-name">{item.name}</span>
                            {CONSUME_ICONS[item.type] && (
                                <button
                                    type="button"
                                    className="hotbar-consume-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onConsumeFromHotbar(index);
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
                                className="hotbar-remove-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRemoveFromHotbar(index);
                                }}
                            >
                                ×
                            </button>
                        </div>
                    ) : null}
                </div>
            ))}
        </div>
    );
}