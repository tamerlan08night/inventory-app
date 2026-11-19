import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ITEM_TYPE_ICONS } from '../../data/itemIcons';
import './DevSpawnModal.css';

const CATEGORIES = [
    { id: 'food', label: 'Food', icon: ITEM_TYPE_ICONS.food },
    { id: 'drink', label: 'Drink', icon: ITEM_TYPE_ICONS.drink },
    { id: 'equipment', label: 'Equipment', icon: ITEM_TYPE_ICONS.chest },
    { id: 'weapon', label: 'Weapon', icon: ITEM_TYPE_ICONS.weapon },
];

const EQUIPMENT_SLOTS = [
    { id: 'chest', label: 'Armor Vest', icon: ITEM_TYPE_ICONS.chest },
    { id: 'helmet', label: 'Helmet', icon: ITEM_TYPE_ICONS.helmet },
    { id: 'gloves', label: 'Gloves', icon: ITEM_TYPE_ICONS.gloves },
    { id: 'pants', label: 'Pants', icon: ITEM_TYPE_ICONS.pants },
    { id: 'boots', label: 'Boots', icon: ITEM_TYPE_ICONS.boots },
    { id: 'backpack', label: 'Backpack', icon: ITEM_TYPE_ICONS.backpack },
    { id: 'module', label: 'Module', icon: ITEM_TYPE_ICONS.module },
];

const DEFAULT_FORM = {
    category: 'food',
    name: '',
    weight: '',
    count: '1',
    calories: '100',
    water: '100',
    slot: 'chest',
    defense: '0',
    damage: '0',
    effects: '',
    slots: '0',
    capacity: '0',
};

const toNumber = (value) => (value === '' ? NaN : Number(value));

const createItemId = () =>
    typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const fieldClass = (baseClass, isValid, value) =>
    `${baseClass}${value !== '' && !isValid ? ' invalid' : ''}`;

