import React from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Container, Box } from '@mui/material';
import theme from './theme';

import Header from './components/layout/Header';
import LoginForm from './components/auth/LoginForm';
import SignupForm from './components/auth/SignupForm';
import MainDashboard from './components/layout/MainDashboard';

export default function App() {
  const navigate = useNavigate();
  const userXP = 1250;

  const handleAuthSuccess = (role) => {
    // كاشف أعطال: افتحي الـ Console (F12) وشوفي وش يطبع
    console.log("DEBUG: Role received from Login ->", role);
    
    const cleanRole = String(role).toLowerCase().trim();
    localStorage.setItem('role', cleanRole);

    // توجيه فوري ومباشر
    if (cleanRole === 'tutor') {
      navigate('/tutor-dashboard', { replace: true });
    } else {
      navigate('/learner-dashboard', { replace: true });
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route path="/" element={<Container maxWidth="md" sx={{ mt: 8 }}><LoginForm onLogin={handleAuthSuccess} onSwitch={() => navigate('/signup')} /></Container>} />
        <Route path="/signup" element={<Container maxWidth="md" sx={{ mt: 8 }}><SignupForm onSignup={handleAuthSuccess} onSwitch={() => navigate('/')} /></Container>} />

        {/* واجهة التيوتر اللي زبطت يدوي */}
        <Route path="/tutor-dashboard" element={
          <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header userXP={userXP} />
            <Box sx={{ width: '100%', mt: 4, flexGrow: 1 }}><MainDashboard role="tutor" /></Box>
          </Box>
        } />

        <Route path="/learner-dashboard" element={
          <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header userXP={userXP} />
            <Box sx={{ width: '100%', mt: 4, flexGrow: 1 }}><MainDashboard role="learner" /></Box>
          </Box>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ThemeProvider>
  );
}