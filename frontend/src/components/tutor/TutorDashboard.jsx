import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import SkillsManagement from './SkillsManagement';
import MyStudents from './MyStudents';
import TutorProfile from './TutorProfile';
import AIInsights from './AIInsights';
import PeopleIcon from '@mui/icons-material/People';
import BuildIcon from '@mui/icons-material/Build';
import PersonIcon from '@mui/icons-material/Person';
import InsightsIcon from '@mui/icons-material/Insights';

const TutorDashboard = () => {
  const [tab, setTab] = useState(0);

  const navItems = [
    { id: 0, label: 'Skills Management', icon: <BuildIcon /> },
    { id: 1, label: 'My Students', icon: <PeopleIcon /> },
    { id: 2, label: 'Profile', icon: <PersonIcon /> },
    { id: 3, label: 'AI Insights', icon: <InsightsIcon /> },
  ];

  const titleMap = {
    0: 'SKILLS MANAGEMENT',
    1: 'MY STUDENTS',
    2: 'PROFILE',
    3: 'AI INSIGHTS',
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 900, mb: 2, color: 'primary.main' }}>
        TUTOR PANEL - SKILLARENA
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, borderRadius: 3, height: '100%' }}>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700 }}>
              TUTOR NAV
            </Typography>
            <Divider sx={{ mb: 1 }} />
            <List>
              {navItems.map((it) => (
                <ListItemButton key={it.id} selected={tab === it.id} onClick={() => setTab(it.id)}>
                  <ListItemIcon>{it.icon}</ListItemIcon>
                  <ListItemText primary={it.label} />
                </ListItemButton>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={9}>
          <Card sx={{ mb: 2, borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                {titleMap[tab]}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                {tab === 0 && 'Manage Your Skills & Students'}
                {tab === 1 && "Track and manage your students' activity"}
                {tab === 2 && 'Your public profile and XP overview'}
                {tab === 3 && 'AI-driven analytics and recommendations'}
              </Typography>
            </CardContent>
          </Card>

          <Paper sx={{ p: 0, borderRadius: 2 }}>
            <Box sx={{ mt: 0 }}>
              {tab === 0 && <SkillsManagement />}
              {tab === 1 && <MyStudents />}
              {tab === 2 && <TutorProfile />}
              {tab === 3 && <AIInsights />}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TutorDashboard;
