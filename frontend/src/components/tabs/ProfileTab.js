import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Grid,
  LinearProgress,
  Chip,
  Stack,
  Tooltip
} from '@mui/material';
import { Trophy, Star, Clock, CheckCircle, Zap, ShieldCheck } from 'lucide-react';

// تأكدي أن المسار صحيح بعد نقل المجلدات
import StatsSection from '../profile/StatsSection'; 

const ProfileTab = ({ userName, stats, rank_name, progress_percentage }) => {
  
  // بيانات الكورسات - يفضل مستقبلاً جلبها من stats.active_courses إذا كانت موجودة
  const inProgressCourses = stats?.in_progress || [
    { title: 'React Mastery', progress: 65, icon: <Zap size={20} /> },
    { title: 'Django Backend', progress: 30, icon: <Zap size={20} /> },
  ];

  const completedCourses = stats?.completed_names || ['JavaScript Basics', 'UI/UX Design Fundamentals'];

  return (
    <Box sx={{ p: 1 }}>
      {/* 1. Header: Identity & Real-time Stats */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 4,
          bgcolor: 'primary.main',
          color: 'white',
          mb: 4,
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #8A2D2E 0%, #B23A3B 100%)',
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            <Avatar
              src={stats?.profile_picture || "/my-avatar.png"} 
              sx={{
                width: { xs: 80, md: 120 },
                height: { xs: 80, md: 120 },
                border: '4px solid rgba(255,255,255,0.3)',
                boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
              }}
            >
              {userName?.charAt(0).toUpperCase()}
            </Avatar>
          </Grid>
          <Grid item xs>
            <StatsSection 
              username={userName || 'User'}
              stats={stats}
              rank_name={rank_name || stats?.rank}
              progress_percentage={progress_percentage || stats?.level_progress}
            />
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={4}>
        {/* 2. Achievements Section */}
        <Grid item xs={12} md={4}>
          <Typography variant="h6" sx={{ fontWeight: 900, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Star color="#fbc02d" fill="#fbc02d" /> ACHIEVEMENTS
          </Typography>
          <Paper sx={{ p: 3, borderRadius: 3, border: '2px solid rgba(138, 45, 46, 0.1)', minHeight: '200px' }}>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                {stats?.badges && stats.badges.length > 0 ? (
                  stats.badges.map((badge, index) => (
                    <Tooltip title={badge.name || "Badge"} key={index}>
                      <Avatar sx={{ bgcolor: 'primary.light', width: 50, height: 50, cursor: 'pointer', transition: '0.3s', '&:hover': { transform: 'scale(1.1)' } }}>
                        <Trophy size={24} />
                      </Avatar>
                    </Tooltip>
                  ))
                ) : (
                  // حالة عدم وجود أوسمة (Placeholders شفافة)
                  [1, 2, 3].map((i) => (
                    <Avatar key={i} sx={{ bgcolor: 'rgba(0,0,0,0.05)', width: 50, height: 50 }}>
                      <ShieldCheck size={24} color="#ccc" />
                    </Avatar>
                  ))
                )}
              </Box>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700, textAlign: 'center', mt: 2 }}>
                {stats?.badges?.length || 0} / 12 Badges Earned
              </Typography>
            </Stack>
          </Paper>
        </Grid>

        {/* 3. Quest Log Section */}
        <Grid item xs={12} md={8}>
          <Typography variant="h6" sx={{ fontWeight: 900, mb: 2 }}>
            QUEST LOG (COURSES)
          </Typography>

          {/* In Progress */}
          <Paper sx={{ p: 3, borderRadius: 3, mb: 3, border: '1px solid rgba(0,0,0,0.05)' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Clock size={18} color="#ed6c02" /> ACTIVE QUESTS
            </Typography>
            <Stack spacing={4}>
              {inProgressCourses.map((course, idx) => (
                <Box key={idx}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 800, letterSpacing: 0.5 }}>{course.title}</Typography>
                    <Chip 
                      label={`${course.progress}%`} 
                      size="small" 
                      sx={{ fontWeight: 900, bgcolor: 'primary.main', color: 'white' }} 
                    />
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={course.progress} 
                    sx={{ 
                      height: 10, 
                      borderRadius: 5, 
                      bgcolor: 'rgba(138, 45, 46, 0.1)',
                      '& .MuiLinearProgress-bar': { borderRadius: 5 }
                    }} 
                  />
                </Box>
              ))}
            </Stack>
          </Paper>

          {/* Completed */}
          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid rgba(0,0,0,0.05)' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircle size={18} color="#2e7d32" /> CONQUERED
            </Typography>
            <Grid container spacing={2}>
              {completedCourses.map((course, idx) => (
                <Grid item xs={12} sm={6} key={idx}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2, 
                    p: 2, 
                    bgcolor: 'rgba(46, 125, 50, 0.05)', 
                    borderRadius: 2,
                    border: '1px solid rgba(46, 125, 50, 0.1)'
                  }}>
                    <CheckCircle size={20} color="#2e7d32" />
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{course}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProfileTab;