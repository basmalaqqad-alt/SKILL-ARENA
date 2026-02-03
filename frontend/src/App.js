import React, { useState } from 'react';
import {
  Box,
  Container,
  CssBaseline,
  ThemeProvider,
  createTheme,
  Paper,
} from '@mui/material';
import LogoSection from './components/LogoSection';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';

const theme = createTheme({
  palette: { primary: { main: '#8A2D2E' } },
  shape: { borderRadius: 20 },
});

function App() {
  const [mode, setMode] = useState('login'); // login | signup

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #FFF7D1 0%, #FFE5B4 100%)',
          display: 'flex',
          alignItems: 'center',
          py: 4,
        }}
      >
        <Container maxWidth="xs">
          <LogoSection />

          {/* الورقة البيضا هنا فقط */}
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 2,
              bgcolor: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
            }}
          >
            {mode === 'login' ? (
              <LoginForm onSwitchToSignup={() => setMode('signup')} />
            ) : (
              <SignupForm onSwitchToLogin={() => setMode('login')} />
            )}
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
