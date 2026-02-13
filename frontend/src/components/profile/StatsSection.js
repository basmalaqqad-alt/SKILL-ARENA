import React from 'react';

const StatsSection = ({ stats, username, rank_name, progress_percentage, experience }) => {
  const actualXP = experience || 0;
  const actualLevel = stats?.level || 0;
  const actualQuests = stats?.quests_completed || 0;
  
  return (
    <div style={{ textAlign: 'left', padding: '10px' }}>
      <h1 style={{ color: '#FFFFFF', fontSize: '2.5rem', fontWeight: 900, margin: 0, textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
        {username || "HERO"}
      </h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '10px' }}>
        <span style={{ backgroundColor: '#FACA07', color: '#000000', padding: '4px 12px', borderRadius: '20px', fontWeight: 'bold' }}>
          {rank_name || (actualXP === 0 ? "BEGINNER" : "WARRIOR")}
        </span>
        <div style={{ flexGrow: 1, maxWidth: '200px' }}>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '10px', margin: '0 0 5px 0' }}>
            XP: {actualXP} | Level: {actualLevel} | Quests: {actualQuests}
          </p>
          <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '10px' }}>
            <div style={{ width: `${progress_percentage || 0}%`, height: '100%', backgroundColor: '#FACA07', borderRadius: '10px' }} />
          </div>
        </div>
      </div>
    </div>
  );
};
export default StatsSection;