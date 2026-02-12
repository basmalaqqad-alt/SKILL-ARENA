// App.js
import React from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import theme from './theme';

// استيرادات المكونات
import Header from './components/layout/Header';
import LoginForm from './components/auth/LoginForm';
import SignupForm from './components/auth/SignupForm';
import MainDashboard from './components/layout/MainDashboard'; // هاد غالباً للـ Learner
import TutorDashboard from './components/tutor/TutorDashboard';

export default function App() {
  const navigate = useNavigate();
  const userXP = 1250;

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
              }}
            >
              <Header userXP={userXP} />
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
