/* eslint-disable */
// src/components/tabs/MyCoursesTab.jsx
// My Learning page — same card style as CoursesTab

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Typography, Grid, Card, CardContent,
  Button, Chip, Stack, Paper, LinearProgress,
  Tooltip,
} from '@mui/material';
import { Play, ShieldCheck, CheckCircle2, Clock, Star, MessageCircle } from 'lucide-react';
import CourseDetailPage from './CourseDetailPage';
import VideoPlayerPage  from './VideoPlayerPage';

const MAROON      = '#9A2F2E';
const MAROON_SOFT = 'rgba(154,47,46,0.09)';
const GREEN       = '#2e7d32';
const GOLD        = '#f59e0b';
const API         = 'http://127.0.0.1:8000/api';

const THUMB_COLORS = [
  'linear-gradient(135deg,#1a237e,#283593)',
  'linear-gradient(135deg,#1b5e20,#2e7d32)',
  'linear-gradient(135deg,#4a148c,#6a1b9a)',
  'linear-gradient(135deg,#b71c1c,#c62828)',
  'linear-gradient(135deg,#0d47a1,#1565c0)',
  'linear-gradient(135deg,#33691e,#558b2f)',
];

const StarRow = ({ value, size = 12 }) => (
  <Stack direction="row" spacing={0.2}>
    {[1,2,3,4,5].map(s => (
      <Star key={s} size={size}
        color={value >= s ? GOLD : '#d1ccc0'}
        fill={value >= s ? GOLD : 'transparent'} />
    ))}
  </Stack>
);

