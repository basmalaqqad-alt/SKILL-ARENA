import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography, List, ListItemButton, ListItemIcon, ListItemText, Tabs, Tab, Stack, Chip } from '@mui/material';
import { BookOpen, Trophy, User, Sparkles, BrainCircuit, GraduationCap, Bot, Zap, ChevronRight, FlaskConical } from 'lucide-react';

import AboutTab       from '../tabs/AboutTab';
import CoursesTab     from '../tabs/CoursesTab';
import MyCoursesTab   from '../tabs/MyCoursesTab';
import LeaderboardTab from '../tabs/LeaderboardTab';
import ProfileTab     from '../tabs/ProfileTab';
import AITab          from '../tabs/AITab';
import PersonalAITutor from '../tabs/PersonalAITutor';
import SmartStudy from '../tabs/SmartStudy';

// ⭐ استيراد الشعار الجديد
import logoImg from '../../assets/logo.png';

const BRAND      = '#8A2D2E';
const BRAND_SOFT = 'rgba(138,45,46,0.07)';
const GOLD       = '#FACA07';
const SIDEBAR_W  = 220;

const MainDashboard = () => {
  const [activeTab, setActiveTab] = useState(4);
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    axios.get('http://127.0.0.1:8000/api/accounts/profile/', { headers: { Authorization: 'Token ' + token } })
      .then(res => {
        setProfileData(res.data);
        try {
          if (res.data.username) localStorage.setItem('username', res.data.username);
          if (res.data.role)     localStorage.setItem('role', res.data.role);
        } catch (_) {}
      }).catch(() => {});
  }, []);

  const userName = profileData?.username || localStorage.getItem('username') || 'Hero';

  const menuItems = [
    { id: 4, label: 'Profile',       short: 'Profile', icon: User,         sub: 'Your account',
      component: (
        <ProfileTab
          userName={userName}
          userXP={profileData?.experience ?? 0}
          stats={profileData}
          rank_name={profileData?.rank_name || 'Novice'}
          progress_percentage={profileData?.progress_percentage ?? 0}
          inProgressCourses={profileData?.in_progress_courses ?? []}
          completedCourses={profileData?.completed_courses ?? []}
        />
      )
    },
    { id: 0, label: 'Overview',      short: 'Home',    icon: BookOpen,     sub: 'Dashboard & XP sources',       component: <AboutTab /> },
    { id: 2, label: 'Courses',       short: 'Courses', icon: Sparkles,     sub: 'Browse and enroll',            component: <CoursesTab /> },
    { id: 5, label: 'My Learning',   short: 'Mine',    icon: GraduationCap,sub: 'Your progress',                component: <MyCoursesTab /> },
    { id: 6, label: 'AI Tutor',      short: 'AI Tutor',icon: Bot,          sub: 'Practice with AI', isAI: true, component: <PersonalAITutor userName={userName} /> },
    { id: 1, label: 'AI Insights',   short: 'Insights',icon: BrainCircuit, sub: 'Personalised recommendations', isAI: true, component: <AITab userName={userName} /> },
    { id: 7, label: 'Smart Study',   short: 'Study',   icon: FlaskConical, sub: 'AI document assistant', isAI: true, component: <SmartStudy /> },
    { id: 3, label: 'Leaderboard',   short: 'Ranks',   icon: Trophy,       sub: 'See where you stand',          component: <LeaderboardTab /> },
  ];

  const currentItem = menuItems.find(i => i.id === activeTab) || menuItems[0];

  return (
    <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 60px)', bgcolor: '#F4F2EF' }}>

      {/* ──────────── Sidebar ──────────── */}
      <Box
        sx={{
          width: SIDEBAR_W, flexShrink: 0,
          bgcolor: '#fff',
          borderRight: '1px solid rgba(0,0,0,0.07)',
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          pt: 2.5, pb: 4, px: 1.5,
          position: 'sticky', top: 60, height: 'calc(100vh - 60px)',
          overflowY: 'auto',
        }}
      >
        {/* XP pill */}
        {profileData && (
          <Box sx={{ mx: 0.5, mb: 3, px: 1.75, py: 1.25, borderRadius: '12px',
            bgcolor: '#FEFCE8', border: '1px solid rgba(250,202,7,0.3)' }}>
            <Stack direction="row" alignItems="center" spacing={0.75}>
              <Zap size={15} color="#C8970A" fill={GOLD} />
              <Box>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#9E9892', letterSpacing: '0.05em', lineHeight: 1 }}>
                  {profileData?.rank_name || 'Novice'}
                </Typography>
                <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#7A5800', lineHeight: 1.3, fontFamily: "'Syne', sans-serif" }}>
                  {profileData?.experience ?? 0} XP
                </Typography>
              </Box>
            </Stack>
          </Box>
        )}

        {/* Nav */}
        <Typography sx={{ px: 1.5, mb: 1, fontSize: '0.66rem', fontWeight: 700, letterSpacing: '0.12em', color: '#B5B0AB', textTransform: 'uppercase' }}>
          Navigation
        </Typography>
        <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {menuItems.map(it => {
            const Icon = it.icon;
            const active = activeTab === it.id;
            return (
              <ListItemButton key={it.id} onClick={() => setActiveTab(it.id)}
                sx={{
                  borderRadius: '10px', py: 1, px: 1.5, gap: 0,
                  bgcolor: active ? BRAND_SOFT : 'transparent',
                  color: active ? BRAND : '#44403C',
                  '&:hover': { bgcolor: active ? BRAND_SOFT : 'rgba(0,0,0,0.04)', color: active ? BRAND : '#1A1614' },
                  transition: 'all 0.15s',
                }}
              >
                <ListItemIcon sx={{ minWidth: 34, color: active ? BRAND : '#9E9892' }}>
                  <Icon size={17} />
                </ListItemIcon>
                <ListItemText
                  primary={it.label}
                  primaryTypographyProps={{ fontWeight: active ? 700 : 500, fontSize: '0.865rem', letterSpacing: '-0.01em' }}
                />
                {it.isAI && (
                  <Chip label="AI" size="small" sx={{ height: 17, fontSize: '0.58rem', fontWeight: 700, px: 0.25,
                    bgcolor: active ? BRAND : 'rgba(138,45,46,0.1)', color: active ? '#fff' : BRAND }} />
                )}
                {active && !it.isAI && <ChevronRight size={14} color={BRAND} style={{ flexShrink: 0 }} />}
              </ListItemButton>
            );
          })}
        </List>
      </Box>

      {/* ──────────── Main ──────────── */}
      <Box sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>

        {/* Page title bar */}
        <Box sx={{ bgcolor: '#fff', borderBottom: '1px solid rgba(0,0,0,0.07)', px: { xs: 2.5, md: 4 }, py: 1.25, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* ⭐ الشعار الجديد */}
          <img 
            src={logoImg} 
            alt="SkillArena Logo" 
            style={{ height: 32, objectFit: 'contain' }} 
          />

          <Stack direction="row" alignItems="center" gap={2}>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#1A1614', fontSize: '0.88rem' }}>{currentItem.label}</Typography>
              <Typography variant="caption" sx={{ color: '#9E9892' }}>{currentItem.sub}</Typography>
            </Box>
            <Typography sx={{ fontSize: '0.78rem', color: '#B5B0AB', fontWeight: 500 }}>{userName} · Learner</Typography>
          </Stack>
        </Box>

        {/* Mobile tabs */}
        <Box sx={{ display: { xs: 'block', md: 'none' }, bgcolor: '#fff', borderBottom: '1px solid rgba(0,0,0,0.07)', px: 1 }}>
          <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} variant="scrollable" scrollButtons="auto"
            sx={{ '& .MuiTab-root': { minWidth: 'auto', px: 1.5, py: 1.25, fontSize: '0.78rem' } }}>
            {menuItems.map(it => <Tab key={it.id} value={it.id} label={it.short} />)}
          </Tabs>
        </Box>

        {/* Content */}
        <Box sx={{ flexGrow: 1, px: { xs: 2, md: 4 }, py: { xs: 2.5, md: 3.5 }, className: 'fade-up' }}>
          {currentItem.component}
        </Box>
      </Box>
    </Box>
  );
};

export default MainDashboard;