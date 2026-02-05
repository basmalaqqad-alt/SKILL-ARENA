import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  InputAdornment, 
  ToggleButton, 
  ToggleButtonGroup, 
  Stack, 
  Typography, 
  Fade, 
  IconButton, 
  Tooltip 
} from '@mui/material';
import { 
  Mail, 
  Lock, 
  User, 
  GraduationCap, 
  Upload, 
  CheckCircle, 
  UserPlus, 
  Info 
} from 'lucide-react';

/**
 * SignupForm - نموذج الانضمام للأرينا
 * تم إصلاح خطأ "Unterminated JSX" لضمان عمل السيرفر.
 */

const SignupForm = ({ onSwitchToLogin }) => {
  const [role, setRole] = useState('learner');
  const [fileName, setFileName] = useState('');

  const handleRoleChange = (event, newRole) => {
    if (newRole !== null) setRole(newRole);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) setFileName(file.name);
  };

  return (
    <Stack spacing={2.5}>
      {/* العناوين الترحيبية */}
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 900, color: '#8a2d2e', mb: 0.5 }}>
          Join the Arena
        </Typography>
        <Typography variant="caption" sx={{ color: '#666', fontWeight: 600 }}>
          Create your profile to start earning badges
        </Typography>
      </Box>
      
      {/* اختيار الرتبة */}
      <Box sx={{ textAlign: 'center' }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1, justifyContent: 'center' }}>
          <Typography variant="caption" sx={{ color: '#666', fontWeight: 800 }}>I WANT TO BE A...</Typography>
          <Tooltip title="Instructors can upload certificates to get a verified badge!">
            <IconButton size="small"><Info size={14} color="#8a2d2e" /></IconButton>
          </Tooltip>
        </Stack>
        <ToggleButtonGroup 
          value={role} 
          exclusive 
          onChange={handleRoleChange} 
          fullWidth 
          color="primary"
          sx={{ 
            '& .MuiToggleButton-root': { 
              py: 1.2, 
              fontWeight: 700, 
              borderRadius: 3,
              border: '1px solid rgba(138, 45, 46, 0.2)',
              '&.Mui-selected': {
                bgcolor: '#faca07',
                color: '#8a2d2e',
                '&:hover': { bgcolor: '#faca07' }
              }
            } 
          }}
        >
          <ToggleButton value="learner" sx={{ gap: 1 }}>
            <User size={16} /> Learner
          </ToggleButton>
          <ToggleButton value="instructor" sx={{ gap: 1 }}>
            <GraduationCap size={16} /> Instructor
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* حقول الإدخال */}
      <TextField 
        fullWidth 
        label="Full Name" 
        variant="outlined"
        InputProps={{ 
          startAdornment: (
            <InputAdornment position="start">
              <User size={18} color="#8a2d2e" />
            </InputAdornment>
          ), 
          sx: { borderRadius: 4, bgcolor: '#fff' } 
        }} 
      />

      <TextField 
        fullWidth 
        label="Email Address" 
        variant="outlined"
        InputProps={{ 
          startAdornment: (
            <InputAdornment position="start">
              <Mail size={18} color="#8a2d2e" />
            </InputAdornment>
          ), 
          sx: { borderRadius: 4, bgcolor: '#fff' } 
        }} 
      />

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
          sx: { borderRadius: 4, bgcolor: '#fff' } 
        }} 
      />

      {/* رفع الشهادة للمدربين */}
      {role === 'instructor' && (
        <Fade in={role === 'instructor'}>
          <Box sx={{ 
            p: 2, 
            border: '2px dashed #8a2d2e', 
            borderRadius: 4, 
            textAlign: 'center', 
            bgcolor: 'rgba(138, 45, 46, 0.04)' 
          }}>
            <Typography variant="caption" sx={{ display: 'block', mb: 1.5, color: '#8a2d2e', fontWeight: 800 }}>
              VERIFY YOUR ACCOUNT WITH A CERTIFICATE
            </Typography>
            <input accept="image/*" style={{ display: 'none' }} id="file-up" type="file" onChange={handleFileUpload} />
            <label htmlFor="file-up">
              <Button component="span" variant="outlined" size="small" startIcon={<Upload size={14} />} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}>
                {fileName ? 'Change File' : 'Upload Image'}
              </Button>
            </label>
            {fileName && (
              <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} sx={{ mt: 1, color: '#2e7d32' }}>
                <CheckCircle size={14} />
                <Typography variant="caption" noWrap sx={{ maxWidth: 150, fontWeight: 800 }}>{fileName}</Typography>
              </Stack>
            )}
          </Box>
        </Fade>
      )}

      {/* زر إنشاء الحساب */}
      <Button 
        variant="contained" 
        size="large" 
        fullWidth 
        endIcon={<UserPlus size={20} />} 
        sx={{ 
          py: 2, 
          fontWeight: 900, 
          bgcolor: '#8a2d2e', 
          borderRadius: 4,
          boxShadow: '0 8px 16px rgba(138, 45, 46, 0.2)',
          '&:hover': { bgcolor: '#702425' }
        }}
      >
        Create Account 🚀
      </Button>

      {/* رابط العودة للوجن */}
      <Button 
        variant="text" 
        onClick={onSwitchToLogin} 
        sx={{ fontWeight: 700, color: '#8a2d2e', textTransform: 'none' }}
      >
        Already a member? Log In
      </Button>
    </Stack>
  );
};

export default SignupForm;