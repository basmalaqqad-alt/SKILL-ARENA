import React, { useState } from 'react';
import axios from 'axios';
import { Box, Stack, Typography, TextField, Button, Alert, CircularProgress, InputAdornment } from '@mui/material';
import { User, Lock, ArrowRight } from 'lucide-react';
import Logo from '../common/Logo';



const LoginForm = ({ onLogin, onSwitch }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) return;
    setLoading(true); setError('');
    try {
      const res = await axios.post('http://127.0.0.1:8000/api/accounts/auth/login/', { username, password });
      if (res.status === 200) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('role', res.data.role);
        if (res.data.username) localStorage.setItem('username', res.data.username);
        onLogin(res.data);
      }
    } catch (err) {
      setError(!err.response
        ? 'Server offline — check Django terminal.'
        : err.response?.data?.error || err.response?.data?.non_field_errors?.[0] || 'Incorrect username or password.');
    } finally { setLoading(false); }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#F4F2EF',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        p: 2,
        // subtle geometric background
        backgroundImage: [
          'radial-gradient(circle at 15% 20%, rgba(250,202,7,0.07) 0%, transparent 50%)',
          'radial-gradient(circle at 85% 80%, rgba(138,45,46,0.06) 0%, transparent 50%)',
        ].join(','),
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 400 }}>

        {/* Logo */}
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Logo height={64} />
          <Typography sx={{ mt: 1, fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.25em', color: '#9E9892', textTransform: 'uppercase' }}>
            Play · Learn · Earn
          </Typography>
        </Box>

        {/* Card */}
        <Box
          sx={{
            bgcolor: '#fff',
            borderRadius: '20px',
            border: '1px solid rgba(0,0,0,0.07)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04)',
            p: { xs: 3, sm: 4 },
          }}
        >
          <Typography variant="h5" sx={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, mb: 0.5, letterSpacing: '-0.02em' }}>
            Welcome back
          </Typography>
          <Typography variant="body2" sx={{ color: '#6B6560', mb: 3.5 }}>
            Sign in to continue your learning journey
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: '10px', fontSize: '0.85rem' }}>
              {error}
            </Alert>
          )}

          <Stack spacing={2.5}>
            <TextField
              fullWidth label="Username" value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              InputProps={{ startAdornment: <InputAdornment position="start"><User size={16} color="#9E9892" /></InputAdornment> }}
            />
            <TextField
              fullWidth label="Password" type="password" value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              InputProps={{ startAdornment: <InputAdornment position="start"><Lock size={16} color="#9E9892" /></InputAdornment> }}
            />

            <Button
              fullWidth variant="contained"
              onClick={handleLogin}
              disabled={loading || !username.trim() || !password.trim()}
              endIcon={loading ? <CircularProgress size={15} color="inherit" /> : <ArrowRight size={16} />}
              sx={{ py: 1.4, mt: 0.5, borderRadius: '10px', fontSize: '0.95rem', fontWeight: 600 }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </Stack>

          {/* Footer link */}
          <Box sx={{ mt: 3.5, pt: 3, borderTop: '1px solid rgba(0,0,0,0.07)', textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#6B6560' }}>
              New to SkillArena?{' '}
              <Typography
                component="span" onClick={onSwitch}
                sx={{ color: '#8A2D2E', fontWeight: 700, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
              >
                Create account
              </Typography>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginForm;