// src/components/tutor/VerificationSubmit.jsx
// تيوتر يرفع شهادته → يصير Verified تلقائياً بدون موافقة أدمن
// is_trusted_tutor = true بمجرد وجود certificate في الـ DB

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Box, Typography, Paper, Stack, Chip, Button,
  TextField, MenuItem, Alert, LinearProgress, Avatar,
} from '@mui/material';
import {
  ShieldCheck, Upload, FileText, GraduationCap,
  Building2, BookOpen, CheckCircle2, RefreshCw,
} from 'lucide-react';

const MAROON      = '#9A2F2E';
const MAROON_DARK = '#7a2627';
const MAROON_SOFT = 'rgba(154,47,46,0.09)';
const GREEN       = '#2e7d32';
const API         = 'http://127.0.0.1:8000/api/accounts';

const CREDENTIAL_TYPES = [
  { value: 'bachelor',     label: "Bachelor's Degree"       },
  { value: 'master',       label: "Master's Degree"         },
  { value: 'phd',          label: 'PhD / Doctorate'         },
  { value: 'professional', label: 'Professional Certificate'},
  { value: 'other',        label: 'Other'                   },
];

const VerificationSubmit = () => {
  const [isVerified,  setIsVerified]  = useState(false);
  const [loading,     setLoading]     = useState(true);
  const [submitting,  setSubmitting]  = useState(false);
  const [success,     setSuccess]     = useState('');
  const [error,       setError]       = useState('');

  // Form fields
  const [credType,   setCredType]   = useState('bachelor');
  const [institution, setInst]      = useState('');
  const [gradYear,   setGradYear]   = useState('');
  const [field,      setField]      = useState('');
  const [file,       setFile]       = useState(null);

  const fileRef = useRef();
  const token   = localStorage.getItem('token');
  const auth    = { Authorization: 'Token ' + token };

  // Check current verified status on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${API}/profile/`, { headers: auth });
        setIsVerified(res.data?.is_trusted_tutor === true);
      } catch {}
      finally { setLoading(false); }
    })();
  }, []); // eslint-disable-line

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const allowed = ['.pdf', '.jpg', '.jpeg', '.png'];
    const ext = '.' + f.name.split('.').pop().toLowerCase();
    if (!allowed.includes(ext)) {
      setError('Only PDF, JPG, or PNG files are accepted.');
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError('File must be under 10 MB.');
      return;
    }
    setError('');
    setFile(f);
  };

  const handleSubmit = async () => {
    setError('');

    // Simple validation — only check if fields are empty
    if (!file)              { setError('Please upload your credential document.'); return; }
    if (!institution.trim()){ setError('Please enter the institution name.'); return; }
    if (!field.trim())      { setError('Please enter your field of study.'); return; }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('certificate',     file);          // ← نرفع مباشرة على User.certificate
      fd.append('credential_type', credType);
      fd.append('institution',     institution.trim());
      fd.append('field_of_study',  field.trim());
      if (gradYear) fd.append('graduation_year', gradYear);

      // نحدّث الـ profile مباشرة — يضع الملف في certificate field
      await axios.patch(`${API}/profile/`, fd, {
        headers: { ...auth, 'Content-Type': 'multipart/form-data' },
      });

      setIsVerified(true);
      setSuccess('');
    } catch (e) {
      setError(e.response?.data?.error || e.response?.data?.detail || 'Save failed. Please try again.');
    }
    setSubmitting(false);
  };

  if (loading) return <LinearProgress sx={{ m: 2, borderRadius: 2 }} />;

  // ── Already verified ──────────────────────────────────────────
  if (isVerified) {
    return (
      <Box sx={{ maxWidth: 520 }}>
        <Paper sx={{
          p: 3, borderRadius: 3,
          border: '1.5px solid rgba(26,115,232,0.2)',
          bgcolor: 'rgba(26,115,232,0.04)',
        }}>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
            <Avatar sx={{ bgcolor: 'rgba(26,115,232,0.12)', width: 44, height: 44 }}>
              <ShieldCheck size={24} color="#1a73e8" />
            </Avatar>
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: '1rem' }}>
                You are a Verified Instructor ✓
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Your Verified badge is active on your profile and courses
              </Typography>
            </Box>
          </Stack>

          <Stack spacing={0.75}>
            {[
              'Verified badge shown on all your courses',
              'Learners can see your credentials',
              'Higher trust and visibility on the platform',
            ].map((t) => (
              <Stack key={t} direction="row" spacing={1} alignItems="center">
                <CheckCircle2 size={14} color={GREEN} />
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>{t}</Typography>
              </Stack>
            ))}
          </Stack>

          <Button
            variant="outlined" size="small"
            startIcon={<RefreshCw size={14} />}
            onClick={() => setIsVerified(false)}
            sx={{ mt: 2, borderColor: 'rgba(0,0,0,0.15)', color: 'text.secondary',
              borderRadius: 2, fontSize: '0.78rem' }}
          >
            Update credentials
          </Button>
        </Paper>
      </Box>
    );
  }

  // ── Form ──────────────────────────────────────────────────────
  return (
    <Box sx={{ maxWidth: 520 }}>

      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
        <Avatar sx={{ bgcolor: MAROON_SOFT, width: 44, height: 44 }}>
          <ShieldCheck size={24} color={MAROON} />
        </Avatar>
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: '1rem' }}>
            Get Verified
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Add your credentials — you'll be verified instantly
          </Typography>
        </Box>
      </Stack>

      {/* What it means */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2.5,
        border: `1px solid ${MAROON_SOFT}`, bgcolor: '#fafaf9' }}>
        <Typography sx={{ fontWeight: 700, mb: 1, fontSize: '0.88rem' }}>
          ✅ What happens after saving
        </Typography>
        <Stack spacing={0.5}>
          {[
            'Verified badge appears instantly on your profile',
            'Badge shown on all your course cards',
            'Your education info is visible to learners',
            'No waiting — no admin approval needed',
          ].map((t) => (
            <Stack key={t} direction="row" spacing={1} alignItems="center">
              <CheckCircle2 size={13} color={GREEN} />
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.82rem' }}>{t}</Typography>
            </Stack>
          ))}
        </Stack>
      </Paper>

      {/* Form */}
      <Stack spacing={2.5}>

        {/* Credential type */}
        <Box>
          <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 0.75 }}>
            <GraduationCap size={15} color={MAROON} />
            <Typography sx={{ fontWeight: 600, fontSize: '0.85rem' }}>Credential Type</Typography>
          </Stack>
          <TextField
            select fullWidth size="small"
            value={credType}
            onChange={(e) => setCredType(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root.Mui-focused fieldset': { borderColor: MAROON } }}
          >
            {CREDENTIAL_TYPES.map((c) => (
              <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>
            ))}
          </TextField>
        </Box>

        {/* Institution */}
        <Box>
          <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 0.75 }}>
            <Building2 size={15} color={MAROON} />
            <Typography sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
              Institution / University <span style={{ color: '#d32f2f' }}>*</span>
            </Typography>
          </Stack>
          <TextField
            fullWidth size="small"
            placeholder="e.g. Arab Open University"
            value={institution}
            onChange={(e) => setInst(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root.Mui-focused fieldset': { borderColor: MAROON } }}
          />
        </Box>

        {/* Field of study + Graduation year side by side */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Box sx={{ flex: 1 }}>
            <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 0.75 }}>
              <BookOpen size={15} color={MAROON} />
              <Typography sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
                Field of Study <span style={{ color: '#d32f2f' }}>*</span>
              </Typography>
            </Stack>
            <TextField
              fullWidth size="small"
              placeholder="e.g. Computer Science"
              value={field}
              onChange={(e) => setField(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root.Mui-focused fieldset': { borderColor: MAROON } }}
            />
          </Box>
          <Box sx={{ width: { xs: '100%', sm: 130 } }}>
            <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', mb: 0.75 }}>
              Year <Typography component="span" sx={{ color: 'text.secondary', fontSize: '0.78rem' }}>(optional)</Typography>
            </Typography>
            <TextField
              fullWidth size="small"
              placeholder="2022"
              value={gradYear}
              onChange={(e) => setGradYear(e.target.value.replace(/\D/g, '').slice(0, 4))}
              sx={{ '& .MuiOutlinedInput-root.Mui-focused fieldset': { borderColor: MAROON } }}
            />
          </Box>
        </Stack>

        {/* Document upload */}
        <Box>
          <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 0.75 }}>
            <Upload size={15} color={MAROON} />
            <Typography sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
              Certificate / Degree Document <span style={{ color: '#d32f2f' }}>*</span>
            </Typography>
          </Stack>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
            PDF, JPG or PNG · max 10 MB
          </Typography>

          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            ref={fileRef}
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />

          {!file ? (
            <Paper
              onClick={() => fileRef.current?.click()}
              sx={{
                p: 3, borderRadius: 2, textAlign: 'center', cursor: 'pointer',
                border: `1.5px dashed rgba(154,47,46,0.25)`,
                bgcolor: '#fafaf9',
                transition: '0.15s',
                '&:hover': { borderColor: MAROON, bgcolor: MAROON_SOFT },
              }}
            >
              <Upload size={26} color={MAROON} style={{ marginBottom: 6 }} />
              <Typography sx={{ fontWeight: 600, color: MAROON, fontSize: '0.85rem' }}>
                Click to upload
              </Typography>
            </Paper>
          ) : (
            <Paper sx={{
              p: 1.75, borderRadius: 2,
              border: '1.5px solid rgba(46,125,50,0.3)',
              bgcolor: 'rgba(46,125,50,0.04)',
            }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Stack direction="row" alignItems="center" spacing={1.25}>
                  <FileText size={20} color={GREEN} />
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.85rem' }}>{file.name}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {(file.size / 1024).toFixed(0)} KB
                    </Typography>
                  </Box>
                </Stack>
                <Button size="small" variant="outlined"
                  onClick={() => { setFile(null); fileRef.current.value = ''; }}
                  sx={{ color: MAROON, borderColor: MAROON, borderRadius: 1.5, fontSize: '0.75rem' }}>
                  Change
                </Button>
              </Stack>
            </Paper>
          )}
        </Box>

        {/* Error */}
        {error && (
          <Alert severity="error" onClose={() => setError('')} sx={{ borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* Submit */}
        <Button
          variant="contained" fullWidth size="large"
          onClick={handleSubmit}
          disabled={submitting}
          startIcon={submitting
            ? null
            : <ShieldCheck size={18} />
          }
          sx={{
            bgcolor: MAROON, fontWeight: 800, borderRadius: 2.5, py: 1.4,
            '&:hover': { bgcolor: MAROON_DARK },
            '&:disabled': { bgcolor: 'rgba(0,0,0,0.12)' },
          }}
        >
          {submitting ? 'Saving…' : 'Save & Get Verified Instantly'}
        </Button>

        <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'center', display: 'block' }}>
          🔒 Your document is stored securely on SkillArena servers.
        </Typography>
      </Stack>
    </Box>
  );
};

export default VerificationSubmit;