// src/components/tutor/TutorProfile.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Typography, Paper, Grid,
  Stack, Avatar, Chip, CircularProgress,
} from '@mui/material';
import {
  Zap, ShieldCheck, GraduationCap, Building2,
  BookOpen, Trophy, Star, Users, Video,
} from 'lucide-react';

const MAROON      = '#9A2F2E';
const MAROON_SOFT = 'rgba(154,47,46,0.08)';
const GOLD        = '#FACA07';
const GREEN       = '#2e7d32';
const API         = 'http://127.0.0.1:8000/api';

const RANKS = [
  { name: 'Novice',  min: 0,     max: 999,      color: '#9E9892' },
  { name: 'Warrior', min: 1000,  max: 4999,     color: '#cd7f32' },
  { name: 'Knight',  min: 5000,  max: 14999,    color: '#C0C0C0' },
  { name: 'Master',  min: 15000, max: 49999,    color: GOLD      },
  { name: 'Legend',  min: 50000, max: Infinity, color: '#e91e63' },
];

const getRank = (xp) => RANKS.find(r => xp >= r.min && xp <= r.max) || RANKS[0];

const StatCard = ({ icon: Icon, label, value, color = MAROON }) => (
  <Paper sx={{ p: 2, borderRadius: 2.5, border: `1px solid ${MAROON_SOFT}`, textAlign: 'center' }}>
    <Avatar sx={{ bgcolor: MAROON_SOFT, width: 40, height: 40, mx: 'auto', mb: 1 }}>
      <Icon size={20} color={color} />
    </Avatar>
    <Typography sx={{ fontWeight: 900, fontSize: '1.3rem', color: MAROON }}>{value}</Typography>
    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>{label}</Typography>
  </Paper>
);

const TutorProfile = () => {
  const [profile,  setProfile]  = useState(null);
  const [courses,  setCourses]  = useState([]);
  const [students, setStudents] = useState([]);
  const [verif,    setVerif]    = useState(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const auth = { Authorization: 'Token ' + token };
    Promise.all([
      axios.get(`${API}/accounts/profile/`, { headers: auth }),
      axios.get(`${API}/tutor/courses/list/`, { headers: auth }),
      axios.get(`${API}/accounts/tutor/my-students/`, { headers: auth }),
      axios.get(`${API}/accounts/tutor/verify/status/`, { headers: auth }).catch(() => ({ data: null })),
    ]).then(([pr, cr, sr, vr]) => {
      setProfile(pr.data);
      setCourses(cr.data || []);
      setStudents(sr.data || []);
      setVerif(vr.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []); // eslint-disable-line

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
      <CircularProgress sx={{ color: MAROON }} />
    </Box>
  );

  const xp            = profile?.experience ?? 0;
  const rank          = getRank(xp);
  const nextRank      = RANKS[RANKS.indexOf(rank) + 1];
  const progress      = nextRank ? Math.round(((xp - rank.min) / (nextRank.min - rank.min)) * 100) : 100;
  const username      = profile?.username || localStorage.getItem('username') || 'Tutor';
  const isVerified    = profile?.is_trusted_tutor;
  const totalEnrolled = students.reduce((sum, s) => sum + (s.courses?.length || 0), 0);

  return (
    <Box>
      {/* Hero */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3, background: 'linear-gradient(135deg, #7A1E1E 0%, #4A1010 100%)', color: '#fff' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center">
          <Avatar sx={{ width: 80, height: 80, bgcolor: 'rgba(255,255,255,0.15)', fontSize: '2rem', fontWeight: 900, color: '#fff', border: '3px solid rgba(255,255,255,0.3)' }}>
            {username[0]?.toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap" gap={1}>
              <Typography sx={{ fontWeight: 900, fontSize: '1.4rem', color: '#fff' }}>{username}</Typography>
              {isVerified && (
                <Chip icon={<ShieldCheck size={13} />} label="Verified Instructor" size="small"
                  sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 700, fontSize: '0.75rem' }} />
              )}
              <Chip label={rank.name} size="small" sx={{ bgcolor: GOLD, color: '#000', fontWeight: 900, fontSize: '0.75rem' }} />
            </Stack>
            <Typography sx={{ color: 'rgba(255,255,255,0.65)', mt: 0.5, fontSize: '0.85rem' }}>Instructor · SkillArena</Typography>
          </Box>
          <Box sx={{ textAlign: 'center', bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2, px: 2.5, py: 1.5 }}>
            <Stack direction="row" alignItems="center" spacing={0.75} justifyContent="center">
              <Zap size={18} color={GOLD} fill={GOLD} />
              <Typography sx={{ fontWeight: 900, fontSize: '1.6rem', color: GOLD }}>{xp}</Typography>
            </Stack>
            <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.72rem' }}>Total XP</Typography>
          </Box>
        </Stack>
        <Box sx={{ mt: 2.5, maxWidth: 280 }}>
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
            <Typography sx={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>{rank.name}</Typography>
            {nextRank && <Typography sx={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>{nextRank.min - xp} XP to {nextRank.name}</Typography>}
          </Stack>
          <Box sx={{ height: 8, bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 4, overflow: 'hidden' }}>
            <Box sx={{ height: '100%', width: `${progress}%`, bgcolor: GOLD, borderRadius: 4, transition: '0.5s' }} />
          </Box>
        </Box>
      </Paper>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}><StatCard icon={Video}  label="Courses"     value={courses.length} /></Grid>
        <Grid item xs={6} sm={3}><StatCard icon={Users}  label="Students"    value={students.length} /></Grid>
        <Grid item xs={6} sm={3}><StatCard icon={Star}   label="Enrollments" value={totalEnrolled} color={GOLD} /></Grid>
        <Grid item xs={6} sm={3}><StatCard icon={Trophy} label="Rank"        value={rank.name} color={rank.color} /></Grid>
      </Grid>

      {/* Verification */}
      {verif?.submitted && verif?.status === 'approved' && (
        <Paper sx={{ p: 2.5, borderRadius: 2.5, border: '1.5px solid rgba(26,115,232,0.2)', bgcolor: 'rgba(26,115,232,0.04)' }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
            <ShieldCheck size={18} color="#1a73e8" />
            <Typography sx={{ fontWeight: 700, color: '#1a73e8' }}>Verified Instructor</Typography>
            <Chip label="✓ Approved" size="small" sx={{ bgcolor: 'rgba(46,125,50,0.1)', color: GREEN, fontWeight: 700 }} />
          </Stack>
          <Grid container spacing={2}>
            {[
              [GraduationCap, 'Credential',  verif.credential_type],
              [Building2,    'Institution', verif.institution],
              [BookOpen,     'Field',       verif.field_of_study],
              [Zap,          'Year',        verif.graduation_year],
            ].map(([Icon, label, value]) => value && (
              <Grid item xs={6} sm={3} key={label}>
                <Stack direction="row" spacing={0.75} alignItems="flex-start">
                  <Icon size={14} color="#1a73e8" style={{ marginTop: 2, flexShrink: 0 }} />
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>{label}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.82rem' }}>{value}</Typography>
                  </Box>
                </Stack>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}
    </Box>
  );
};

export default TutorProfile;