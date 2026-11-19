import { useEffect, useState } from 'react';
import { playerStats } from '../data/playerStats';

const STORAGE_KEYS = {
    inventory: 'rpg_inventory',
    hotbar: 'rpg_hotbar',
    equipment: 'rpg_equipment',
};

// Slots available without a backpack; a backpack adds its own slots on top
const BASE_INVENTORY_SIZE = 40;
const HOTBAR_SIZE = 10;
const HOTBAR_ALLOWED_TYPES = ['tool', 'weapon', 'food', 'drink'];

const DEFAULT_EQUIPMENT = {
    helmet: null,
    chest: null,
    gloves: null,
    pants: null,
    boots: null,
    module1: null,
    module2: null,
    module3: null,
    backpack: null,
    special: null,
};

const SLOT_GROUP_MAP = {
    helmet: ['helmet'],
    chest: ['chest'],
    gloves: ['gloves'],
    pants: ['pants'],
    boots: ['boots'],
    module1: ['module'],
    module2: ['module'],
    module3: ['module'],
    backpack: ['backpack'],
    special: ['special'],
};

// Consumables, tools and weapons stack; gear slots hold unique items
const STACKABLE_TYPES = ['food', 'drink', 'tool', 'weapon'];

const getItemSignature = (item) =>
    [
        item.type,
        item.name.trim().toLowerCase(),
        item.weight,
        item.value ?? 0,
        item.defense ?? 0,
        item.damage ?? 0,
        (item.effects ?? '').trim().toLowerCase(),
    ].join('|');

const toBonusSlots = (backpack) =>
    Math.max(0, Math.floor(Number(backpack?.slots) || 0));

const toBonusCapacity = (backpack) =>
    Math.max(0, Number(backpack?.capacity) || 0);

const loadState = (key, fallback) => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
};

// Move items that fall outside the allowed slot range into free slots.
// When there is not enough room, the list is returned untouched so no item is lost.
const compactInventory = (list, size) => {
    const compacted = list.slice(0, size);
    const overflow = list.slice(size).filter(Boolean);
    if (overflow.length === 0) return compacted;

    for (const item of overflow) {
        const freeIndex = compacted.findIndex((slot) => slot === null);
        if (freeIndex === -1) return list;
        compacted[freeIndex] = item;
    }

    return compacted;
};

// Grow or shrink the inventory array to match the slot limit
const resizeInventory = (list, size) => {
    if (list.length === size) return list;
    if (list.length < size) return [...list, ...Array(size - list.length).fill(null)];
    return compactInventory(list, size);
};

const getTotalSlots = (equipment) => BASE_INVENTORY_SIZE + toBonusSlots(equipment?.backpack);

