import React, { useState } from 'react';
import axios from 'axios';
import {
  Paper,
  Stack,
  Typography,
  TextField,
  Button,
  InputAdornment,
  Box,
  Alert,
} from '@mui/material';
import { User, Lock } from 'lucide-react'; // استبدلنا Mail بـ User

const LoginForm = ({ onLogin, onSwitch }) => {
  // 1. غيرنا الـ State من email لـ username
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLoginClick = async () => {
    setLoading(true);
    setError('');

    try {
      // 2. إرسال username بدلاً من email لمروحة
      const response = await axios.post('http://localhost:8000/api/login/', {
        username: username,
        password: password,
      });

      if (response.status === 200) {
        console.log('Welcome Back, Hero! ⚔️', response.data);
        onLogin();
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Hero not found or wrong password!'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: 3,
          width: '100%',
          maxWidth: 400,
          bgcolor: 'rgba(255, 255, 255, 0.9)',
        }}
      >
        <Stack spacing={3}>
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Typography
              variant="h4"
              sx={{ fontWeight: 900, color: 'primary.main' }}
            >
              SKILLARENA
            </Typography>
            <Typography
              variant="subtitle2"
              sx={{ color: 'text.secondary', letterSpacing: 1 }}
            >
              PLAY • LEARN • EARN
            </Typography>
          </Box>

          <Typography variant="h5" textAlign="center" sx={{ fontWeight: 800 }}>
            Hero Login
          </Typography>

          {error && (
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {/* 3. تعديل حقل الإدخال ليناسب اليوزر نيم */}
          <TextField
            fullWidth
            label="Username"
            placeholder="Enter your hero name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <User size={18} />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock size={18} />
                </InputAdornment>
              ),
            }}
          />

          <Button
            variant="contained"
            fullWidth
            onClick={handleLoginClick}
            disabled={!username.trim() || !password.trim() || loading}
            sx={{ py: 1.5, fontWeight: 800, fontSize: '1rem' }}
          >
            {loading ? 'AUTHENTICATING...' : 'LOG IN'}
          </Button>

          <Typography
            onClick={onSwitch}
            sx={{
              cursor: 'pointer',
              textAlign: 'center',
              color: 'primary.main',
              fontWeight: 700,
              fontSize: '0.85rem',
            }}
          >
            New hero? Sign up for free
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
};

export default LoginForm;
