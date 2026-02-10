import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Fade,
} from '@mui/material';
import { BookOpen, Trophy, User, Sparkles, BrainCircuit } from 'lucide-react';

import AboutTab from '../tabs/AboutTab';
import CoursesTab from '../tabs/CoursesTab';
import LeaderboardTab from '../tabs/LeaderboardTab';
import ProfileTab from '../tabs/ProfileTab';
import AITab from '../tabs/AITab';

const MainDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [profileData, setProfileData] = useState(null);

  // --- الربط الحقيقي مع الباك إند حق مروحة (تم وضعه داخل المكون صح) ---
  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        const token = localStorage.getItem('token');
        // التأكد من أن السيرفر شغال عندك على بورت 8000
        const response = await axios.get('http://127.0.0.1:8000/api/accounts/profile/', {
          headers: { 'Authorization': `Token ${token}` }
        });
        setProfileData(response.data); 
      } catch (err) {
        console.error("خطأ في الاتصال بالسيرفر، سيتم عرض البيانات الافتراضية", err);
      }
    };
    fetchHeroData();
  }, []);

  const menuItems = [
    {
      label: 'LEARN',
      icon: <BookOpen size={24} />,
      component: <AboutTab />,
    },
    {
      label: 'AI INSIGHTS',
      icon: <BrainCircuit size={24} />,
      component: <AITab userName={profileData?.username || "عسومة البطلة"} />,
    },
    {
      label: 'COURSES',
      icon: <Sparkles size={24} />,
      component: <CoursesTab />,
    },
    {
      label: 'LEADERBOARDS',
      icon: <Trophy size={24} />,
      component: <LeaderboardTab />,
    },
    {
      label: 'PROFILE',
      icon: <User size={24} />,
      component: <ProfileTab 
        userName={profileData?.username || "عسومة البطلة"} 
        userXP={profileData?.experience || 1250}
        stats={profileData}
        rank_name={profileData?.rank_name || "WARRIOR"}
        progress_percentage={profileData?.progress_percentage || 0}
      />,
    },
  ];

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '80vh',
        gap: 4,
        px: { xs: 2, md: 8, lg: 3 },
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* السايد بار - تصميم بسومة الأصلي */}
      <Box
        sx={{
          width: 240,
          borderRight: '2px solid rgba(138, 45, 46, 0.1)',
          pr: 2,
          display: { xs: 'none', md: 'block' },
        }}
      >
        <Box sx={{ p: 2, mb: 3, mt: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img src="/logo.png" alt="SkillArena Logo" style={{ maxWidth: '200px', height: 'auto', marginBottom: '12px' }} />
          <Typography variant="h6" sx={{ fontWeight: 900, color: 'primary.main', fontSize: '1rem', textAlign: 'center' }}>
            PLAY • LEARN • EARN
          </Typography>
        </Box>

        <List spacing={1}>
          {menuItems.map((item, index) => (
            <ListItem key={item.label} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => setActiveTab(index)}
                selected={activeTab === index}
                sx={{
                  borderRadius: 3,
                  py: 1.5,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'white',
                    '& .MuiListItemIcon-root': { color: 'white' },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 45, color: activeTab === index ? 'white' : 'primary.main' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 800, fontSize: '0.9rem' }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* منطقة المحتوى */}
      <Box sx={{ flexGrow: 1, pl: 4 }}>
        <Fade in key={activeTab} timeout={400}>
          <Box>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 900, color: 'primary.main' }}>
              {menuItems[activeTab].label}
            </Typography>
            {menuItems[activeTab].component}
          </Box>
        </Fade>
      </Box>
    </Box>
  );
};

export default MainDashboard;