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
} from '@mui/material';
import { Trophy, Star, Clock, CheckCircle, Zap } from 'lucide-react';
// استيراد المكون الصغير اللي عدلناه سوى لضمان تناسق الألوان
import StatsSection from '../profile/StatsSection'; 

const ProfileTab = ({ userName, stats, rank_name, progress_percentage }) => {
  
  // بيانات الكورسات (مستقبلاً رح نربطها بـ API المهارات اللي رح نجهزه)
  const inProgressCourses = [
    { title: 'React Mastery', progress: 65, icon: <Zap size={20} /> },
    { title: 'Django Backend', progress: 30, icon: <Zap size={20} /> },
  ];

  const completedCourses = ['JavaScript Basics', 'UI/UX Design Fundamentals'];

  return (
    <Box sx={{ p: 1 }}>
      {/* 1. قسم الهوية والإحصائيات الاحترافي */}
      <Paper
        elevation={0}
        sx={{
          p: 1,
          borderRadius: 4,
          bgcolor: 'primary.main', // الخلفية الحمراء الخاصة بـ SkillArena
          color: 'white',
          mb: 4,
          overflow: 'hidden'
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item sx={{ pl: 3, py: 2 }}>
            <Avatar
              src="/my-avatar.png" 
              sx={{
                width: 120,
                height: 120,
                border: '4px solid white',
                boxShadow: 3,
                ml: 2
              }}
            />
          </Grid>
          <Grid item xs>
            {/* استدعاء المكون الاحترافي وتمرير البيانات الحقيقية له */}
            <StatsSection 
              username={userName}
              stats={stats}
              rank_name={rank_name}
              progress_percentage={progress_percentage}
            />
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={4}>
        {/* 2. قسم الإنجازات (Achievements) */}
        <Grid item xs={12} md={4}>
          <Typography variant="h6" sx={{ fontWeight: 900, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Star color="#fbc02d" fill="#fbc02d" /> ACHIEVEMENTS
          </Typography>
          <Paper sx={{ p: 3, borderRadius: 3, border: '2px solid rgba(138, 45, 46, 0.1)' }}>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {/* عرض الأوسمة الحقيقية القادمة من الباك إند */}
                {stats?.badges?.map((badge, index) => (
                  <Avatar key={index} sx={{ bgcolor: 'primary.light', width: 50, height: 50 }}>
                    <Trophy size={24} />
                  </Avatar>
                ))}
              </Box>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                {stats?.badges?.length || 0} / 12 Badges Earned
              </Typography>
            </Stack>
          </Paper>
        </Grid>

        {/* 3. سجل المهام (Quest Log) */}
        <Grid item xs={12} md={8}>
          <Typography variant="h6" sx={{ fontWeight: 900, mb: 2 }}>
            QUEST LOG (COURSES)
          </Typography>

          {/* الكورسات الحالية */}
          <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Clock size={18} color="#ed6c02" /> IN PROGRESS
            </Typography>
            <Stack spacing={3}>
              {inProgressCourses.map((course) => (
                <Box key={course.title}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 800 }}>{course.title}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.main' }}>{course.progress}%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={course.progress} sx={{ height: 10, borderRadius: 5, bgcolor: 'rgba(0,0,0,0.05)' }} />
                </Box>
              ))}
            </Stack>
          </Paper>

          {/* الكورسات المكتملة */}
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircle size={18} color="#2e7d32" /> COMPLETED
            </Typography>
            <Stack spacing={1}>
              {completedCourses.map((course) => (
                <Box key={course} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, bgcolor: 'rgba(46, 125, 50, 0.05)', borderRadius: 2 }}>
                  <CheckCircle size={16} color="#2e7d32" />
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{course}</Typography>
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