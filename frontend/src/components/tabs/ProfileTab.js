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

const ProfileTab = ({ userName, userXP, stats, rank_name, progress_percentage, inProgressCourses = [], completedCourses = [] }) => {
  const actualXP = userXP ?? 0;
  const actualBadges = stats?.badges || [];
  const actualStats = stats?.stats || { level: 0, experience: 0, quests_completed: 0 };
  const inProgress = Array.isArray(inProgressCourses) ? inProgressCourses : [];
  const completed = Array.isArray(completedCourses) ? completedCourses : [];

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
              src={stats?.avatar_url || undefined}
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
              stats={actualStats}
              rank_name={actualXP === 0 ? "BEGINNER" : (rank_name || "WARRIOR")}
              progress_percentage={actualXP === 0 ? 0 : (progress_percentage || 0)}
              experience={actualXP}
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
          <Paper sx={{ p: 3, borderRadius: 3, border: '2px solid rgba(154, 47, 46, 0.1)', bgcolor: 'rgba(255, 255, 255, 0.6)' }}>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {/* عرض الأوسمة الحقيقية القادمة من الباك إند */}
                {actualBadges.length > 0 ? (
                  actualBadges.map((badge, index) => (
                    <Avatar key={index} sx={{ bgcolor: 'primary.light', width: 50, height: 50 }}>
                      <Trophy size={24} />
                    </Avatar>
                  ))
                ) : (
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                    No badges earned yet. Start learning to earn your first badge!
                  </Typography>
                )}
              </Box>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                {actualBadges.length} / 12 Badges Earned
              </Typography>
            </Stack>
          </Paper>
        </Grid>

        {/* 3. سجل المهام (Quest Log) */}
        <Grid item xs={12} md={8}>
          <Typography variant="h6" sx={{ fontWeight: 900, mb: 2 }}>
            QUEST LOG (COURSES)
          </Typography>

          {/* الكورسات الحالية - من الـ API */}
          <Paper sx={{ p: 3, borderRadius: 3, mb: 3, border: '2px solid rgba(138, 45, 46, 0.1)', bgcolor: 'rgba(255, 255, 255, 0.6)' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Clock size={18} color="#ed6c02" /> IN PROGRESS
            </Typography>
            {inProgress.length === 0 ? (
              <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>No courses in progress. Enroll in a course to start!</Typography>
            ) : (
              <Stack spacing={3}>
                {inProgress.map((course) => (
                  <Box key={course.id || course.title}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 800 }}>{course.title}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.main' }}>{course.progress ?? 0}%</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={course.progress ?? 0} sx={{ height: 10, borderRadius: 5, bgcolor: 'rgba(0,0,0,0.05)' }} />
                  </Box>
                ))}
              </Stack>
            )}
          </Paper>

          {/* الكورسات المكتملة - من الـ API */}
          <Paper sx={{ p: 3, borderRadius: 3, border: '2px solid rgba(154, 47, 46, 0.1)', bgcolor: 'rgba(255, 255, 255, 0.6)' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircle size={18} color="#2e7d32" /> COMPLETED
            </Typography>
            {completed.length === 0 ? (
              <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>No completed courses yet.</Typography>
            ) : (
              <Stack spacing={1}>
                {completed.map((c) => (
                  <Box key={c.id || c.title} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, bgcolor: 'rgba(46, 125, 50, 0.05)', borderRadius: 2 }}>
                    <CheckCircle size={16} color="#2e7d32" />
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{typeof c === 'string' ? c : c.title}</Typography>
                  </Box>
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProfileTab;