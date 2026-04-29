import React, { useState } from 'react';
import axios from 'axios';
import { Box, Stack, Typography, TextField, Button, Alert, CircularProgress, InputAdornment } from '@mui/material';
import { User, Mail, Lock, CloudUpload, ArrowRight, GraduationCap, BookOpen } from 'lucide-react';

const ROLES = [
  { value: 'learner', label: 'Learner',   icon: BookOpen,      desc: 'Browse & enroll in courses' },
  { value: 'tutor',   label: 'Instructor', icon: GraduationCap, desc: 'Teach & publish courses'    },
];

const SignupForm = ({ onSignup, onSwitch }) => {
  const [username, setUsername]         = useState('');
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [role, setRole]                 = useState('learner');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName]         = useState('');
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');

  const isInvalid = !username.trim() || !email.trim() || !password.trim() || (role === 'tutor' && !selectedFile);

  const handleSignup = async () => {
    if (isInvalid) return;
    setLoading(true); setError('');
    const fd = new FormData();
    fd.append('username', username); fd.append('email', email);
    fd.append('password', password); fd.append('role', role);
    if (role === 'tutor' && selectedFile) fd.append('certificate', selectedFile);
    try {
      const res = await axios.post('http://127.0.0.1:8000/api/accounts/auth/signup/', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.status === 201) {
        if (res.data.token)    localStorage.setItem('token', res.data.token);
        if (res.data.username) localStorage.setItem('username', res.data.username);
        localStorage.setItem('role', res.data.role || role);
        onSignup(res.data);
      }
    } catch (err) {
      const d = err.response?.data;
      setError(d?.error || d?.username?.[0] || d?.email?.[0] || 'Something went wrong. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#F4F2EF',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        p: 2,
        backgroundImage: [
          'radial-gradient(circle at 80% 10%, rgba(250,202,7,0.08) 0%, transparent 50%)',
          'radial-gradient(circle at 10% 90%, rgba(138,45,46,0.06) 0%, transparent 50%)',
        ].join(','),
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 440 }}>

        {/* Logo */}
        <Box sx={{ textAlign: 'center', mb: 4.5 }}>
          <Stack direction="row" justifyContent="center" alignItems="baseline" spacing={0}>
            <Typography sx={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '2.2rem', letterSpacing: '-0.04em', color: '#8A2D2E', lineHeight: 1 }}>SKILL</Typography>
            <Typography sx={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '2.2rem', letterSpacing: '-0.04em', color: '#FACA07', WebkitTextStroke: '0.5px #C8970A', lineHeight: 1 }}>ARENA</Typography>
          </Stack>
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
            Create account
          </Typography>
          <Typography variant="body2" sx={{ color: '#6B6560', mb: 3.5 }}>
            Choose your role and start your journey
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2.5, borderRadius: '10px', fontSize: '0.85rem' }}>{error}</Alert>}

          {/* Role selector */}
          <Stack direction="row" spacing={1.5} sx={{ mb: 3 }}>
            {ROLES.map(r => {
              const Icon = r.icon;
              const active = role === r.value;
              return (
                <Box
                  key={r.value} onClick={() => setRole(r.value)}
                  sx={{
                    flex: 1, py: 1.5, px: 1.75,
                    borderRadius: '12px',
                    border: active ? '2px solid #8A2D2E' : '1.5px solid rgba(0,0,0,0.1)',
                    bgcolor: active ? 'rgba(138,45,46,0.04)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    '&:hover': { borderColor: '#8A2D2E' },
                  }}
                >
                  <Stack alignItems="center" spacing={0.5}>
                    <Box sx={{ color: active ? '#8A2D2E' : '#9E9892', transition: 'color 0.15s' }}>
                      <Icon size={20} />
                    </Box>
                    <Typography sx={{ fontWeight: active ? 700 : 500, fontSize: '0.875rem', color: active ? '#8A2D2E' : '#1A1614' }}>
                      {r.label}
                    </Typography>
                    <Typography sx={{ fontSize: '0.7rem', color: '#9E9892', textAlign: 'center' }}>{r.desc}</Typography>
                  </Stack>
                </Box>
              );
            })}
          </Stack>

          <Stack spacing={2.5}>
            <TextField fullWidth label="Username" value={username} onChange={e => setUsername(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><User size={15} color="#9E9892" /></InputAdornment> }} />
            <TextField fullWidth label="Email address" value={email} onChange={e => setEmail(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><Mail size={15} color="#9E9892" /></InputAdornment> }} />
            <TextField fullWidth label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><Lock size={15} color="#9E9892" /></InputAdornment> }} />

            {role === 'tutor' && (
              <Box
                onClick={() => document.getElementById('sa-cert-upload').click()}
                sx={{
                  border: fileName ? '1.5px solid #2e7d32' : '1.5px dashed rgba(138,45,46,0.3)',
                  borderRadius: '12px', p: 2.5, textAlign: 'center', cursor: 'pointer',
                  bgcolor: fileName ? 'rgba(46,125,50,0.03)' : 'rgba(138,45,46,0.02)',
                  transition: 'all 0.15s',
                  '&:hover': { bgcolor: 'rgba(138,45,46,0.04)', borderColor: '#8A2D2E' },
                }}
              >
                <input id="sa-cert-upload" type="file" hidden accept=".pdf,.doc,.docx" onChange={e => { const f=e.target.files[0]; if(f){setSelectedFile(f);setFileName(f.name);} }} />
                <CloudUpload size={24} color={fileName ? '#2e7d32' : '#8A2D2E'} style={{ marginBottom: 6 }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: fileName ? '#2e7d32' : '#8A2D2E' }}>
                  {fileName ? fileName.slice(0, 30) + (fileName.length > 30 ? '…' : '') : 'Upload teaching certificate'}
                </Typography>
                <Typography variant="caption">PDF or Word document · Required for verification</Typography>
              </Box>
            )}

            <Button
              fullWidth variant="contained"
              onClick={handleSignup}
              disabled={isInvalid || loading}
              endIcon={loading ? <CircularProgress size={15} color="inherit" /> : <ArrowRight size={16} />}
              sx={{ py: 1.4, mt: 0.5, borderRadius: '10px', fontSize: '0.95rem', fontWeight: 600 }}
            >
              {loading ? 'Creating account…' : 'Create account'}
            </Button>
          </Stack>

          <Box sx={{ mt: 3.5, pt: 3, borderTop: '1px solid rgba(0,0,0,0.07)', textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#6B6560' }}>
              Already have an account?{' '}
              <Typography component="span" onClick={onSwitch}
                sx={{ color: '#8A2D2E', fontWeight: 700, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
                Sign in
              </Typography>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default SignupForm;