const MyCoursesTab = () => {
  const [courses,    setCourses]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [view,       setView]       = useState('list'); // list | detail | player
  const [selectedId, setSelectedId] = useState(null);

  const token = localStorage.getItem('token');
  const auth  = { Authorization: 'Token ' + token };

  const fetchCourses = async () => {
    try {
      const res = await axios.get(`${API}/learner/courses/`, { headers: auth });
      const enrolled = (res.data || []).filter(c => c.enrolled);
      setCourses(enrolled);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCourses(); }, []); // eslint-disable-line

  const inProgress = courses.filter(c => !c.enrollment?.completed);
  const completed  = courses.filter(c =>  c.enrollment?.completed);

  // ── Route to sub-views ───────────────────────────────────────
  if (view === 'detail' && selectedId) {
    return (
      <CourseDetailPage
        courseId={selectedId}
        onBack={() => { setView('list'); fetchCourses(); }}
        onEnrolled={() => fetchCourses()}
        onWatch={(id) => { setSelectedId(id); setView('player'); }}
      />
    );
  }
  if (view === 'player' && selectedId) {
    return (
      <VideoPlayerPage
        courseId={selectedId}
        onBack={() => { setView('list'); fetchCourses(); }}
      />
    );
  }

  if (loading) return (
    <LinearProgress sx={{ m: 2, borderRadius: 2,
      '& .MuiLinearProgress-bar': { bgcolor: MAROON } }} />
  );

  if (courses.length === 0) return (
    <Paper sx={{ p: 5, borderRadius: 3, textAlign: 'center',
      bgcolor: 'rgba(255,255,255,0.5)' }}>
      <Typography sx={{ color: 'text.secondary', mb: 1 }}>
        You haven't enrolled in any courses yet.
      </Typography>
      <Typography variant="caption" sx={{ color: 'text.tertiary' }}>
        Go to Courses tab to find something interesting!
      </Typography>
    </Paper>
  );

  const CourseCard = ({ course }) => {
    const isPaid     = course.is_paid && Number(course.price) > 0;

    // جيب الـ completed lessons من localStorage
    const savedCompleted = (() => {
      try {
        const saved = localStorage.getItem(`completed_${course.id}`);
        return saved ? JSON.parse(saved) : [];
      } catch { return []; }
    })();

    // احسب الـ progress من localStorage إذا في بيانات
    const totalLessons = course.video_count || 1;
    const localProgress = savedCompleted.length > 0
      ? Math.round((savedCompleted.length / totalLessons) * 100)
      : course.enrollment?.progress || 0;

    const isComplete = localProgress >= 100 || course.enrollment?.completed;
    const progress   = localProgress;
    const thumbColor = THUMB_COLORS[course.id % THUMB_COLORS.length];

    return (
      <Card sx={{
        borderRadius: 3,
        border: '0.5px solid rgba(0,0,0,0.09)',
        bgcolor: 'background.paper',
        transition: '0.2s',
        '&:hover': { transform: 'translateY(-3px)', boxShadow: 4 },
        height: '100%', display: 'flex', flexDirection: 'column',
      }}>
        {/* Thumbnail */}
        <Box sx={{
          height: 128, background: thumbColor, position: 'relative',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Box sx={{
            width: 38, height: 38, borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Play size={16} color="#fff" fill="#fff" style={{ marginLeft: 2 }} />
          </Box>

          {/* Completed badge */}
          {isComplete && (
            <Chip
              icon={<CheckCircle2 size={11} />}
              label="Completed"
              size="small"
              sx={{
                position: 'absolute', top: 8, right: 8,
                bgcolor: 'rgba(46,125,50,0.85)', color: '#fff',
                fontWeight: 700, fontSize: '0.65rem', height: 20,
              }}
            />
          )}
        </Box>

        <CardContent sx={{
          flex: 1, p: 1.5, pb: '12px !important',
          display: 'flex', flexDirection: 'column', gap: 0.75,
        }}>
          {/* Price chip */}
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Chip
              label={isPaid ? `SAR ${Number(course.price).toFixed(0)}` : 'Free'}
              size="small"
              sx={{
                height: 18, fontSize: '0.65rem', fontWeight: 700,
                bgcolor: isPaid ? 'rgba(154,47,46,0.08)' : 'rgba(46,125,50,0.08)',
                color:   isPaid ? MAROON : GREEN,
              }}
            />
            {course.tutor_verified && (
              <Tooltip title="Verified instructor">
                <ShieldCheck size={14} color="#1a73e8" />
              </Tooltip>
            )}
          </Stack>

          {/* Title */}
          <Typography sx={{
            fontWeight: 700, fontSize: '0.88rem', lineHeight: 1.35,
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {course.title}
          </Typography>

          {/* Tutor */}
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
              Tutor: {course.tutor_username}
            </Typography>
            {course.tutor_verified && (
              <Typography variant="caption" sx={{ color: '#1a73e8', fontSize: '0.65rem', fontWeight: 600 }}>
                · Verified
              </Typography>
            )}
          </Stack>

          {/* Rating */}
          {course.average_rating > 0 && (
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <StarRow value={Math.round(course.average_rating)} />
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                ({course.rating_count})
              </Typography>
            </Stack>
          )}

          {/* Progress */}
          <Box>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.4 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                Progress
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.7rem', color: MAROON }}>
                {progress}%
              </Typography>
            </Stack>
            <Box sx={{ height: 4, bgcolor: 'rgba(0,0,0,0.08)', borderRadius: 2, overflow: 'hidden' }}>
              <Box sx={{ height: '100%', width: `${progress}%`, bgcolor: MAROON, borderRadius: 2 }} />
            </Box>
          </Box>

          {/* Spacer */}
          <Box sx={{ flex: 1 }} />

          {/* Buttons */}
          <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
            <Button
              variant="outlined" size="small"
              startIcon={<MessageCircle size={13} />}
              onClick={() => { setSelectedId(course.id); setView('detail'); }}
              sx={{
                flex: 1, fontWeight: 600, borderRadius: 1.5, fontSize: '0.75rem',
                borderColor: MAROON_SOFT, color: MAROON,
                '&:hover': { bgcolor: MAROON_SOFT },
              }}
            >
              Details
            </Button>
            <Button
              variant="contained" size="small"
              startIcon={<Play size={13} fill="#fff" />}
              onClick={() => { setSelectedId(course.id); setView('player'); }}
              sx={{
                flex: 1, fontWeight: 700, borderRadius: 1.5, fontSize: '0.75rem',
                bgcolor: MAROON, '&:hover': { bgcolor: '#7a2627' },
              }}
            >
              {isComplete ? 'Watch Again' : 'Watch'}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ p: 1 }}>

      <Typography variant="h6" sx={{ fontWeight: 900, mb: 2.5, color: MAROON }}>
        My Courses ({courses.length})
      </Typography>

      {/* In Progress */}
      {inProgress.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <Clock size={18} color="#ed6c02" />
            <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#ed6c02' }}>
              In Progress ({inProgress.length})
            </Typography>
          </Stack>
          <Grid container spacing={2.5}>
            {inProgress.map(course => (
              <Grid item xs={12} sm={6} md={4} key={course.id}>
                <CourseCard course={course} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <Box>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <CheckCircle2 size={18} color={GREEN} />
            <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: GREEN }}>
              Completed ({completed.length})
            </Typography>
          </Stack>
          <Grid container spacing={2.5}>
            {completed.map(course => (
              <Grid item xs={12} sm={6} md={4} key={course.id}>
                <CourseCard course={course} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default MyCoursesTab;