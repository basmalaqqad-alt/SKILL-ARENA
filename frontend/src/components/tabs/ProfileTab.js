import React from 'react';

const ProfileTab = () => {
  return (
    <div className="space-y-10 animate-fade-in text-left">
      {/* 1. Achievements Section (Badges & XP) */}
      <section>
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100 pb-2 mb-4">
          Achievements
        </h3>
        <div className="flex gap-4 items-center">
          {/* Circular XP Badge */}
          <div className="w-16 h-16 bg-[#FACA07] rounded-full flex items-center justify-center border-4 border-white shadow-lg">
            <span className="font-black text-[#8A2D2E] text-sm italic">XP</span>
          </div>

          {/* Badge 5 - Standard Rectangle Style from Figma */}
          <div className="w-14 h-18 bg-[#8A2D2E] rounded-md flex flex-col items-center justify-center p-2 shadow-md border-b-4 border-black/20">
            <span className="text-[8px] text-white font-bold uppercase">
              Badge
            </span>
            <span className="text-xl text-[#FACA07] font-black">5</span>
          </div>
        </div>
        <p className="text-xs font-black text-[#8A2D2E] mt-4 italic">
          You have 5 xp
        </p>
      </section>

      {/* 2. In Progress Courses Section */}
      <section>
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100 pb-2 mb-6">
          In Progress Courses
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm">
            <div className="aspect-square bg-gray-50 flex items-center justify-center">
              <span className="text-3xl">🖼️</span>
            </div>
            <div className="p-3 border-t border-gray-100 text-center">
              <h4 className="font-black text-[9px] text-[#8A2D2E] uppercase">
                UI/UX Design Hero
              </h4>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Completed Courses Section */}
      <section>
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100 pb-2 mb-4">
          Completed Courses
        </h3>
        <div className="h-24 border-2 border-dashed border-gray-100 rounded-2xl flex items-center justify-center bg-gray-50/30">
          <p className="text-[10px] font-bold text-gray-300 uppercase italic tracking-widest">
            No completed missions yet
          </p>
        </div>
      </section>
    </div>
  );
};

export default ProfileTab;
