import React, { useState } from 'react';
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
import { FileText, GraduationCap, User, BarChart2, MapPin } from 'lucide-react';
import SkillsManagement from './SkillsManagement';
import MyStudents from './MyStudents';
import TutorProfile from './TutorProfile';
import AIInsights from './AIInsights';

const TUTOR_COLORS = {
  cream: '#F8F4DF',
  maroon: '#9A2F2E',
  maroonLight: 'rgba(154, 47, 46, 0.08)',
};

const navItems = [
  { id: 0, label: 'SKILLS MANAGEMENT', shortLabel: 'SKILLS', icon: FileText, subtitle: 'Manage Your Skills & Students' },
  { id: 1, label: 'MY STUDENTS', shortLabel: 'STUDENTS', icon: GraduationCap, subtitle: "Track and manage your students' activity" },
  { id: 2, label: 'PROFILE', shortLabel: 'PROFILE', icon: User, subtitle: 'Your public profile and XP overview' },
  { id: 3, label: 'INSIGHTS', shortLabel: 'INSIGHTS', icon: BarChart2, subtitle: 'AI-driven analytics and recommendations' },
];

const TutorDashboard = () => {
  const [tab, setTab] = useState(0);
  const currentItem = navItems[tab];

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: 'calc(100vh - 64px)',
        bgcolor: TUTOR_COLORS.cream,
      }}
    >
      {/* Sidebar */}
      <Box
        sx={{
          width: 260,
          borderRight: `2px solid ${TUTOR_COLORS.maroonLight}`,
          pr: 2,
          py: 2,
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          bgcolor: TUTOR_COLORS.cream,
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
              color: TUTOR_COLORS.maroon,
              fontWeight: 800,
              letterSpacing: 1,
              fontSize: '0.75rem',
            }}
          >
            TUTOR ARENA - MASTER
          </Typography>
        </Box>

        <List sx={{ px: 1 }}>
          {navItems.map((it) => {
            const Icon = it.icon;
            const isActive = tab === it.id;
            return (
              <ListItemButton
                key={it.id}
                selected={isActive}
                onClick={() => setTab(it.id)}
                sx={{
                  borderRadius: 3,
                  py: 1.5,
                  mb: 1,
                  bgcolor: isActive ? TUTOR_COLORS.maroon : 'transparent',
                  color: isActive ? '#fff' : TUTOR_COLORS.maroon,
                  '&:hover': {
                    bgcolor: isActive ? TUTOR_COLORS.maroon : TUTOR_COLORS.maroonLight,
                  },
                  '&.Mui-selected': {
                    bgcolor: TUTOR_COLORS.maroon,
                    color: '#fff',
                    '& .MuiListItemIcon-root': { color: '#fff' },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: isActive ? '#fff' : TUTOR_COLORS.maroon,
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
          bgcolor: TUTOR_COLORS.cream,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 3 }}>
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 900,
                color: TUTOR_COLORS.maroon,
                mb: 0.5,
                fontSize: { xs: '1.5rem', md: '1.75rem' },
              }}
            >
              {currentItem.label}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ color: TUTOR_COLORS.maroon, fontWeight: 600 }}>
                {currentItem.subtitle}
              </Typography>
              <MapPin size={16} color="#2563eb" />
            </Box>
          </Box>
          <Typography variant="caption" sx={{ color: '#374151', fontWeight: 500 }}>
            Hero: {localStorage.getItem('username') || 'tutor'} | Mode: TUTOR
          </Typography>
        </Box>

        {/* Mobile tabs */}
        <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 2 }}>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': { fontWeight: 700, fontSize: '0.75rem' },
              '& .Mui-selected': { color: TUTOR_COLORS.maroon },
              '& .MuiTabs-indicator': { bgcolor: TUTOR_COLORS.maroon },
            }}
          >
            {navItems.map((it) => (
              <Tab key={it.id} label={it.shortLabel} />
            ))}
          </Tabs>
        </Box>

        <Box sx={{ mt: 2 }}>
          {tab === 0 && <SkillsManagement />}
          {tab === 1 && <MyStudents />}
          {tab === 2 && <TutorProfile />}
          {tab === 3 && <AIInsights />}
        </Box>
      </Box>
    </Box>
  );
};

export default TutorDashboard;
