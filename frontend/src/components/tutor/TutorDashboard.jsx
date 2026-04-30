// frontend/src/components/tutor/TutorDashboard.jsx
// أضيف tab "Verification" للسايدبار

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Typography, List, ListItemButton, ListItemIcon,
  ListItemText, Tabs, Tab, Stack, Chip,
} from '@mui/material';
import {
  Users, Video, HelpCircle, User, BarChart2,
  CreditCard, ShieldCheck, Zap, ChevronRight,
} from 'lucide-react';
import Logo from '../common/Logo';


import MyStudents          from './MyStudents';
import TutorProfile        from './TutorProfile';
import AIInsights          from './AIInsights';
import VideoUpload         from './VideoUpload';
import Quizzes             from './Quizzes';
import BankAccount         from './BankAccount';
import VerificationSubmit  from './VerificationSubmit';   // ← جديد

const BRAND      = '#8A2D2E';
const BRAND_SOFT = 'rgba(138,45,46,0.07)';
const GOLD       = '#FACA07';
const SIDEBAR_W  = 220;

const NAV = [
  { id: 0, label: 'My Students',   short: 'Students', icon: Users,       sub: "Track students' activity" },
  { id: 1, label: 'My Courses',    short: 'Courses',  icon: Video,       sub: 'Publish and manage courses' },
  { id: 2, label: 'Quizzes',       short: 'Quizzes',  icon: HelpCircle,  sub: 'Create quizzes for learners' },
  { id: 3, label: 'Profile',       short: 'Profile',  icon: User,        sub: 'Your public profile' },
  { id: 4, label: 'AI Insights',   short: 'Insights', icon: BarChart2,   sub: 'Smart analytics dashboard', isAI: true },
  { id: 5, label: 'Bank Account',  short: 'Bank',     icon: CreditCard,  sub: 'Earnings & payments' },
  { id: 6, label: 'Verification',  short: 'Verify',   icon: ShieldCheck, sub: 'Get your Verified badge' },  // ← جديد
];


