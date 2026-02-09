import React, { useState } from 'react';
import { Box, Tabs, Tab, Fade } from '@mui/material';
import AboutTab from '../tabs/AboutTab';
// Import other tabs as you create them
// import CoursesTab from '../tabs/CoursesTab';
// import LeaderboardTab from '../tabs/LeaderboardTab';

const MainDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box>
      {/* Navigation Tabs for the Dashboard */}
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        centered
        sx={{ mb: 3 }}
      >
        <Tab label="ABOUT" sx={{ fontWeight: 700 }} />
        <Tab label="COURSES" sx={{ fontWeight: 700 }} />
        <Tab label="ARENA" sx={{ fontWeight: 700 }} />
      </Tabs>

      {/* Tab Content Rendering */}
      <Fade in timeout={500}>
        <Box>
          {activeTab === 0 && <AboutTab />}
          {activeTab === 1 && <Box>Courses Content Coming Soon...</Box>}
          {activeTab === 2 && (
            <Box>Arena/Leaderboard Content Coming Soon...</Box>
          )}
        </Box>
      </Fade>
    </Box>
  );
};

export default MainDashboard;
