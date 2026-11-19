import React from 'react';
import { TABS } from '../data/tabs';
import ResearchTab from './tabs/ResearchTab';
import ManualTab from './tabs/ManualTab';
import StatisticsTab from './tabs/StatisticsTab';
import AchievementsTab from './tabs/AchievementsTab';
import MapTab from './tabs/MapTab';
import SkillsTab from './tabs/SkillsTab';

const TAB_COMPONENTS = {
    research: ResearchTab,
    manual: ManualTab,
    statistics: StatisticsTab,
    achievements: AchievementsTab,
    map: MapTab,
    skills: SkillsTab,
};

export default function TabView({ activeTab, onNavigate }) {
    const ActiveTabComponent = TAB_COMPONENTS[activeTab];
    const activeTabLabel = TABS.find((tab) => tab.id === activeTab)?.label ?? activeTab;

    return (
        <div className="panel sub-view-container">
            <h2>{activeTabLabel.toUpperCase()}</h2>

            <div className="sub-view-content">
                {ActiveTabComponent && <ActiveTabComponent />}
            </div>

            <button className="nav-btn" style={{ marginTop: '20px' }} onClick={() => onNavigate('inventory')}>
                ← Back to Inventory
            </button>
        </div>
    );
}
