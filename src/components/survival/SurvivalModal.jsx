import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ITEM_TYPE_ICONS } from '../../data/itemIcons';
import {
    WATER_DRAIN_PER_SECOND,
    CALORIES_DRAIN_PER_SECOND,
    THIRST_DAMAGE_PER_SECOND,
    HUNGER_DAMAGE_PER_SECOND,
    HEALTH_REGEN_PER_SECOND,
    SPEED_OPTIONS,
} from '../../data/survivalConfig';
import './SurvivalModal.css';

const clampPercent = (value, max) => clampBetween((value / max) * 100, 0, 100);

function clampBetween(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function VitalBar({ tone, percent }) {
    return (
        <div className="survival-bar">
            <div
                className={`survival-bar-fill ${tone}`}
                style={{ width: `${percent}%` }}
            />
        </div>
    );
}

function getStatusText(water, calories, isFlowing) {
    const starving = calories <= 0;
    const dehydrated = water <= 0;

    if (starving && dehydrated) {
        return `Dehydrated and starving: -${(THIRST_DAMAGE_PER_SECOND + HUNGER_DAMAGE_PER_SECOND).toFixed(1)} HP/s`;
    }
    if (dehydrated) {
        return `Dehydrated: -${THIRST_DAMAGE_PER_SECOND.toFixed(1)} HP/s`;
    }
    if (starving) {
        return `Starving: -${HUNGER_DAMAGE_PER_SECOND.toFixed(1)} HP/s`;
    }
    if (isFlowing) {
        return `Regenerating: +${HEALTH_REGEN_PER_SECOND} HP/s`;
    }
    return 'All needs are currently satisfied.';
}

export default function SurvivalModal({ survival, onClose }) {
    const {
        health,
        water,
        calories,
        maxHealth,
        maxCalories,
        isFlowing,
        speed,
        toggleFlowing,
        setSpeed,
        reduceWater,
        reduceCalories,
    } = survival;

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') onClose();
        };

        document.addEventListener('keydown', handleKeyDown);

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = previousOverflow;
        };
    }, [onClose]);

    const handleBackdropMouseDown = (event) => {
        if (event.target === event.currentTarget) onClose();
    };

    const statusText = getStatusText(water, calories, isFlowing);
    const hasDamage = water <= 0 || calories <= 0;

    return createPortal(
        <div className="survival-overlay" onMouseDown={handleBackdropMouseDown}>
            <div
                className="survival-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="survival-modal-title"
            >
                <div className="survival-header">
                    <h3 id="survival-modal-title">⏱ Survival</h3>
                    <button
                        type="button"
                        className="survival-close"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>

                <div className="survival-vital">
                    <div className="survival-vital-top">
                        <span>❤️ Health</span>
                        <span>{Math.round(health)}%</span>
                    </div>
                    <VitalBar tone="health" percent={clampPercent(health, maxHealth)} />
                </div>

                <div className="survival-vital">
                    <div className="survival-vital-top">
                        <span>{ITEM_TYPE_ICONS.drink} Water</span>
                        <span>{Math.round(water)}%</span>
                    </div>
                    <VitalBar tone="water" percent={clampPercent(water, 100)} />

                    <div className="survival-actions">
                        <span className="survival-actions-label">Subtract</span>
                        <button type="button" className="survival-mini-btn" onClick={() => reduceWater(5)}>-5%</button>
                        <button type="button" className="survival-mini-btn" onClick={() => reduceWater(10)}>-10%</button>
                        <button type="button" className="survival-mini-btn" onClick={() => reduceWater(25)}>-25%</button>
                    </div>
                </div>

                <div className="survival-vital">
                    <div className="survival-vital-top">
                        <span>{ITEM_TYPE_ICONS.food} Food</span>
                        <span>
                            {Math.round(calories)} / {maxCalories} kcal
                        </span>
                    </div>
                    <VitalBar tone="food" percent={clampPercent(calories, maxCalories)} />

                    <div className="survival-actions">
                        <span className="survival-actions-label">Subtract</span>
                        <button type="button" className="survival-mini-btn" onClick={() => reduceCalories(50)}>-50</button>
                        <button type="button" className="survival-mini-btn" onClick={() => reduceCalories(100)}>-100</button>
                        <button type="button" className="survival-mini-btn" onClick={() => reduceCalories(250)}>-250</button>
                    </div>
                </div>

                <div className="survival-divider" />

                <div className="survival-time">
                    <div className="survival-time-row">
                        <span className="survival-label">Time flow</span>
                        <button
                            type="button"
                            className={`survival-flow-btn ${isFlowing ? 'active' : ''}`}
                            onClick={toggleFlowing}
                        >
                            {isFlowing ? '⏸ Pause' : '▶ Start'}
                        </button>
                    </div>

                    <div className="survival-time-row">
                        <span className="survival-label">Speed</span>
                        <div className="survival-speed-buttons">
                            {SPEED_OPTIONS.map((option) => (
                                <button
                                    key={option}
                                    type="button"
                                    className={`survival-speed-btn ${speed === option ? 'active' : ''}`}
                                    onClick={() => setSpeed(option)}
                                >
                                    {option}×
                                </button>
                            ))}
                        </div>
                    </div>

                    <p className="survival-rates">
                        Water -{WATER_DRAIN_PER_SECOND}%/s · Food -{CALORIES_DRAIN_PER_SECOND} kcal/s at 1×
                    </p>
                    <p className="survival-rates">
                        Health +{HEALTH_REGEN_PER_SECOND} HP/s while fed and hydrated at 1×
                    </p>
                    <p className={`survival-status ${hasDamage ? 'danger' : ''}`}>{statusText}</p>
                </div>
            </div>
        </div>,
        document.body,
    );
}
