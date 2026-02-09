import React from 'react';

const Header = () => {
  return (
    <div className="flex items-center justify-between p-4 bg-white/50 backdrop-blur-md border-b border-gray-100">
      {/* User Profile Avatar - Leading side */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#FACA07] flex items-center justify-center border-2 border-white shadow-sm overflow-hidden">
          {/* Placeholder for Hero Avatar */}
          <svg
            className="w-6 h-6 text-[#8A2D2E]"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      {/* Modern Search Bar - Center */}
      <div className="relative w-1/2">
        <input
          type="text"
          placeholder="what do you want to learn today?"
          className="w-full py-2 px-4 rounded-full bg-white border border-gray-200 text-sm focus:outline-none focus:ring-2 ring-[#FACA07]/50 shadow-inner italic"
        />
      </div>

      {/* Invisible spacer for balance */}
      <div className="w-10"></div>
    </div>
  );
};

export default Header;
