import React from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import AboutTab from '../tabs/AboutTab';
import CoursesTab from '../tabs/CoursesTab';
import LeaderboardTab from '../tabs/LeaderboardTab';
import ProfileTab from '../tabs/ProfileTab';

const MainDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto pt-6 px-4">
      {/* 1. Header with Brand and Profile Icon */}
      <div className="flex justify-between items-center mb-8 px-2">
        <div className="w-10"></div> {/* Spacer */}
        <h1 className="text-3xl font-black italic text-[#8A2D2E] tracking-tighter">
          SKILL<span className="text-[#FACA07]">ARENA</span>
        </h1>
        {/* Profile Avatar - Links to Profile Route */}
        <button
          onClick={() => navigate('profile')}
          className="w-12 h-12 rounded-xl flex items-center justify-center border-2 border-gray-100 bg-white text-gray-400 shadow-sm hover:border-[#8A2D2E] transition-all"
        >
          <span className="text-xl">👤</span>
        </button>
      </div>

      {/* 2. Navigation Tabs using NavLink for Browser History Support */}
      <div className="flex bg-[#FACA07] rounded-xl overflow-hidden shadow-md mb-6 p-1 gap-1">
        {[
          { name: 'ABOUT', path: 'about' },
          { name: 'COURSES', path: 'courses' },
          { name: 'LEADERBOARD', path: 'leaderboard' },
        ].map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) =>
              `flex-1 py-3 text-center font-black text-xs tracking-widest transition-all rounded-lg ${
                isActive
                  ? 'bg-[#8A2D2E] text-white shadow-lg'
                  : 'text-[#8A2D2E] hover:bg-white/20'
              }`
            }
          >
            {tab.name}
          </NavLink>
        ))}
      </div>

      {/* 3. Sub-Routes Content Area */}
      <div className="bg-white/70 backdrop-blur-md rounded-2xl p-8 border border-white shadow-xl min-h-[500px]">
        <Routes>
          {/* Default dashboard path redirects or shows About */}
          <Route path="/" element={<AboutTab />} />
          <Route path="about" element={<AboutTab />} />
          <Route path="courses" element={<CoursesTab />} />
          <Route path="leaderboard" element={<LeaderboardTab />} />
          <Route path="profile" element={<ProfileTab />} />
        </Routes>
      </div>
    </div>
  );
};

export default MainDashboard;
