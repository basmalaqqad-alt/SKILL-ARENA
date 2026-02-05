import React from 'react';
import {
  Box,
  TextField,
  Button,
  InputAdornment,
  Typography,
  Link,
  Stack,
} from '@mui/material';
import { Mail, Lock, LogIn } from 'lucide-react';

/**
 * LoginForm - مكون تسجيل الدخول
 * صُمم خصيصاً ليوضع داخل ملف LoginForm.jsx
 */

const LoginForm = ({ onSwitchToSignup }) => {
  return (
    <Stack spacing={3}>
      {/* العناوين الترحيبية */}
      <Box sx={{ textAlign: 'center' }}>
        <Typography
          variant="h5"
          sx={{ fontWeight: 900, color: '#8a2d2e', mb: 0.5 }}
        >
          Welcome Back
        </Typography>
        <Typography variant="caption" sx={{ color: '#666', fontWeight: 600 }}>
          Enter your details to enter the arena
        </Typography>
      </Box>

      {/* حقل البريد الإلكتروني */}
      <TextField
        fullWidth
        label="Email Address"
        variant="outlined"
        type="email"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Mail size={18} color="#8a2d2e" />
            </InputAdornment>
          ),
          sx: { borderRadius: 4, bgcolor: '#fff' },
        }}
      />

      {/* حقل كلمة المرور مع رابط النسيان */}
      <Box>
        <TextField
          fullWidth
          label="Password"
          type="password"
          variant="outlined"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Lock size={18} color="#8a2d2e" />
              </InputAdornment>
            ),
            sx: { borderRadius: 4, bgcolor: '#fff' },
          }}
        />
        {/* رابط نسيت كلمة المرور بالأسفل جهة اليمين */}
        <Box sx={{ textAlign: 'right', mt: 1 }}>
          <Link
            href="#"
            sx={{
              color: '#8a2d2e',
              fontWeight: 700,
              fontSize: '0.8rem',
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            Forgot password?
          </Link>
        </Box>
      </Box>

      {/* زر تسجيل الدخول الرئيسي */}
      <Button
        variant="contained"
        size="large"
        fullWidth
        endIcon={<LogIn size={20} />}
        sx={{
          py: 2,
          fontWeight: 900,
          bgcolor: '#8a2d2e',
          borderRadius: 4,
          fontSize: '1rem',
          boxShadow: '0 8px 16px rgba(138, 45, 46, 0.2)',
          '&:hover': { bgcolor: '#702425' },
        }}
      >
        Enter Arena
      </Button>

      {/* زر التحويل لإنشاء حساب جديد */}
      <Button
        variant="text"
        onClick={onSwitchToSignup}
        sx={{
          fontWeight: 700,
          color: '#8a2d2e',
          textTransform: 'none',
          fontSize: '0.9rem',
        }}
      >
        New to Arena? Create Account
      </Button>
    </Stack>
  );
};

export default LoginForm;
