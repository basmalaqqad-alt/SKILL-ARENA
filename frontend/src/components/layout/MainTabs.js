import React from 'react';

const MainTabs = ({ activeTab, setActiveTab }) => {
  const tabs = ['ABOUT', 'COURSES', 'LEADERBOARD'];

  return (
    <div className="flex bg-[#FACA07] rounded-xl overflow-hidden shadow-md">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`flex-1 py-3 font-black text-sm transition-all ${
            activeTab === tab
              ? 'bg-[#8A2D2E] text-white'
              : 'text-[#8A2D2E] hover:bg-[#fbd642]'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

export default MainTabs;
