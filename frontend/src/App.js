import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Container } from '@mui/material';
import theme from './theme';

// Import your components
import Header from './components/layout/Header';
import LoginForm from './components/auth/LoginForm';
import SignupForm from './components/auth/SignupForm';
import MainDashboard from './components/layout/MainDashboard';

export default function App() {
  const navigate = useNavigate();

  // Mock XP for now
  const userXP = 1250;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Routes>
        {/* Auth Routes - No Header shown here */}
        <Route
          path="/"
          element={
            <Container maxWidth="md" sx={{ mt: 8 }}>
              <LoginForm
                onLogin={() => navigate('/dashboard')}
                onSwitch={() => navigate('/signup')}
              />
            </Container>
          }
        />

        <Route
          path="/signup"
          element={
            <Container maxWidth="md" sx={{ mt: 8 }}>
              <SignupForm
                onSignup={() => navigate('/dashboard')}
                onSwitch={() => navigate('/')}
              />
            </Container>
          }
        />

        {/* Protected Dashboard Route - Shows Header */}
        <Route
          path="/dashboard"
          element={
            <>
              <Header userXP={userXP} />
              <Container maxWidth="md" sx={{ mt: 4 }}>
                <MainDashboard />
              </Container>
            </>
          }
        />
      </Routes>
    </ThemeProvider>
  );
}
