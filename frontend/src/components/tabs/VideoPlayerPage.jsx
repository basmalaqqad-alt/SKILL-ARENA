// src/components/tabs/VideoPlayerPage.jsx
// صفحة المشاهدة — فيديو + سايدبار navigation — تُفتح بعد التسجيل

import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Typography, Stack, Chip, Button, Paper,
  IconButton, LinearProgress, Tooltip, Collapse,
} from '@mui/material';
import {
  ArrowLeft, Play, Pause, Volume2, Maximize,
  CheckCircle2, Circle, Lock, BookOpen, FileText,
  Download, ChevronDown, ChevronUp, HelpCircle,
  SkipForward, SkipBack,
} from 'lucide-react';

const MAROON      = '#9A2F2E';
const MAROON_SOFT = 'rgba(154,47,46,0.08)';
const GREEN       = '#2e7d32';
const API         = 'http://127.0.0.1:8000/api';

// ── Build a flat lesson list from course data ─────────────────────
const buildLessonList = (course) => {
  const lessons = [];

  // Main video (always accessible)
  if (course.video_file || course.video_url) {
    lessons.push({
      id:         'main',
      title:      'Introduction',
      url:        course.video_url || null,
      sectionName: null,
      has_quiz:   false,
      accessible: true,
      isMain:     true,
    });
  }

  // Sections → their videos
  (course.sections || []).forEach(sec => {
    (sec.videos || []).forEach((v, i) => {
      lessons.push({
        id:          v.id,
        title:       v.title || `Lesson ${i + 1}`,
        url:         v.video_url || null,
        sectionName: sec.title,
        has_quiz:    v.has_quiz,
        accessible:  true,   // already enrolled
        duration:    v.duration_seconds,
      });
    });
  });

  // Flat extra videos
  (course.extra_videos || []).filter(v => !v.section).forEach((v, i) => {
    lessons.push({
      id:          v.id,
      title:       v.title || `Lesson ${i + 2}`,
      url:         v.video_url || null,
      sectionName: null,
      has_quiz:    v.has_quiz,
      accessible:  true,
    });
  });

  return lessons;
};

// ── Lesson item in sidebar ────────────────────────────────────────
const SidebarLesson = ({ lesson, isActive, isCompleted, onClick }) => (
  <Box
    onClick={() => lesson.accessible && onClick(lesson)}
    sx={{
      display: 'flex', alignItems: 'center', gap: 1,
      px: 1.5, py: 0.875,
      cursor: lesson.accessible ? 'pointer' : 'default',
      bgcolor: isActive ? MAROON_SOFT : 'transparent',
      borderLeft: isActive ? `2px solid ${MAROON}` : '2px solid transparent',
      '&:hover': lesson.accessible && !isActive ? { bgcolor: 'rgba(0,0,0,0.03)' } : {},
      transition: '0.12s',
    }}
  >
    {/* Status icon */}
    <Box sx={{
      width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      bgcolor: isCompleted
        ? 'rgba(46,125,50,0.12)'
        : isActive
        ? MAROON
        : lesson.accessible ? 'rgba(0,0,0,0.05)' : 'rgba(0,0,0,0.04)',
    }}>
      {isCompleted
        ? <CheckCircle2 size={12} color={GREEN} />
        : isActive
        ? <Play size={10} color="#fff" fill="#fff" style={{ marginLeft: 1 }} />
        : lesson.accessible
        ? <Circle size={10} color="#bbb" />
        : <Lock size={10} color="#ccc" />
      }
    </Box>

    {/* Title */}
    <Typography sx={{
      flex: 1, fontSize: '0.8rem',
      fontWeight: isActive ? 600 : 400,
      color: isActive ? MAROON : lesson.accessible ? 'text.primary' : 'text.disabled',
      lineHeight: 1.35,
    }}>
      {lesson.title}
    </Typography>

    {/* Tags */}
    <Stack direction="row" spacing={0.5} alignItems="center">
      {lesson.has_quiz && (
        <Tooltip title="Has quiz">
          <HelpCircle size={12} color={isActive ? MAROON : '#bbb'} />
        </Tooltip>
      )}
      {lesson.duration && (
        <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.tertiary' }}>
          {Math.floor(lesson.duration / 60)}m
        </Typography>
      )}
    </Stack>
  </Box>
);

