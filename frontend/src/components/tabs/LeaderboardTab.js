import React from 'react';

const LeaderboardTab = () => {
  return (
    <div className="py-8 text-center animate-fade-in">
      <div className="flex justify-center items-end gap-4 mb-10">
        {/* Silver Medal (User 2) */}
        <div className="flex flex-col items-center">
          <span className="font-bold text-gray-500 mb-2">USER2</span>
          <div className="w-20 h-20 bg-gray-300 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-3xl">
            🥈
          </div>
        </div>

        {/* Gold Medal (User 1) - Positioned higher */}
        <div className="flex flex-col items-center">
          <span className="font-black text-[#8A2D2E] mb-2">USER1</span>
          <div className="w-28 h-28 bg-[#FACA07] rounded-full border-4 border-white shadow-2xl flex items-center justify-center text-5xl animate-bounce-slow">
            🥇
          </div>
        </div>

        {/* Bronze Medal (User 3) */}
        <div className="flex flex-col items-center">
          <span className="font-bold text-gray-400 mb-2">USER3</span>
          <div className="w-20 h-20 bg-[#CD7F32]/50 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-3xl">
            🥉
          </div>
        </div>
      </div>

      <p className="text-xs font-bold text-gray-500 italic mt-6">
        Users who earn highest points will be shown on leaderboard weekly
      </p>
    </div>
  );
};

export default LeaderboardTab;
