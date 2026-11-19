import React from 'react';
import PlayerPanel from './PlayerPanel';
import InventoryGrid from './InventoryGrid';
import Hotbar from './Hotbar';

export default function InventoryWorkspace({
    survival,
    inventory,
    hotbar,
    equipment,
    currentWeight,
    maxWeight,
    addItem,
    removeItem,
    moveItem,
    equipItem,
    unequipItem,
    dropToHotbar,
    removeFromHotbar,
    consumeItem,
    consumeHotbarItem,
}) {
    return (
        <div className="main-workspace">
            <PlayerPanel
                stats={survival}
                equipment={equipment}
                onEquipItem={equipItem}
                onUnequipItem={unequipItem}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                <InventoryGrid
                    inventory={inventory}
                    maxWeight={maxWeight}
                    currentWeight={currentWeight}
                    onAddItem={addItem}
                    onRemoveItem={removeItem}
                    onMoveItem={moveItem}
                    onConsumeItem={consumeItem}
                />
                <Hotbar
                    hotbarItems={hotbar}
                    onDropToHotbar={dropToHotbar}
                    onRemoveFromHotbar={removeFromHotbar}
                    onConsumeFromHotbar={consumeHotbarItem}
                />
            </div>
        </div>
    );
}