// ════════════════════════════════════════════════════════════════════
//  VideoPlayerPage
// ════════════════════════════════════════════════════════════════════
const VideoPlayerPage = ({ courseId, onBack }) => {
  const [course,     setCourse]     = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [lessons,    setLessons]    = useState([]);
  const [activeIdx,  setActiveIdx]  = useState(0);
  const [completed,  setCompleted]  = useState(new Set());
  const [sideOpen,   setSideOpen]   = useState(true);
  const [marking,    setMarking]    = useState(false);

  const token = localStorage.getItem('token');
  const auth  = { Authorization: 'Token ' + token };

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${API}/learner/courses/${courseId}/`, { headers: auth });
        setCourse(res.data);
        setLessons(buildLessonList(res.data));
      } catch {}
      finally { setLoading(false); }
    })();
  }, [courseId]); // eslint-disable-line

  const activeLesson = lessons[activeIdx] || null;

  // Navigate
  const goTo     = (lesson) => setActiveIdx(lessons.indexOf(lesson));
  const goPrev   = () => activeIdx > 0 && setActiveIdx(activeIdx - 1);
  const goNext   = () => activeIdx < lessons.length - 1 && setActiveIdx(activeIdx + 1);

  // Mark complete
  const markComplete = async () => {
    if (!activeLesson || marking) return;
    setMarking(true);
    setCompleted(prev => new Set([...prev, activeLesson.id]));
    // Auto-advance
    setTimeout(() => { if (activeIdx < lessons.length - 1) setActiveIdx(activeIdx + 1); }, 500);
    try {
      // Mark overall course progress
      const pct = Math.round(((completed.size + 1) / lessons.length) * 100);
      await axios.post(`${API}/learner/courses/${courseId}/complete/`, {}, { headers: auth }).catch(() => {});
    } catch {}
    finally { setMarking(false); }
  };

  if (loading) return (
    <Box sx={{ p: 4 }}>
      <LinearProgress sx={{ borderRadius: 2, '& .MuiLinearProgress-bar': { bgcolor: MAROON } }} />
    </Box>
  );
  if (!course) return null;

  const progress   = lessons.length > 0 ? Math.round((completed.size / lessons.length) * 100) : 0;
  const isComplete = activeLesson ? completed.has(activeLesson.id) : false;
  const materials  = course.materials || [];
  const sectionMats = activeLesson?.sectionName
    ? (course.sections || []).find(s => s.title === activeLesson.sectionName)?.materials || []
    : [];
  const lessonMats = [...sectionMats, ...materials.filter(m => !m.section)];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 600 }}>

      {/* ── Top bar ── */}
      <Box sx={{
        bgcolor: 'background.paper',
        borderBottom: '0.5px solid rgba(0,0,0,0.08)',
        px: 2, height: 48, display: 'flex', alignItems: 'center', gap: 2,
      }}>
        <IconButton size="small" onClick={onBack} sx={{ color: 'text.secondary' }}>
          <ArrowLeft size={18} />
        </IconButton>
        <Typography sx={{ flex: 1, fontWeight: 600, fontSize: '0.88rem' }} noWrap>
          {course.title}
        </Typography>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {progress}% complete
          </Typography>
          <Box sx={{ width: 80, height: 4, bgcolor: 'rgba(0,0,0,0.08)', borderRadius: 2, overflow: 'hidden' }}>
            <Box sx={{ height: '100%', width: `${progress}%`, bgcolor: MAROON, borderRadius: 2 }} />
          </Box>
        </Stack>
        <Tooltip title={sideOpen ? 'Hide sidebar' : 'Show sidebar'}>
          <IconButton size="small" onClick={() => setSideOpen(!sideOpen)} sx={{ color: 'text.secondary' }}>
            <BookOpen size={16} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* ── Body ── */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Video column */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: '#000', minWidth: 0 }}>

          {/* Video screen */}
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', minHeight: 280 }}>
            {activeLesson?.url ? (
              <Box component="video"
                src={activeLesson.url}
                controls
                sx={{ width: '100%', height: '100%', maxHeight: 400 }}
              />
            ) : (
              <Stack alignItems="center" spacing={2}>
                <Box sx={{
                  width: 60, height: 60, borderRadius: '50%',
                  bgcolor: 'rgba(255,255,255,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Play size={22} color="#fff" fill="#fff" style={{ marginLeft: 4 }} />
                </Box>
                <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                  {activeLesson?.title || 'Select a lesson'}
                </Typography>
              </Stack>
            )}

            {/* Lesson info overlay */}
            {activeLesson && (
              <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0,
                background: 'linear-gradient(transparent, rgba(0,0,0,0.7))', px: 2, pb: 1.5, pt: 3 }}>
                {activeLesson.sectionName && (
                  <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem', mb: 0.25 }}>
                    {activeLesson.sectionName}
                  </Typography>
                )}
                <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>
                  {activeLesson.title}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Controls bar */}
          <Box sx={{
            bgcolor: 'rgba(0,0,0,0.85)', px: 2, py: 1.25,
            display: 'flex', alignItems: 'center', gap: 1.5,
            borderTop: '0.5px solid rgba(255,255,255,0.06)',
          }}>
            <IconButton size="small" onClick={goPrev} disabled={activeIdx === 0}
              sx={{ color: 'rgba(255,255,255,0.7)', '&:disabled': { color: 'rgba(255,255,255,0.2)' } }}>
              <SkipBack size={16} />
            </IconButton>
            <IconButton size="small" onClick={goNext} disabled={activeIdx >= lessons.length - 1}
              sx={{ color: 'rgba(255,255,255,0.7)', '&:disabled': { color: 'rgba(255,255,255,0.2)' } }}>
              <SkipForward size={16} />
            </IconButton>
            <Typography sx={{ flex: 1, color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>
              Lesson {activeIdx + 1} of {lessons.length}
            </Typography>
            <Button
              size="small"
              variant={isComplete ? 'outlined' : 'contained'}
              startIcon={isComplete ? <CheckCircle2 size={14} /> : null}
              onClick={markComplete}
              disabled={marking}
              sx={{
                borderRadius: '8px', fontWeight: 600, fontSize: '0.75rem',
                bgcolor: isComplete ? 'transparent' : MAROON,
                color: isComplete ? '#81c784' : '#fff',
                borderColor: isComplete ? '#81c784' : 'transparent',
                '&:hover': { bgcolor: isComplete ? 'rgba(129,199,132,0.08)' : MAROON + 'dd' },
              }}
            >
              {isComplete ? 'Completed' : 'Mark complete'}
            </Button>
          </Box>

          {/* Lesson actions */}
          {activeLesson && (
            <Box sx={{ bgcolor: 'background.paper', px: 2, py: 1.5, borderTop: '0.5px solid rgba(0,0,0,0.06)' }}>
              <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap">
                {activeLesson.has_quiz && (
                  <Button size="small" variant="outlined"
                    startIcon={<HelpCircle size={14} />}
                    sx={{ borderColor: MAROON_SOFT, color: MAROON, borderRadius: '8px', fontSize: '0.78rem', fontWeight: 600 }}>
                    Take quiz
                  </Button>
                )}
                {lessonMats.slice(0, 3).map(m => (
                  <Button key={m.id} size="small" variant="text"
                    startIcon={<FileText size={13} />}
                    href={m.file_url} target="_blank" rel="noopener noreferrer" download
                    sx={{ color: 'text.secondary', fontSize: '0.75rem', '&:hover': { color: MAROON } }}>
                    {m.title}
                    <Download size={11} style={{ marginLeft: 4 }} />
                  </Button>
                ))}
              </Stack>
            </Box>
          )}
        </Box>

        {/* ── Sidebar ── */}
        <Collapse in={sideOpen} orientation="horizontal">
          <Box sx={{
            width: 240, flexShrink: 0, bgcolor: 'background.paper',
            borderLeft: '0.5px solid rgba(0,0,0,0.08)',
            display: 'flex', flexDirection: 'column',
            height: '100%', overflow: 'hidden',
          }}>
            <Box sx={{ px: 1.5, py: 1.25, borderBottom: '0.5px solid rgba(0,0,0,0.06)' }}>
              <Typography sx={{ fontWeight: 600, fontSize: '0.82rem' }}>Course content</Typography>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
                <Box sx={{ flex: 1, height: 3, bgcolor: 'rgba(0,0,0,0.08)', borderRadius: 2, overflow: 'hidden' }}>
                  <Box sx={{ height: '100%', width: `${progress}%`, bgcolor: MAROON, borderRadius: 2 }} />
                </Box>
                <Typography variant="caption" sx={{ color: 'text.tertiary', fontSize: '0.68rem', flexShrink: 0 }}>
                  {completed.size}/{lessons.length}
                </Typography>
              </Stack>
            </Box>

            <Box sx={{ flex: 1, overflowY: 'auto', py: 0.75 }}>
              {/* Group lessons by section */}
              {(() => {
                const grouped = [];
                let currentSection = null;
                lessons.forEach((lesson, idx) => {
                  if (lesson.sectionName !== currentSection) {
                    currentSection = lesson.sectionName;
                    if (currentSection) {
                      grouped.push({ type: 'section', name: currentSection });
                    }
                  }
                  grouped.push({ type: 'lesson', lesson, idx });
                });
                return grouped.map((item, i) =>
                  item.type === 'section' ? (
                    <Typography key={i} sx={{
                      px: 1.5, pt: 1.25, pb: 0.5,
                      fontSize: '0.66rem', fontWeight: 700,
                      color: 'text.tertiary', textTransform: 'uppercase', letterSpacing: '0.08em',
                    }}>
                      {item.name}
                    </Typography>
                  ) : (
                    <SidebarLesson
                      key={item.lesson.id}
                      lesson={item.lesson}
                      isActive={activeIdx === item.idx}
                      isCompleted={completed.has(item.lesson.id)}
                      onClick={() => setActiveIdx(item.idx)}
                    />
                  )
                );
              })()}
            </Box>
          </Box>
        </Collapse>
      </Box>
    </Box>
  );
};

export default VideoPlayerPage;