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
  ToggleButton,
  ToggleButtonGroup,
  Fade,
} from '@mui/material';
import { Mail, Lock, User, CloudUpload } from 'lucide-react';

const SignupForm = ({ onSignup, onSwitch }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('learner');
  const [fileName, setFileName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isFormInvalid = () => {
    const basicFieldsEmpty =
      !username.trim() || !email.trim() || !password.trim();
    const tutorMissingFile = role === 'tutor' && !selectedFile;
    return basicFieldsEmpty || tutorMissingFile;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);
    }
  };

  const handleSignupClick = async () => {
    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('username', username);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('role', role);

    if (role === 'tutor' && selectedFile) {
      formData.append('certificate', selectedFile);
    }

    try {
      // --- التعديل الجذري هنا: الرابط الجديد ليطابق تنظيمك يا مروحة ---
      const response = await axios.post(
        'http://127.0.0.1:8000/api/accounts/auth/signup/',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.status === 201) {
        console.log('Welcome Hero! Quest Started ⚔️', response.data);

        // حفظ التوكن والدور لكي يتعرف عليهما App.js فوراً
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }
        // هذا السطر هو الذي سيفتح لكِ صفحة التيوتر فوراً بعد الساين اب
        localStorage.setItem('role', response.data.role || role);

        onSignup();
      }
    } catch (err) {
      // استلام رسائل الخطأ الدقيقة من السيرفر حق مروحة
      const serverErrors = err.response?.data;
      setError(
        serverErrors?.error || // للرسائل العامة التي أضفناها في signup_hero
          serverErrors?.username?.[0] ||
          serverErrors?.email?.[0] ||
          'Hero creation failed. Please check your data!'
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
          <Box sx={{ textAlign: 'center', mb: 1 }}>
            <Typography
              variant="h4"
              sx={{ fontWeight: 900, color: 'primary.main' }}
            >
              {' '}
              SKILLARENA{' '}
            </Typography>
            <Typography
              variant="subtitle2"
              sx={{ color: 'text.secondary', letterSpacing: 1 }}
            >
              {' '}
              CHOOSE YOUR PATH • START YOUR QUEST{' '}
            </Typography>
          </Box>

          <ToggleButtonGroup
            value={role}
            exclusive
            onChange={(e, val) => val && setRole(val)}
            fullWidth
            sx={{
              '& .MuiToggleButton-root': {
                py: 1,
                fontWeight: 800,
                borderRadius: 2,
              },
            }}
          >
            <ToggleButton value="learner">LEARNER</ToggleButton>
            <ToggleButton value="tutor">TUTOR</ToggleButton>
          </ToggleButtonGroup>

          {error && (
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Username"
            placeholder="Choose your unique hero name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  {' '}
                  <User size={18} />{' '}
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            label="Email"
            placeholder="hero@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  {' '}
                  <Mail size={18} />{' '}
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            label="Password"
            type="password"
            placeholder="8+ chars (Letters & Numbers)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  {' '}
                  <Lock size={18} />{' '}
                </InputAdornment>
              ),
            }}
          />

          {role === 'tutor' && (
            <Fade in={role === 'tutor'}>
              <Box>
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  startIcon={<CloudUpload size={20} />}
                  sx={{
                    borderStyle: 'dashed',
                    py: 1.5,
                    fontWeight: 700,
                    color: fileName ? 'success.main' : 'primary.main',
                    borderColor: fileName ? 'success.main' : 'primary.main',
                  }}
                >
                  {fileName
                    ? `CERT: ${fileName.substring(0, 15)}...`
                    : 'UPLOAD CERTIFICATE (PDF/WORD)'}
                  <input
                    type="file"
                    hidden
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx"
                  />
                </Button>
              </Box>
            </Fade>
          )}

          <Button
            variant="contained"
            fullWidth
            onClick={handleSignupClick}
            disabled={isFormInvalid() || loading}
            sx={{
              py: 1.5,
              fontWeight: 900,
              fontSize: '1rem',
              '&.Mui-disabled': {
                bgcolor: 'rgba(0, 0, 0, 0.12)',
                color: 'rgba(0, 0, 0, 0.26)',
              },
            }}
          >
            {loading ? 'CREATING HERO...' : `JOIN AS ${role.toUpperCase()}`}
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
            Already a hero? Log in here
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
};

export default SignupForm;
