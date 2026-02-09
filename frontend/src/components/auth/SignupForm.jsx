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
  ToggleButton,
  ToggleButtonGroup,
  Fade,
} from '@mui/material';
import { Mail, Lock, User, CloudUpload } from 'lucide-react';

/**
 * SignupForm المطور:
 * 1. ترتيب حقول منطقي (الشهادة تحت الباسورد).
 * 2. تفعيل مشروط للزر (يبقى رمادي حتى اكتمال البيانات).
 */
const SignupForm = ({ onSignup, onSwitch }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('learner');
  const [fileName, setFileName] = useState('');

  // دالة التحقق من اكتمال الحقول
  const isFormInvalid = () => {
    const basicFieldsEmpty = !name.trim() || !email.trim() || !password.trim();
    // إذا كان تيوتر، يجب أيضاً أن يرفع شهادة
    const tutorMissingFile = role === 'tutor' && !fileName;

    return basicFieldsEmpty || tutorMissingFile;
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFileName(e.target.files[0].name);
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
              SKILLARENA
            </Typography>
            <Typography
              variant="subtitle2"
              sx={{ color: 'text.secondary', letterSpacing: 1 }}
            >
              CHOOSE YOUR PATH • START YOUR QUEST
            </Typography>
          </Box>

          {/* اختيار الدور */}
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

          <TextField
            fullWidth
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
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

          {/* إرفاق الشهادة (الآن تحت الباسورد للمدربين فقط) */}
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
                    : 'UPLOAD CERTIFICATE'}
                  <input type="file" hidden onChange={handleFileChange} />
                </Button>
              </Box>
            </Fade>
          )}

          {/* الزر الآن يستخدم خاصية disabled بشكل صحيح */}
          <Button
            variant="contained"
            fullWidth
            onClick={onSignup}
            disabled={isFormInvalid()} // سيبقى رمادياً حتى اكتمال البيانات
            sx={{
              py: 1.5,
              fontWeight: 900,
              fontSize: '1rem',
              // تنسيق إضافي لضمان شكل احترافي وهو معطل
              '&.Mui-disabled': {
                bgcolor: 'rgba(0, 0, 0, 0.12)',
                color: 'rgba(0, 0, 0, 0.26)',
              },
            }}
          >
            JOIN AS {role.toUpperCase()}
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
