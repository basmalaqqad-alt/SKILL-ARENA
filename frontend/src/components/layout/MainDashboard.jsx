import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tabs,
  Tab,
} from '@mui/material';
import { BookOpen, Trophy, User, Sparkles, BrainCircuit, MapPin, GraduationCap } from 'lucide-react';

import AboutTab from '../tabs/AboutTab';
import CoursesTab from '../tabs/CoursesTab';
import MyCoursesTab from '../tabs/MyCoursesTab';
import LeaderboardTab from '../tabs/LeaderboardTab';
import ProfileTab from '../tabs/ProfileTab';
import AITab from '../tabs/AITab';

const LEARNER_COLORS = {
  cream: '#F8F4DF',
  maroon: '#9A2F2E',
  maroonLight: 'rgba(154, 47, 46, 0.08)',
};

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
      id: 0, 
      label: 'LEARN', 
      shortLabel: 'LEARN',
      icon: BookOpen, 
      subtitle: 'Explore and master new skills',
      component: <AboutTab />,
    },
    { 
      id: 1, 
      label: 'AI INSIGHTS', 
      shortLabel: 'AI',
      icon: BrainCircuit, 
      subtitle: 'AI-driven personalized recommendations',
      component: <AITab userName={profileData?.username || localStorage.getItem('username') || "HERO"} />,
    },
    { 
      id: 2, 
      label: 'COURSES', 
      shortLabel: 'COURSES',
      icon: Sparkles, 
      subtitle: 'Browse and enroll in courses',
      component: <CoursesTab />,
    },
    { 
      id: 5, 
      label: 'MY COURSES', 
      shortLabel: 'MY COURSES',
      icon: GraduationCap, 
      subtitle: 'Your enrolled courses and progress',
      component: <MyCoursesTab />,
    },
    { 
      id: 3, 
      label: 'LEADERBOARDS', 
      shortLabel: 'RANK',
      icon: Trophy, 
      subtitle: 'See where you stand among heroes',
      component: <LeaderboardTab />,
    },
    { 
      id: 4, 
      label: 'PROFILE', 
      shortLabel: 'PROFILE',
      icon: User, 
      subtitle: 'Your progress and achievements',
      component: <ProfileTab 
        userName={profileData?.username || localStorage.getItem('username') || "HERO"} 
        userXP={profileData?.experience ?? 0}
        stats={profileData}
        rank_name={profileData?.rank_name || "WARRIOR"}
        progress_percentage={profileData?.progress_percentage ?? 0}
        inProgressCourses={profileData?.in_progress_courses ?? []}
        completedCourses={profileData?.completed_courses ?? []}
      />,
    },
  ];

  const currentItem = menuItems.find(item => item.id === activeTab) || menuItems[0];

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: 'calc(100vh - 64px)',
        bgcolor: LEARNER_COLORS.cream,
      }}
    >
      {/* Sidebar */}
      <Box
        sx={{
          width: 260,
          borderRight: `2px solid ${LEARNER_COLORS.maroonLight}`,
          pr: 2,
          py: 2,
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          bgcolor: LEARNER_COLORS.cream,
        }}
      >
        <Box sx={{ px: 2, mb: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img
            src="/logo.png"
            alt="SkillArena Logo"
            style={{
              maxWidth: '180px',
              height: 'auto',
              marginBottom: '8px',
              filter: 'drop-shadow(1px 1px 0 #9A2F2E)',
            }}
          />
          <Typography
            variant="subtitle2"
            sx={{
              color: LEARNER_COLORS.maroon,
              fontWeight: 800,
              letterSpacing: 1,
              fontSize: '0.75rem',
            }}
          >
            HERO ARENA - LEARNER
          </Typography>
        </Box>

        <List sx={{ px: 1 }}>
          {menuItems.map((it) => {
            const Icon = it.icon;
            const isActive = activeTab === it.id;
            return (
              <ListItemButton
                key={it.id}
                selected={isActive}
                onClick={() => setActiveTab(it.id)}
                sx={{
                  borderRadius: 3,
                  py: 1.5,
                  mb: 1,
                  bgcolor: isActive ? LEARNER_COLORS.maroon : 'transparent',
                  color: isActive ? '#fff' : LEARNER_COLORS.maroon,
                  '&:hover': {
                    bgcolor: isActive ? LEARNER_COLORS.maroon : LEARNER_COLORS.maroonLight,
                  },
                  '&.Mui-selected': {
                    bgcolor: LEARNER_COLORS.maroon,
                    color: '#fff',
                    '& .MuiListItemIcon-root': { color: '#fff' },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: isActive ? '#fff' : LEARNER_COLORS.maroon,
                  }}
                >
                  <Icon size={20} />
                </ListItemIcon>
                <ListItemText
                  primary={it.label}
                  primaryTypographyProps={{
                    fontWeight: 700,
                    fontSize: '0.85rem',
                  }}
                />
              </ListItemButton>
            );
          })}
        </List>
      </Box>

      {/* Main content */}
      <Box
        sx={{
          flexGrow: 1,
          px: { xs: 2, md: 4 },
          py: 3,
          bgcolor: LEARNER_COLORS.cream,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 3 }}>
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 900,
                color: LEARNER_COLORS.maroon,
                mb: 0.5,
                fontSize: { xs: '1.5rem', md: '1.75rem' },
              }}
            >
              {currentItem.label}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ color: LEARNER_COLORS.maroon, fontWeight: 600 }}>
                {currentItem.subtitle}
              </Typography>
              <MapPin size={16} color="#2563eb" />
            </Box>
          </Box>
          <Typography variant="caption" sx={{ color: '#374151', fontWeight: 500 }}>
            Hero: {localStorage.getItem('username') || 'learner'} | Mode: LEARNER
          </Typography>
        </Box>

        {/* Mobile tabs */}
        <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 2 }}>
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': { fontWeight: 700, fontSize: '0.75rem' },
              '& .Mui-selected': { color: LEARNER_COLORS.maroon },
              '& .MuiTabs-indicator': { bgcolor: LEARNER_COLORS.maroon },
            }}
          >
            {menuItems.map((it) => (
              <Tab key={it.id} label={it.shortLabel} />
            ))}
          </Tabs>
        </Box>

        <Box sx={{ mt: 2 }}>
          {currentItem.component}
        </Box>
      </Box>
    </Box>
  );
};

export default MainDashboard;