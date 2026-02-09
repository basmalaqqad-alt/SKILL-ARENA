import React, { useState } from 'react';
import {
  Paper,
  Stack,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  TextField,
  Box,
  Fade,
  Button,
  Chip,
  InputAdornment,
} from '@mui/material';
import {
  ShieldCheck,
  Upload,
  XCircle,
  CheckCircle,
  User,
  Mail,
  Lock,
} from 'lucide-react';

const SignupForm = ({ onSignup, onSwitch }) => {
  // State for user role: 'learner' or 'instructor'
  const [role, setRole] = useState('learner');
  // State for the uploaded certificate file
  const [fileName, setFileName] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  const removeFile = () => {
    setFileName('');
  };

  return (
    <Paper
      sx={{
        p: 4,
        borderRadius: 3,
        bgcolor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <Stack spacing={2.5}>
        <Typography variant="h5" textAlign="center" sx={{ fontWeight: 900 }}>
          Join the Arena
        </Typography>

        {/* Role Selection: Learner vs Instructor */}
        <ToggleButtonGroup
          value={role}
          exclusive
          onChange={(e, v) => v && setRole(v)}
          fullWidth
          size="small"
          color="primary"
        >
          <ToggleButton value="learner" sx={{ py: 1, fontWeight: 700 }}>
            Learner
          </ToggleButton>
          <ToggleButton value="instructor" sx={{ py: 1, fontWeight: 700 }}>
            Instructor
          </ToggleButton>
        </ToggleButtonGroup>

        {/* Common Input Fields */}
        <TextField
          fullWidth
          label="Full Name"
          size="small"
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
          size="small"
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
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Lock size={18} />
              </InputAdornment>
            ),
          }}
        />

        {/* Trusted Status Section: Only visible for Instructors */}
        {role === 'instructor' && (
          <Fade in={role === 'instructor'}>
            <Box
              sx={{
                p: 2,
                border: '1px dashed rgba(138, 45, 46, 0.3)',
                borderRadius: 2,
                bgcolor: 'rgba(138, 45, 46, 0.02)',
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ mb: 1 }}
              >
                <ShieldCheck size={18} color="#8A2D2E" />
                <Typography variant="subtitle2" sx={{ color: '#8A2D2E' }}>
                  Trusted Status (Optional)
                </Typography>
              </Stack>

              <Typography
                variant="caption"
                sx={{ display: 'block', mb: 2, color: 'text.secondary' }}
              >
                Upload your degree to get the <b>Trusted Badge</b>. You can skip
                this and remain a Standard Tutor.
              </Typography>

              <Stack direction="row" alignItems="center" spacing={2}>
                <input
                  accept="image/*,.pdf"
                  style={{ display: 'none' }}
                  id="cert-upload"
                  type="file"
                  onChange={handleFileChange}
                />
                <label htmlFor="cert-upload">
                  <Button
                    component="span"
                    variant="outlined"
                    size="small"
                    startIcon={
                      fileName ? (
                        <CheckCircle size={16} />
                      ) : (
                        <Upload size={16} />
                      )
                    }
                    sx={{ textTransform: 'none' }}
                    color={fileName ? 'success' : 'primary'}
                  >
                    {fileName ? 'Change File' : 'Upload Certificate'}
                  </Button>
                </label>

                {fileName && (
                  <Chip
                    label={fileName}
                    size="small"
                    onDelete={removeFile}
                    deleteIcon={<XCircle size={14} />}
                  />
                )}
              </Stack>
            </Box>
          </Fade>
        )}

        {/* Submit Button: Changes style based on the Trusted status */}
        <Button
          variant="contained"
          fullWidth
          onClick={onSignup}
          sx={{
            py: 1.5,
            fontWeight: 800,
            bgcolor:
              role === 'instructor' && fileName
                ? 'secondary.main'
                : 'primary.main',
            color: role === 'instructor' && fileName ? 'primary.main' : '#fff',
            '&:hover': {
              bgcolor:
                role === 'instructor' && fileName ? '#e5b806' : '#6b2223',
            },
          }}
        >
          {role === 'instructor'
            ? fileName
              ? 'Apply as Trusted Tutor 🛡️'
              : 'Join as Standard Tutor'
            : 'Join Arena'}
        </Button>

        <Typography
          onClick={onSwitch}
          sx={{
            cursor: 'pointer',
            textAlign: 'center',
            color: 'primary.main',
            fontWeight: 700,
            fontSize: '0.8rem',
          }}
        >
          Already a Hero? Login
        </Typography>
      </Stack>
    </Paper>
  );
};

export default SignupForm;
