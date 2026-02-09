import React from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Container, Box } from '@mui/material';
import theme from './theme';

// الاستيرادات الخاصة بكِ
import Header from './components/layout/Header';
import LoginForm from './components/auth/LoginForm';
import SignupForm from './components/auth/SignupForm';
import MainDashboard from './components/layout/MainDashboard';

export default function App() {
  const navigate = useNavigate();
  const userXP = 1250;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        {/* بوابة الدخول: المسار الرئيسي */}
        <Route
          path="/"
          element={
            <Container maxWidth="md" sx={{ mt: 8 }}>
              <LoginForm
                // عند تسجيل الدخول، ننتقل للداشبورد ونستبدل التاريخ (Replace)
                onLogin={() => navigate('/dashboard', { replace: true })}
                onSwitch={() => navigate('/signup')}
              />
            </Container>
          }
        />

        {/* صفحة التسجيل */}
        <Route
          path="/signup"
          element={
            <Container maxWidth="md" sx={{ mt: 8 }}>
              <SignupForm
                onSignup={() => navigate('/dashboard', { replace: true })}
                onSwitch={() => navigate('/')}
              />
            </Container>
          }
        />

        {/* صفحة الداشبورد المحمية */}
        <Route
          path="/dashboard"
          element={
            <Box
              sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Header userXP={userXP} />

              {/* التغيير هنا: استبدلنا Container بـ Box 
          وعطيناه width: 100% عشان ياخد الشاشة كاملة 
      */}
              <Box sx={{ width: '100%', mt: 4, flexGrow: 1, px: 0 }}>
                <MainDashboard />
              </Box>
            </Box>
          }
        />

        {/* في حال دخل المستخدم رابط غلط، نرجعه للـ Login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ThemeProvider>
  );
}
