import React from 'react';

const BadgesSection = () => {
  return (
    <div className="grid grid-cols-4 gap-4 py-4">
      {/* Example Badge */}
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 bg-[#FACA07] rounded-full flex items-center justify-center shadow-lg border-4 border-white">
          <span className="text-white font-black">XP</span>
        </div>
        <span className="text-[10px] mt-2 font-bold text-gray-500">
          Starter
        </span>
      </div>
    </div>
  );
};

export default BadgesSection;
