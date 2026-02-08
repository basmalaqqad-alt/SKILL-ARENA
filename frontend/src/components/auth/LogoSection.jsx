import React from 'react';

const LogoSection = () => {
  return (
    <div className="flex flex-col items-center justify-center py-4">
      {/* Modern Typography Logo */}
      <h1 className="text-4xl font-black tracking-tighter text-[#8A2D2E]">
        SKILL<span className="text-[#FACA07]">ARENA</span>
      </h1>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] mt-1">
        Play • Learn • Earn
      </p>
    </div>
  );
};

export default LogoSection;
