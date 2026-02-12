import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Fade } from '@mui/material';
import { BookOpen, Trophy, User, Sparkles, BrainCircuit, GraduationCap, ClipboardList } from 'lucide-react';

import AboutTab from '../tabs/AboutTab';
import CoursesTab from '../tabs/CoursesTab';
import LeaderboardTab from '../tabs/LeaderboardTab';
import ProfileTab from '../tabs/ProfileTab';
import AITab from '../tabs/AITab';

const MainDashboard = ({ role }) => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(0);
  const [profileData, setProfileData] = useState(null);

  // إجبار النظام على قراءة الرابط أولاً
  const currentRole = useMemo(() => {
    const pathRole = location.pathname.includes('tutor') ? 'tutor' : location.pathname.includes('learner') ? 'learner' : null;
    const finalRole = pathRole || role || localStorage.getItem('role') || 'learner';
    
    console.log("DEBUG: Final Dashboard Role ->", finalRole);
    return finalRole;
  }, [location.pathname, role]);

  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://127.0.0.1:8000/api/accounts/profile/', {
          headers: { 'Authorization': `Token ${token}` }
        });
        setProfileData(response.data);
      } catch (err) { console.error("Profile fetch error", err); }
    };
    fetchHeroData();
  }, []);

  const menuItems = useMemo(() => {
    const common = [
      { label: 'PROFILE', icon: <User size={24} />, component: <ProfileTab userName={profileData?.username} stats={profileData} /> },
      { label: 'AI INSIGHTS', icon: <BrainCircuit size={24} />, component: <AITab userName={profileData?.username} /> },
    ];

    if (currentRole === 'tutor') {
      return [
        { label: 'SKILLS MANAGEMENT', icon: <ClipboardList size={24} />, component: <Typography variant="h4" sx={{ fontWeight: 900 }}>Manage Your Skills & Students 🛡️</Typography> },
        { label: 'MY STUDENTS', icon: <GraduationCap size={24} />, component: <Typography variant="h6" sx={{ p: 3 }}>Students Tracker</Typography> },
        ...common
      ];
    }
    return [
      { label: 'LEARN', icon: <BookOpen size={24} />, component: <AboutTab /> },
      { label: 'COURSES', icon: <Sparkles size={24} />, component: <CoursesTab /> },
      { label: 'LEADERBOARDS', icon: <Trophy size={24} />, component: <LeaderboardTab /> },
      ...common
    ];
  }, [currentRole, profileData]);

  useEffect(() => { setActiveTab(0); }, [currentRole]);

  return (
    <Box sx={{ display: 'flex', minHeight: '80vh', gap: 4, px: { xs: 2, md: 8, lg: 3 }, width: '100%' }}>
      <Box sx={{ width: 240, borderRight: '2px solid rgba(138, 45, 46, 0.1)', pr: 2 }}>
        <Box sx={{ p: 2, mb: 3, textAlign: 'center' }}>
          <img src="/logo.png" alt="Logo" style={{ maxWidth: '180px' }} />
          <Typography variant="h6" sx={{ fontWeight: 900, color: 'primary.main', fontSize: '0.8rem' }}>
             {currentRole === 'tutor' ? 'TUTOR ARENA • MASTER' : 'LEARNER QUEST • HERO'}
          </Typography>
        </Box>
        <List>
          {menuItems.map((item, index) => (
            <ListItem key={item.label} disablePadding sx={{ mb: 1 }}>
              <ListItemButton onClick={() => setActiveTab(index)} selected={activeTab === index} sx={{ borderRadius: 2 }}>
                <ListItemIcon sx={{ color: activeTab === index ? 'white' : 'primary.main' }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 800, fontSize: '0.8rem' }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
      <Box sx={{ flexGrow: 1, pl: 4 }}>
        <Fade in key={activeTab + currentRole} timeout={400}>
          <Box>
            <Typography variant="h4" sx={{ mb: 1, fontWeight: 900, color: 'primary.main' }}>{menuItems[activeTab]?.label}</Typography>
            {menuItems[activeTab]?.component}
          </Box>
        </Fade>
      </Box>
    </Box>
  );
};

export default MainDashboard;