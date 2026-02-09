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
  Divider,
} from '@mui/material';
import { Trophy, Star, Clock, CheckCircle, Zap } from 'lucide-react';

const ProfileTab = ({ userName = 'Hero Gamer', userXP = 1250 }) => {
  // بيانات تجريبية للكورسات
  const inProgressCourses = [
    { title: 'React Mastery', progress: 65, icon: <Zap size={20} /> },
    { title: 'Django Backend', progress: 30, icon: <Zap size={20} /> },
  ];

  const completedCourses = ['JavaScript Basics', 'UI/UX Design Fundamentals'];

  return (
    <Box sx={{ p: 1 }}>
      {/* 1. قسم الهوية (الصورة والاسم) */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 4,
          bgcolor: 'primary.main',
          color: 'white',
          mb: 4,
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            <Avatar
              src="/my-avatar.png" // ضعي صورتك هنا في مجلد public
              sx={{
                width: 100,
                height: 100,
                border: '4px solid white',
                boxShadow: 3,
              }}
            />
          </Grid>
          <Grid item xs>
            <Typography variant="h4" sx={{ fontWeight: 900 }}>
              {userName}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <Chip
                label="Level 12 Warrior"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  fontWeight: 800,
                }}
              />
              <Chip
                icon={<Trophy size={16} color="gold" />}
                label="Top 10% this week"
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
              />
            </Stack>
          </Grid>
          <Grid item>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h3" sx={{ fontWeight: 900 }}>
                {userXP}
              </Typography>
              <Typography
                variant="caption"
                sx={{ fontWeight: 800, opacity: 0.8 }}
              >
                TOTAL XP
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={4}>
        {/* 2. قسم الإنجازات والبادجات */}
        <Grid item xs={12} md={4}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 900,
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Star color="#fbc02d" fill="#fbc02d" /> ACHIEVEMENTS
          </Typography>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              border: '2px solid rgba(138, 45, 46, 0.1)',
            }}
          >
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {/* بادجات افتراضية */}
                {[1, 2, 3, 4].map((i) => (
                  <Avatar
                    key={i}
                    sx={{ bgcolor: 'primary.light', width: 50, height: 50 }}
                  >
                    <Trophy size={24} />
                  </Avatar>
                ))}
              </Box>
              <Typography
                variant="body2"
                sx={{ color: 'text.secondary', fontWeight: 700 }}
              >
                4 / 12 Badges Earned
              </Typography>
            </Stack>
          </Paper>
        </Grid>

        {/* 3. قسم الكورسات (In Progress & Completed) */}
        <Grid item xs={12} md={8}>
          <Typography variant="h6" sx={{ fontWeight: 900, mb: 2 }}>
            QUEST LOG (COURSES)
          </Typography>

          {/* In Progress */}
          <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 800,
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Clock size={18} color="#ed6c02" /> IN PROGRESS
            </Typography>
            <Stack spacing={3}>
              {inProgressCourses.map((course) => (
                <Box key={course.title}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 800 }}>
                      {course.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 800, color: 'primary.main' }}
                    >
                      {course.progress}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={course.progress}
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                </Box>
              ))}
            </Stack>
          </Paper>

          {/* Completed */}
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 800,
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <CheckCircle size={18} color="#2e7d32" /> COMPLETED
            </Typography>
            <Stack spacing={1}>
              {completedCourses.map((course) => (
                <Box
                  key={course}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 1.5,
                    bgcolor: 'rgba(46, 125, 50, 0.05)',
                    borderRadius: 2,
                  }}
                >
                  <CheckCircle size={16} color="#2e7d32" />
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {course}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProfileTab;
