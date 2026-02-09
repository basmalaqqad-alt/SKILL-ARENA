import React, { useState } from 'react';
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
import { Mail, Lock } from 'lucide-react';

/**
 * LoginForm with Input Validation.
 * Ensures fields are not empty before navigation.
 */
const LoginForm = ({ onLogin, onSwitch }) => {
  // Local state to manage input values
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  // Validation logic before calling the onLogin prop
  const handleLoginClick = () => {
    if (email.trim() === '' || password.trim() === '') {
      setError(true);
    } else {
      setError(false);
      onLogin(); // Proceed only if validated
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
            Welcome Back!
          </Typography>

          {/* Alert shown when validation fails */}
          {error && (
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              Please fill in all fields!
            </Alert>
          )}

          <TextField
            fullWidth
            label="Email"
            placeholder="hero@arena.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Mail size={18} />
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
            // Disables the button visually if inputs are empty
            disabled={!email.trim() || !password.trim()}
            sx={{ py: 1.5, fontWeight: 800, fontSize: '1rem' }}
          >
            LOG IN
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
            Don't have an account? Sign up for free
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
};

export default LoginForm;
