import { useEffect, useState } from 'react';
import {
    MAX_HEALTH,
    MAX_WATER,
    MAX_CALORIES,
    INITIAL_VITALS,
    WATER_DRAIN_PER_SECOND,
    CALORIES_DRAIN_PER_SECOND,
    THIRST_DAMAGE_PER_SECOND,
    HUNGER_DAMAGE_PER_SECOND,
    HEALTH_REGEN_PER_SECOND,
    SPEED_OPTIONS,
} from '../data/survivalConfig';

const STORAGE_KEY = 'rpg_survival';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const DEFAULT_STATE = {
    ...INITIAL_VITALS,
    isFlowing: false,
    speed: 1,
};

const loadSurvivalState = () => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) return DEFAULT_STATE;

        const parsed = JSON.parse(saved);

        return {
            health: clamp(Number(parsed.health ?? INITIAL_VITALS.health), 0, MAX_HEALTH),
            water: clamp(Number(parsed.water ?? INITIAL_VITALS.water), 0, MAX_WATER),
            calories: clamp(Number(parsed.calories ?? INITIAL_VITALS.calories), 0, MAX_CALORIES),
            isFlowing: Boolean(parsed.isFlowing),
            speed: SPEED_OPTIONS.includes(parsed.speed) ? parsed.speed : 1,
        };
    } catch {
        return DEFAULT_STATE;
    }
};

export default function useSurvival() {
    const [survival, setSurvival] = useState(loadSurvivalState);

    // Persist vitals and time settings
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(survival));
    }, [survival]);

    // Time flow: drain needs, then apply summed starvation damage
    useEffect(() => {
        if (!survival.isFlowing) return undefined;

        const intervalId = setInterval(() => {
            setSurvival((previous) => {
                const water = clamp(previous.water - WATER_DRAIN_PER_SECOND * previous.speed, 0, MAX_WATER);
                const calories = clamp(previous.calories - CALORIES_DRAIN_PER_SECOND * previous.speed, 0, MAX_CALORIES);

                const needsMet = water > 0 && calories > 0;
                let health = previous.health;

                if (needsMet) {
                    // Slow regeneration while fed and hydrated
                    health = clamp(health + HEALTH_REGEN_PER_SECOND * previous.speed, 0, MAX_HEALTH);
                } else {
                    // Summed damage from thirst and hunger
                    let damagePerSecond = 0;
                    if (water <= 0) damagePerSecond += THIRST_DAMAGE_PER_SECOND;
                    if (calories <= 0) damagePerSecond += HUNGER_DAMAGE_PER_SECOND;

                    health = clamp(health - damagePerSecond * previous.speed, 0, MAX_HEALTH);
                }

                return { ...previous, water, calories, health };
            });
        }, 1000);

        return () => clearInterval(intervalId);
    }, [survival.isFlowing, survival.speed]);

    const toggleFlowing = () => {
        setSurvival((previous) => ({ ...previous, isFlowing: !previous.isFlowing }));
    };

    const setSpeed = (speed) => {
        if (!SPEED_OPTIONS.includes(speed)) return;
        setSurvival((previous) => ({ ...previous, speed }));
    };

    const reduceWater = (amount) => {
        setSurvival((previous) => ({
            ...previous,
            water: clamp(previous.water - amount, 0, MAX_WATER),
        }));
    };

    const reduceCalories = (amount) => {
        setSurvival((previous) => ({
            ...previous,
            calories: clamp(previous.calories - amount, 0, MAX_CALORIES),
        }));
    };

    const addWater = (amount) => {
        setSurvival((previous) => ({
            ...previous,
            water: clamp(previous.water + amount, 0, MAX_WATER),
        }));
    };

    const addCalories = (amount) => {
        setSurvival((previous) => ({
            ...previous,
            calories: clamp(previous.calories + amount, 0, MAX_CALORIES),
        }));
    };

    // Restore needs from a consumed item (food -> calories, drink -> water)
    const consume = (item) => {
        const amount = Number(item?.value);
        if (!item || !Number.isFinite(amount) || amount <= 0) return;

        if (item.type === 'food') addCalories(amount);
        if (item.type === 'drink') addWater(amount);
    };

    return {
        ...survival,
        maxHealth: MAX_HEALTH,
        maxWater: MAX_WATER,
        maxCalories: MAX_CALORIES,
        toggleFlowing,
        setSpeed,
        reduceWater,
        reduceCalories,
        consume,
    };
}
