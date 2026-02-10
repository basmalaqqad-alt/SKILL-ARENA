import React, { useState } from 'react';
import axios from 'axios'; // إضافة مكتبة axios للربط لاحقاً
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
  // 1. تم تعديل الاسم من name إلى username ليتوافق مع الباك إند
  const [username, setUsername] = useState(''); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('learner');
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // دالة التحقق من اكتمال الحقول
  const isFormInvalid = () => {
    const basicFieldsEmpty = !username.trim() || !email.trim() || !password.trim();
    const tutorMissingFile = role === 'tutor' && !fileName;
    return basicFieldsEmpty || tutorMissingFile;
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  // دالة إرسال البيانات (جاهزة للربط)
  const handleSignupClick = async () => {
    setLoading(true);
    setError('');
    try {
      // هنا سيتم الربط مع رابط الـ Register في الباك إند لاحقاً
      // await axios.post('http://127.0.0.1:8000/api/accounts/register/', { username, email, password, role });
      onSignup(); 
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3, width: '100%', maxWidth: 400, bgcolor: 'rgba(255, 255, 255, 0.9)' }}>
        <Stack spacing={3}>
          <Box sx={{ textAlign: 'center', mb: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main' }}> SKILLARENA </Typography>
            <Typography variant="subtitle2" sx={{ color: 'text.secondary', letterSpacing: 1 }}> CHOOSE YOUR PATH • START YOUR QUEST </Typography>
          </Box>

          <ToggleButtonGroup
            value={role}
            exclusive
            onChange={(e, val) => val && setRole(val)}
            fullWidth
            sx={{ '& .MuiToggleButton-root': { py: 1, fontWeight: 800, borderRadius: 2 } }}
          >
            <ToggleButton value="learner">LEARNER</ToggleButton>
            <ToggleButton value="tutor">TUTOR</ToggleButton>
          </ToggleButtonGroup>

          {error && <Alert severity="error">{error}</Alert>}

          {/* 2. تعديل الحقل هنا ليكون Username */}
          <TextField
            fullWidth
            label="Username"
            placeholder="Choose your unique hero name"
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
            label="Email"
            placeholder="Enter your email"
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
            placeholder="Create a strong password"
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

          {role === 'tutor' && (
            <Fade in={role === 'tutor'}>
              <Box>
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  startIcon={<CloudUpload size={20} />}
                  sx={{
                    borderStyle: 'dashed', py: 1.5, fontWeight: 700,
                    color: fileName ? 'success.main' : 'primary.main',
                    borderColor: fileName ? 'success.main' : 'primary.main',
                  }}
                >
                  {fileName ? `CERT: ${fileName.substring(0, 15)}...` : 'UPLOAD CERTIFICATE'}
                  <input type="file" hidden onChange={handleFileChange} />
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
              py: 1.5, fontWeight: 900, fontSize: '1rem',
              '&.Mui-disabled': { bgcolor: 'rgba(0, 0, 0, 0.12)', color: 'rgba(0, 0, 0, 0.26)' },
            }}
          >
            {loading ? 'CREATING HERO...' : `JOIN AS ${role.toUpperCase()}`}
          </Button>

          <Typography
            onClick={onSwitch}
            sx={{ cursor: 'pointer', textAlign: 'center', color: 'primary.main', fontWeight: 700, fontSize: '0.85rem' }}
          >
            Already a hero? Log in here
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
};

export default SignupForm;