const TutorDashboard = () => {
  const [tab,            setTab]            = useState(0);
  const [profile,        setProfile]        = useState(null);
  const [isTrustedTutor, setIsTrustedTutor] = useState(false);
  // حالة الطلب — عشان نحط badge على الـ tab
  const [verifStatus,    setVerifStatus]    = useState(null); // null | pending | approved | rejected

  const current = NAV.find(i => i.id === tab) || NAV[0];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const auth = { Authorization: 'Token ' + token };

    // جيب البروفايل
    axios.get('http://127.0.0.1:8000/api/accounts/profile/', { headers: auth })
      .then(res => {
        setProfile(res.data);
        setIsTrustedTutor(res.data?.is_trusted_tutor === true);
      }).catch(() => {});

    // جيب حالة التوثيق
    axios.get('http://127.0.0.1:8000/api/accounts/tutor/verify/status/', { headers: auth })
      .then(res => setVerifStatus(res.data?.status || null))
      .catch(() => {});
  }, []);

  const userName = profile?.username || localStorage.getItem('username') || 'Tutor';

  const renderTab = () => {
    if (tab === 0) return <MyStudents />;
    if (tab === 1) return <VideoUpload />;
    if (tab === 2) return <Quizzes />;
    if (tab === 3) return <TutorProfile />;
    if (tab === 4) return <AIInsights />;
    if (tab === 5) return <BankAccount />;
    if (tab === 6) return <VerificationSubmit />;
    return null;
  };

  // ── Badge colour for Verification tab ───────────────────────────
  const verifBadge = () => {
    if (verifStatus === 'approved') return { label: '✓',        bg: 'rgba(46,125,50,0.15)', color: '#2e7d32' };
    if (verifStatus === 'pending')  return { label: '…',        bg: 'rgba(237,108,2,0.15)', color: '#ed6c02' };
    if (verifStatus === 'rejected') return { label: '!',        bg: 'rgba(154,47,46,0.15)', color: BRAND    };
    return null;
  };

  return (
    <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 60px)', bgcolor: '#F4F2EF' }}>

      {/* ──────────── Sidebar ──────────── */}
      <Box sx={{
        width: SIDEBAR_W, flexShrink: 0,
        bgcolor: '#fff',
        borderRight: '1px solid rgba(0,0,0,0.07)',
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        pt: 2.5, pb: 4, px: 1.5,
        position: 'sticky', top: 60, height: 'calc(100vh - 60px)',
        overflowY: 'auto',
      }}>

        {/* XP pill */}
        <Box sx={{ mx: 0.5, mb: 3, px: 1.75, py: 1.25, borderRadius: '12px',
          bgcolor: '#FEFCE8', border: '1px solid rgba(250,202,7,0.3)' }}>
          <Stack direction="row" alignItems="center" spacing={0.75}>
            <Zap size={15} color="#C8970A" fill={GOLD} />
            <Box sx={{ flexGrow: 1 }}>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#9E9892', letterSpacing: '0.05em', lineHeight: 1 }}>
                  {profile?.rank_name || 'Tutor'}
                </Typography>
                {isTrustedTutor && <ShieldCheck size={12} color={BRAND} />}
              </Stack>
              <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#7A5800', lineHeight: 1.3 }}>
                {profile?.experience ?? 0} XP
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Typography sx={{ px: 1.5, mb: 1, fontSize: '0.66rem', fontWeight: 700, letterSpacing: '0.12em', color: '#B5B0AB', textTransform: 'uppercase' }}>
          Navigation
        </Typography>

        <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {NAV.map(it => {
            const Icon   = it.icon;
            const active = tab === it.id;
            const vBadge = it.id === 6 ? verifBadge() : null;
            return (
              <ListItemButton key={it.id} onClick={() => setTab(it.id)}
                sx={{
                  borderRadius: '10px', py: 1, px: 1.5,
                  bgcolor: active ? BRAND_SOFT : 'transparent',
                  color:   active ? BRAND     : '#44403C',
                  '&:hover': { bgcolor: active ? BRAND_SOFT : 'rgba(0,0,0,0.04)', color: active ? BRAND : '#1A1614' },
                  transition: 'all 0.15s',
                }}
              >
                <ListItemIcon sx={{ minWidth: 34, color: active ? BRAND : '#9E9892' }}>
                  <Icon size={17} />
                </ListItemIcon>
                <ListItemText
                  primary={it.label}
                  primaryTypographyProps={{ fontWeight: active ? 700 : 500, fontSize: '0.865rem', letterSpacing: '-0.01em' }}
                />
                {/* AI chip */}
                {it.isAI && (
                  <Chip label="AI" size="small" sx={{ height: 17, fontSize: '0.58rem', fontWeight: 700, px: 0.25,
                    bgcolor: active ? BRAND : 'rgba(138,45,46,0.1)', color: active ? '#fff' : BRAND }} />
                )}
                {/* Verification status badge */}
                {vBadge && (
                  <Chip
                    label={vBadge.label} size="small"
                    sx={{ height: 17, fontSize: '0.65rem', fontWeight: 800, px: 0.25,
                      bgcolor: vBadge.bg, color: vBadge.color, minWidth: 20 }}
                  />
                )}
                {active && !it.isAI && it.id !== 6 && <ChevronRight size={14} color={BRAND} style={{ flexShrink: 0 }} />}
              </ListItemButton>
            );
          })}
        </List>
      </Box>

      {/* ──────────── Main content ──────────── */}
      <Box sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>

        {/* Page title bar */}
        <Box sx={{ bgcolor: '#fff', borderBottom: '1px solid rgba(0,0,0,0.07)', px: { xs: 2.5, md: 4 }, py: 1.25, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Logo height={28} />
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#1A1614', fontSize: '0.88rem' }}>{current.label}</Typography>
              <Typography variant="caption" sx={{ color: '#9E9892' }}>{current.sub}</Typography>
            </Box>
            {isTrustedTutor && (
              <Stack direction="row" alignItems="center" spacing={0.5}
                sx={{ bgcolor: 'rgba(138,45,46,0.06)', borderRadius: '99px', px: 1.25, py: 0.4, border: '1px solid rgba(138,45,46,0.12)' }}>
                <ShieldCheck size={13} color={BRAND} />
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: BRAND }}>Verified</Typography>
              </Stack>
            )}
            <Typography sx={{ fontSize: '0.78rem', color: '#B5B0AB', fontWeight: 500 }}>{userName} · Instructor</Typography>
          </Stack>
        </Box>

        {/* Mobile tabs */}
        <Box sx={{ display: { xs: 'block', md: 'none' }, bgcolor: '#fff', borderBottom: '1px solid rgba(0,0,0,0.07)', px: 1 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto"
            sx={{ '& .MuiTab-root': { minWidth: 'auto', px: 1.5, py: 1.25, fontSize: '0.78rem' } }}>
            {NAV.map(it => <Tab key={it.id} value={it.id} label={it.short} />)}
          </Tabs>
        </Box>

        {/* Page content */}
        <Box sx={{ flexGrow: 1, px: { xs: 2, md: 4 }, py: { xs: 2.5, md: 3.5 } }}>
          {renderTab()}
        </Box>
      </Box>
    </Box>
  );
};

export default TutorDashboard;