export default function useInventory({ onConsume } = {}) {
    const [inventory, setInventory] = useState(() => {
        const savedInventory = loadState(STORAGE_KEYS.inventory, Array(BASE_INVENTORY_SIZE).fill(null));
        const savedEquipment = loadState(STORAGE_KEYS.equipment, DEFAULT_EQUIPMENT);
        return resizeInventory(savedInventory, getTotalSlots(savedEquipment));
    });

    const [hotbar, setHotbar] = useState(() =>
        loadState(STORAGE_KEYS.hotbar, Array(HOTBAR_SIZE).fill(null)),
    );

    const [equipment, setEquipment] = useState(() =>
        loadState(STORAGE_KEYS.equipment, { ...DEFAULT_EQUIPMENT }),
    );

    // Backpack bonuses: extra slots and extra carry capacity
    const bonusSlots = toBonusSlots(equipment.backpack);
    const bonusCapacity = toBonusCapacity(equipment.backpack);
    const totalSlots = BASE_INVENTORY_SIZE + bonusSlots;
    const maxWeight = playerStats.maxWeight + bonusCapacity;

    // Automatically persist data to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.inventory, JSON.stringify(inventory));
    }, [inventory]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.hotbar, JSON.stringify(hotbar));
    }, [hotbar]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.equipment, JSON.stringify(equipment));
    }, [equipment]);

    // Total weight calculation
    const currentWeight = [...inventory, ...hotbar, ...Object.values(equipment)]
        .reduce((acc, item) => acc + (item ? item.weight * (item.count || 1) : 0), 0)
        .toFixed(1);

    // First empty slot inside the allowed range (backpack slots included)
    const findFreeSlotIndex = (list = inventory) =>
        list.slice(0, totalSlots).findIndex((slot) => slot === null);

    // Items stored in slots that a smaller backpack would remove
    const countOverflowItems = (size) => inventory.slice(size).filter(Boolean).length;

    const hasRoomForOverflow = (size, extraItems = 0) => {
        const overflow = countOverflowItems(size);
        if (overflow === 0 && extraItems === 0) return true;
        const free = inventory.slice(0, size).filter((slot) => slot === null).length;
        return free >= overflow + extraItems;
    };

    const addItem = (newItem) => {
        // Merge into an existing identical stack first
        if (STACKABLE_TYPES.includes(newItem.type)) {
            const signature = getItemSignature(newItem);
            const stackIndex = inventory.slice(0, totalSlots).findIndex(
                (slot) => slot && STACKABLE_TYPES.includes(slot.type) && getItemSignature(slot) === signature,
            );

            if (stackIndex !== -1) {
                const updatedInventory = [...inventory];
                const existingItem = updatedInventory[stackIndex];
                updatedInventory[stackIndex] = {
                    ...existingItem,
                    count: (existingItem.count || 1) + (newItem.count || 1),
                };
                setInventory(updatedInventory);
                return true;
            }
        }

        const firstEmptyIndex = findFreeSlotIndex();
        if (firstEmptyIndex === -1) {
            alert('Inventory is full!');
            return false;
        }
        const updatedInventory = [...inventory];
        updatedInventory[firstEmptyIndex] = newItem;
        setInventory(updatedInventory);
        return true;
    };

    const removeItem = (indexToRemove) => {
        const updatedInventory = [...inventory];
        updatedInventory[indexToRemove] = null;
        setInventory(updatedInventory);
    };

    const moveItem = (fromIndex, toIndex) => {
        const updatedInventory = [...inventory];
        const movedItem = updatedInventory[fromIndex];
        updatedInventory[fromIndex] = updatedInventory[toIndex];
        updatedInventory[toIndex] = movedItem;
        setInventory(updatedInventory);
    };

    const equipItem = (inventoryIndex, targetSlotType) => {
        const item = inventory[inventoryIndex];
        if (!item) return;

        const allowedTypes = SLOT_GROUP_MAP[targetSlotType] || [];
        if (!allowedTypes.includes(item.type)) {
            alert(`This item (${item.type}) cannot be placed in this slot!`);
            return;
        }

        // A smaller backpack would take slots away, so make sure its items still fit
        if (targetSlotType === 'backpack') {
            const nextSize = BASE_INVENTORY_SIZE + toBonusSlots(item);
            if (!hasRoomForOverflow(nextSize)) {
                alert('Not enough free slots to swap for a smaller backpack!');
                return;
            }
        }

        const updatedInventory = [...inventory];
        const previousEquipped = equipment[targetSlotType];

        updatedInventory[inventoryIndex] = previousEquipped;

        const nextEquipment = { ...equipment, [targetSlotType]: item };
        // Swapping backpacks can add or remove inventory slots
        setInventory(resizeInventory(updatedInventory, getTotalSlots(nextEquipment)));
        setEquipment(nextEquipment);
    };

    const unequipItem = (slotType) => {
        const itemToUnequip = equipment[slotType];
        if (!itemToUnequip) return;

        // Removing a backpack drops the slot limit back to the base size
        const nextEquipment = { ...equipment, [slotType]: null };
        const nextSize = getTotalSlots(nextEquipment);

        if (slotType === 'backpack' && !hasRoomForOverflow(nextSize, 1)) {
            alert('Not enough free slots to remove this backpack!');
            return;
        }

        const firstEmptyIndex = findFreeSlotIndex();
        if (firstEmptyIndex === -1) {
            alert('No space in inventory to unequip item!');
            return;
        }

        const updatedInventory = [...inventory];
        updatedInventory[firstEmptyIndex] = itemToUnequip;

        setInventory(resizeInventory(updatedInventory, nextSize));
        setEquipment(nextEquipment);
    };

    const dropToHotbar = (inventoryIndex, hotbarIndex) => {
        const item = inventory[inventoryIndex];
        if (!item) return;

        if (!HOTBAR_ALLOWED_TYPES.includes(item.type)) {
            alert('Only tools, food, or drinks can be placed in the hotbar!');
            return;
        }

        const updatedInventory = [...inventory];
        const previousHotbarItem = hotbar[hotbarIndex];

        updatedInventory[inventoryIndex] = previousHotbarItem;
        setInventory(updatedInventory);

        const updatedHotbar = [...hotbar];
        updatedHotbar[hotbarIndex] = item;
        setHotbar(updatedHotbar);
    };

    const removeFromHotbar = (hotbarIndex) => {
        const item = hotbar[hotbarIndex];
        if (!item) return;

        const firstEmptyIndex = findFreeSlotIndex();
        if (firstEmptyIndex === -1) {
            alert('No space in inventory!');
            return;
        }

        const updatedInventory = [...inventory];
        updatedInventory[firstEmptyIndex] = item;
        setInventory(updatedInventory);

        const updatedHotbar = [...hotbar];
        updatedHotbar[hotbarIndex] = null;
        setHotbar(updatedHotbar);
    };

    const isConsumable = (item) => Boolean(item) && (item.type === 'food' || item.type === 'drink');

    const consumeItem = (inventoryIndex) => {
        const item = inventory[inventoryIndex];
        if (!isConsumable(item)) return false;

        const count = item.count || 1;
        const updatedInventory = [...inventory];
        updatedInventory[inventoryIndex] = count > 1 ? { ...item, count: count - 1 } : null;
        setInventory(updatedInventory);

        onConsume?.(item);
        return true;
    };

    const consumeHotbarItem = (hotbarIndex) => {
        const item = hotbar[hotbarIndex];
        if (!isConsumable(item)) return false;

        const count = item.count || 1;
        const updatedHotbar = [...hotbar];
        updatedHotbar[hotbarIndex] = count > 1 ? { ...item, count: count - 1 } : null;
        setHotbar(updatedHotbar);

        onConsume?.(item);
        return true;
    };

    return {
        inventory,
        hotbar,
        equipment,
        currentWeight,
        maxWeight,
        totalSlots,
        bonusSlots,
        bonusCapacity,
        addItem,
        removeItem,
        moveItem,
        equipItem,
        unequipItem,
        dropToHotbar,
        removeFromHotbar,
        consumeItem,
        consumeHotbarItem,
    };
}
