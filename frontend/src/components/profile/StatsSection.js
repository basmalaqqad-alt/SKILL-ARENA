import React from 'react';

const StatsSection = () => {
  return (
    <div className="p-4">
      <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-200 pb-2 mb-6">
        In Progress Courses
      </h3>

      {/* Course Progress Card */}
      <div className="w-40 bg-white p-2 rounded-lg border border-gray-100 shadow-sm">
        <div className="aspect-square bg-gray-50 mb-2 flex items-center justify-center text-gray-200">
          <svg
            className="w-10 h-10"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.587-1.587a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="border-t border-gray-100 pt-2">
          <h4 className="font-bold text-[10px] text-center">
            UI/UX DESIGN HERO
          </h4>
        </div>
      </div>
    </div>
  );
};

export default StatsSection;
