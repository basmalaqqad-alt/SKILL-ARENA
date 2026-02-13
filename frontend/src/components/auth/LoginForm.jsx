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
import { User, Lock } from 'lucide-react';

/**
 * LoginForm: نسخة مطورة لتدعم تحويل المستخدم بناءً على الـ Role
 */
const LoginForm = ({ onLogin, onSwitch }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLoginClick = async () => {
    setLoading(true);
    setError('');

    try {
      // الاتصال بالباك إند المحلي
      const response = await axios.post(
        'http://127.0.0.1:8000/api/accounts/auth/login/',
        {
          username: username,
          password: password,
        }
      );

      if (response.status === 200) {
        // تأكدي أن المفتاح هو 'role' وليس 'user_role' ليتوافق مع App.js
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('role', response.data.role);
        if (response.data.username) {
          localStorage.setItem('username', response.data.username);
        }

        // إرسال البيانات للأب (App.js) لتغيير الصفحة
        onLogin(response.data);
      }
    } catch (err) {
      if (!err.response) {
        setError('Server is offline. Check your Django terminal!');
      } else {
        setError(
          err.response?.data?.error ||
            err.response?.data?.message ||
            err.response?.data?.non_field_errors?.[0] ||
            'Hero not found or wrong password!'
        );
      }
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

          <TextField
            fullWidth
            label="Username"
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
            sx={{ py: 1.5, fontWeight: 800 }}
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
