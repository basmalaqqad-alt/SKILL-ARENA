// App.js
import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import theme from './theme';
import axios from 'axios';

import Header from './components/layout/Header';
import LoginForm from './components/auth/LoginForm';
import SignupForm from './components/auth/SignupForm';
import MainDashboard from './components/layout/MainDashboard';
import TutorDashboard from './components/tutor/TutorDashboard';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || location.pathname !== '/dashboard') return;
    axios.get('http://127.0.0.1:8000/api/accounts/profile/', {
      headers: { Authorization: `Token ${token}` }
    }).then(res => setProfile(res.data)).catch(() => {});
  }, [location.pathname]);

  const userXP = profile?.experience ?? 0;
  const avatarUrl = profile?.avatar_url ?? null;
  const isTrustedTutor = profile?.is_trusted_tutor ?? false;

  // دالة بسيطة لتقرير أي داشبورد نعرض بناءً على الدور المخزن
  // App.js
  const renderDashboard = () => {
    // غيري user_role إلى role فقط ليتطابق مع بقية الملفات
    const role = localStorage.getItem('role');

    if (role === 'tutor') {
      return <TutorDashboard />;
    }
    return <MainDashboard />;
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route
          path="/"
          element={
            <LoginForm
              onLogin={() => navigate('/dashboard', { replace: true })}
              onSwitch={() => navigate('/signup')}
            />
          }
        />
        <Route
          path="/signup"
          element={
            <SignupForm
              onSignup={() => navigate('/dashboard', { replace: true })}
              onSwitch={() => navigate('/')}
            />
          }
        />

        {/* المسار الذكي: يتغير محتواه حسب الدور */}
        <Route
          path="/dashboard"
          element={
            <Box
              sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                bgcolor: '#F8F4DF',
              }}
            >
              <Header userXP={userXP} avatarUrl={avatarUrl} isTutor={localStorage.getItem('role') === 'tutor'} isTrustedTutor={isTrustedTutor} />
              <Box sx={{ width: '100%', mt: 4, flexGrow: 1 }}>
                {renderDashboard()}{' '}
                {/* هنا السحر: استدعاء الدالة التي تقرر المحتوى */}
              </Box>
            </Box>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ThemeProvider>
  );
}
