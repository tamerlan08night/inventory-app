import React from 'react';
import InventoryWorkspace from './InventoryWorkspace';
import TabView from './TabView';

export default function ContentView({ activeTab, onNavigate, inventoryState, survival }) {
    if (activeTab === 'inventory') {
        return <InventoryWorkspace {...inventoryState} survival={survival} />;
    }

    return <TabView activeTab={activeTab} onNavigate={onNavigate} />;
}
