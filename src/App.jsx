import React, { useState } from 'react';
import NavBar from './components/NavBar';
import ContentView from './components/ContentView';
import useInventory from './hooks/useInventory';
import useSurvival from './hooks/useSurvival';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('inventory');
  const survival = useSurvival();
  const inventoryState = useInventory({ onConsume: survival.consume });

  return (
    <div className="game-container">
      <NavBar activeTab={activeTab} onChange={setActiveTab} />
      <ContentView
        activeTab={activeTab}
        onNavigate={setActiveTab}
        inventoryState={inventoryState}
        survival={survival}
      />
    </div>
  );
}