export default function DevSpawnModal({ onClose, onSpawn }) {
    const [form, setForm] = useState(DEFAULT_FORM);
    const nameInputRef = useRef(null);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') onClose();
        };

        document.addEventListener('keydown', handleKeyDown);

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        nameInputRef.current?.focus();

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = previousOverflow;
        };
    }, [onClose]);

    const setField = (field, value) => {
        setForm((previous) => ({ ...previous, [field]: value }));
    };

    const handleCategoryChange = (category) => {
        setForm({ ...DEFAULT_FORM, category });
    };

    const handleBackdropMouseDown = (event) => {
        if (event.target === event.currentTarget) onClose();
    };

    const nameValid = form.name.trim().length > 0;

    const weightValue = toNumber(form.weight);
    const weightValid = Number.isFinite(weightValue) && weightValue > 0;

    const countValue = parseInt(form.count, 10);
    const countValid = Number.isInteger(countValue) && countValue >= 1;

    const caloriesValue = toNumber(form.calories);
    const caloriesValid = Number.isFinite(caloriesValue) && caloriesValue >= 0;

    const waterValue = toNumber(form.water);
    const waterValid = Number.isFinite(waterValue) && waterValue >= 0 && waterValue <= 100;

    const defenseValue = toNumber(form.defense);
    const defenseValid = Number.isFinite(defenseValue) && defenseValue >= 0;

    const damageValue = toNumber(form.damage);
    const damageValid = Number.isFinite(damageValue) && damageValue >= 0;

    const slotsValue = parseInt(form.slots, 10);
    const slotsValid = Number.isInteger(slotsValue) && slotsValue >= 0;

    const capacityValue = toNumber(form.capacity);
    const capacityValid = Number.isFinite(capacityValue) && capacityValue >= 0;

    const isBackpack = form.category === 'equipment' && form.slot === 'backpack';

    const categoryValid =
        form.category === 'food'
            ? countValid && caloriesValid
            : form.category === 'drink'
                ? countValid && waterValid
                : form.category === 'equipment'
                    ? defenseValid && (!isBackpack || (slotsValid && capacityValid))
                    : damageValid;

    const isValid = nameValid && weightValid && categoryValid;

    const buildItem = () => {
        const baseItem = {
            id: createItemId(),
            name: form.name.trim(),
            weight: weightValue,
            count: 1,
        };

        switch (form.category) {
            case 'food':
                return { ...baseItem, type: 'food', count: countValue, value: caloriesValue };
            case 'drink':
                return { ...baseItem, type: 'drink', count: countValue, value: waterValue };
            case 'equipment': {
                const equipmentItem = {
                    ...baseItem,
                    type: form.slot,
                    defense: defenseValue,
                    effects: form.effects.trim(),
                };

                // Backpacks grant extra inventory slots and carry capacity
                if (form.slot === 'backpack') {
                    equipmentItem.slots = slotsValue;
                    equipmentItem.capacity = capacityValue;
                }

                return equipmentItem;
            }
            case 'weapon':
                return {
                    ...baseItem,
                    type: 'weapon',
                    damage: damageValue,
                    effects: form.effects.trim(),
                };
            default:
                return baseItem;
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!isValid) return;

        const spawned = onSpawn(buildItem());
        if (spawned !== false) {
            onClose();
        }
    };

    return createPortal(
        <div className="dev-modal-overlay" onMouseDown={handleBackdropMouseDown}>
            <form
                className="dev-modal"
                onSubmit={handleSubmit}
                role="dialog"
                aria-modal="true"
                aria-labelledby="dev-modal-title"
            >
                <div className="dev-modal-header">
                    <h3 id="dev-modal-title">
                        <span className="dev-badge">DEV</span> Spawn Item
                    </h3>
                    <button
                        type="button"
                        className="dev-modal-close"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>

                <label className="dev-field" htmlFor="dev-category">
                    <span className="dev-label">Category</span>
                    <select
                        id="dev-category"
                        className="dev-input dev-select"
                        value={form.category}
                        onChange={(event) => handleCategoryChange(event.target.value)}
                    >
                        {CATEGORIES.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.icon} {category.label}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="dev-field" htmlFor="dev-name">
                    <span className="dev-label">Name</span>
                    <input
                        id="dev-name"
                        ref={nameInputRef}
                        className="dev-input"
                        type="text"
                        placeholder="Item name..."
                        value={form.name}
                        onChange={(event) => setField('name', event.target.value)}
                        required
                    />
                </label>

                <div className="dev-row">
                    <label className="dev-field" htmlFor="dev-weight">
                        <span className="dev-label">Weight, kg</span>
                        <input
                            id="dev-weight"
                            className={fieldClass('dev-input', weightValid, form.weight)}
                            type="number"
                            step="0.1"
                            min="0"
                            placeholder="0.0"
                            value={form.weight}
                            onChange={(event) => setField('weight', event.target.value)}
                            required
                        />
                    </label>

                    {(form.category === 'food' || form.category === 'drink') && (
                        <label className="dev-field" htmlFor="dev-count">
                            <span className="dev-label">Quantity</span>
                            <input
                                id="dev-count"
                                className={fieldClass('dev-input', countValid, form.count)}
                                type="number"
                                min="1"
                                step="1"
                                value={form.count}
                                onChange={(event) => setField('count', event.target.value)}
                            />
                        </label>
                    )}
                </div>

                {form.category === 'food' && (
                    <label className="dev-field" htmlFor="dev-calories">
                        <span className="dev-label">Calories</span>
                        <input
                            id="dev-calories"
                            className={fieldClass('dev-input', caloriesValid, form.calories)}
                            type="number"
                            min="0"
                            step="1"
                            value={form.calories}
                            onChange={(event) => setField('calories', event.target.value)}
                        />
                    </label>
                )}

                {form.category === 'drink' && (
                    <label className="dev-field" htmlFor="dev-water">
                        <span className="dev-label">Water %</span>
                        <input
                            id="dev-water"
                            className={fieldClass('dev-input', waterValid, form.water)}
                            type="number"
                            min="0"
                            max="100"
                            step="1"
                            value={form.water}
                            onChange={(event) => setField('water', event.target.value)}
                        />
                    </label>
                )}

                {form.category === 'equipment' && (
                    <>
                        <label className="dev-field" htmlFor="dev-slot">
                            <span className="dev-label">Slot</span>
                            <select
                                id="dev-slot"
                                className="dev-input dev-select"
                                value={form.slot}
                                onChange={(event) => setField('slot', event.target.value)}
                            >
                                {EQUIPMENT_SLOTS.map((slot) => (
                                    <option key={slot.id} value={slot.id}>
                                        {slot.icon} {slot.label}
                                    </option>
                                ))}
                            </select>
                        </label>

                        {form.slot === 'backpack' && (
                            <>
                                <div className="dev-row">
                                    <label className="dev-field" htmlFor="dev-slots">
                                        <span className="dev-label">+ Slots</span>
                                        <input
                                            id="dev-slots"
                                            className={fieldClass('dev-input', slotsValid, form.slots)}
                                            type="number"
                                            min="0"
                                            step="1"
                                            value={form.slots}
                                            onChange={(event) => setField('slots', event.target.value)}
                                        />
                                    </label>

                                    <label className="dev-field" htmlFor="dev-capacity">
                                        <span className="dev-label">+ Capacity, kg</span>
                                        <input
                                            id="dev-capacity"
                                            className={fieldClass('dev-input', capacityValid, form.capacity)}
                                            type="number"
                                            min="0"
                                            step="1"
                                            value={form.capacity}
                                            onChange={(event) => setField('capacity', event.target.value)}
                                        />
                                    </label>
                                </div>
                                <p className="dev-hint">
                                    Extra slots are appended to the grid and scroll into view. Capacity raises the carry limit.
                                </p>
                            </>
                        )}

                        <label className="dev-field" htmlFor="dev-defense">
                            <span className="dev-label">Defense</span>
                            <input
                                id="dev-defense"
                                className={fieldClass('dev-input', defenseValid, form.defense)}
                                type="number"
                                min="0"
                                step="1"
                                value={form.defense}
                                onChange={(event) => setField('defense', event.target.value)}
                            />
                        </label>

                        <label className="dev-field" htmlFor="dev-equipment-effects">
                            <span className="dev-label">Effects</span>
                            <textarea
                                id="dev-equipment-effects"
                                className="dev-input dev-textarea"
                                placeholder="e.g. +5 fire resistance"
                                value={form.effects}
                                onChange={(event) => setField('effects', event.target.value)}
                            />
                        </label>
                    </>
                )}

                {form.category === 'weapon' && (
                    <>
                        <label className="dev-field" htmlFor="dev-damage">
                            <span className="dev-label">Damage</span>
                            <input
                                id="dev-damage"
                                className={fieldClass('dev-input', damageValid, form.damage)}
                                type="number"
                                min="0"
                                step="1"
                                value={form.damage}
                                onChange={(event) => setField('damage', event.target.value)}
                            />
                        </label>

                        <label className="dev-field" htmlFor="dev-weapon-effects">
                            <span className="dev-label">Effects</span>
                            <textarea
                                id="dev-weapon-effects"
                                className="dev-input dev-textarea"
                                placeholder="e.g. causes bleeding"
                                value={form.effects}
                                onChange={(event) => setField('effects', event.target.value)}
                            />
                        </label>
                    </>
                )}

                <div className="dev-modal-actions">
                    <button type="button" className="dev-cancel-btn" onClick={onClose}>
                        Cancel
                    </button>
                    <button type="submit" className="dev-spawn-btn" disabled={!isValid}>
                        Spawn
                    </button>
                </div>
            </form>
        </div>,
        document.body,
    );
}
