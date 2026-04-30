// src/components/tabs/CoursesTab.js
// Browse page — course cards + quizzes
// Opens CourseDetailPage and VideoPlayerPage inline

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Typography, TextField, Grid, Card, CardContent,
  Button, InputAdornment, Chip, Paper, Tabs, Tab, Stack,
  IconButton, LinearProgress, Alert, Snackbar, Tooltip,
  Radio, RadioGroup, FormControlLabel,
} from '@mui/material';
import {
  Search, HelpCircle, ShieldCheck, Star, UserPlus,
  CheckCircle2, Lock, Play, Video, ArrowLeft,
} from 'lucide-react';

import CourseDetailPage from './CourseDetailPage';
import VideoPlayerPage  from './VideoPlayerPage';

const MAROON      = '#9A2F2E';
const MAROON_SOFT = 'rgba(154,47,46,0.09)';
const GREEN       = '#2e7d32';
const GOLD        = '#f59e0b';
const API         = 'http://127.0.0.1:8000/api';

// ── Mini star row ─────────────────────────────────────────────────
const StarRow = ({ value, size = 12 }) => (
  <Stack direction="row" spacing={0.2}>
    {[1,2,3,4,5].map(s => (
      <Star key={s} size={size}
        color={value >= s ? GOLD : '#d1ccc0'}
        fill={value >= s ? GOLD : 'transparent'} />
    ))}
  </Stack>
);

// ── Course card ───────────────────────────────────────────────────
const CourseCard = ({ course, currentUser, onDetails, onWatch, onEnroll }) => {
  const isPaid     = course.is_paid && Number(course.price) > 0;
  const isEnrolled = course.enrolled;
  const isOwnCourse = course.tutor_username === currentUser;

  const THUMB_COLORS = [
    'linear-gradient(135deg,#1a237e,#283593)',
    'linear-gradient(135deg,#1b5e20,#2e7d32)',
    'linear-gradient(135deg,#4a148c,#6a1b9a)',
    'linear-gradient(135deg,#b71c1c,#c62828)',
    'linear-gradient(135deg,#0d47a1,#1565c0)',
    'linear-gradient(135deg,#33691e,#558b2f)',
  ];
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
      <Box sx={{ height: 128, background: thumbColor, position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        onClick={() => onDetails(course)}>
        {isPaid && !isEnrolled
          ? <Lock size={28} color="rgba(255,255,255,0.7)" />
          : (
            <Box sx={{
              width: 38, height: 38, borderRadius: '50%',
              bgcolor: 'rgba(255,255,255,0.15)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Play size={16} color="#fff" fill="#fff" style={{ marginLeft: 2 }} />
            </Box>
          )
        }
        {/* Locked badge */}
        {isPaid && !isEnrolled && (
          <Chip label="🔒 Paid" size="small"
            sx={{ position: 'absolute', top: 8, right: 8,
              bgcolor: 'rgba(0,0,0,0.5)', color: '#fff',
              fontWeight: 700, fontSize: '0.65rem', height: 20 }} />
        )}
      </Box>

      <CardContent sx={{ flex: 1, p: 1.5, pb: '12px !important', display: 'flex', flexDirection: 'column', gap: 0.75 }}>
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
        <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', lineHeight: 1.35,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {course.title}
        </Typography>

        {/* Tutor */}
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
            {course.tutor_username}
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

        {/* Spacer */}
        <Box sx={{ flex: 1 }} />

        {/* Action buttons */}
        <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
          <Button size="small" variant="outlined"
            onClick={() => onDetails(course)}
            sx={{ flex: 1, fontSize: '0.72rem', fontWeight: 600, borderRadius: 1.5,
              borderColor: MAROON_SOFT, color: MAROON,
              '&:hover': { bgcolor: MAROON_SOFT } }}>
            Details
          </Button>

          {isEnrolled ? (
            <Button size="small" variant="contained"
              onClick={() => onWatch(course)}
              startIcon={<Play size={12} fill="#fff" />}
              sx={{ flex: 1, fontSize: '0.72rem', fontWeight: 700, borderRadius: 1.5,
                bgcolor: MAROON, '&:hover': { bgcolor: '#7a2627' } }}>
              Watch
            </Button>
          ) : !isOwnCourse ? (
            <Button size="small" variant="contained"
              onClick={() => isPaid ? onDetails(course) : onEnroll(course)}
              startIcon={isPaid ? <Lock size={12} /> : <UserPlus size={12} />}
              sx={{ flex: 1, fontSize: '0.72rem', fontWeight: 700, borderRadius: 1.5,
                bgcolor: isPaid ? MAROON : GREEN,
                '&:hover': { bgcolor: isPaid ? '#7a2627' : '#1b5e20' } }}>
              {isPaid ? 'Buy' : 'Enroll'}
            </Button>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
};

// ════════════════════════════════════════════════════════════════════
//  CoursesTab
// ════════════════════════════════════════════════════════════════════
const CoursesTab = () => {
  const [view,        setView]        = useState('browse'); // browse | detail | player
  const [courses,     setCourses]     = useState([]);
  const [quizzes,     setQuizzes]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [tabValue,    setTabValue]    = useState(0);
  const [search,      setSearch]      = useState('');
  const [filter,      setFilter]      = useState('all');  // all | free | enrolled | paid
  const [selectedId,  setSelectedId]  = useState(null);
  const [submitting, setSubmitting] = useState(false); // eslint-disable-line

  // Quiz state
  const [activeQuiz,    setActiveQuiz]    = useState(null);
  const [quizAnswers,   setQuizAnswers]   = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore,     setQuizScore]     = useState(null);

  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });

  const token       = localStorage.getItem('token');
  const currentUser = localStorage.getItem('username');
  const auth        = { Authorization: 'Token ' + token };
  const toast       = (msg, severity = 'success') => setSnack({ open: true, msg, severity });

  useEffect(() => { fetchAll(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [cr, qr] = await Promise.all([
        axios.get(`${API}/learner/courses/`,  { headers: auth }),
        axios.get(`${API}/learner/quizzes/`, { headers: auth }),
      ]);
      setCourses(cr.data || []);
      setQuizzes(qr.data || []);
    } catch { toast('Failed to load courses', 'error'); }
    finally { setLoading(false); }
  };

  const enrollFree = async (course) => {
    setSubmitting(true);
    try {
      await axios.post(`${API}/learner/courses/${course.id}/enroll/`, {}, { headers: auth });
      toast(`Enrolled in ${course.title}! 🎉`);
      fetchAll();
    } catch (e) { toast(e.response?.data?.error || 'Enrollment failed', 'error'); }
    finally { setSubmitting(false); }
  };

  // Filtered courses
  const filtered = courses.filter(c => {
    const matchSearch = c.title?.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (filter === 'free')     return !c.is_paid;
    if (filter === 'paid')     return c.is_paid;
    if (filter === 'verified') return c.tutor_verified === true;
    if (filter === 'enrolled') return c.enrolled;
    return true;
  });

  // ── Quiz ──────────────────────────────────────────────────────
  const openQuiz = (quiz) => {
    setActiveQuiz(quiz); setQuizAnswers({});
    setQuizSubmitted(false); setQuizScore(null);
  };
  const handleSubmitQuiz = async () => {
    const total   = activeQuiz.questions.length;
    const correct = activeQuiz.questions.filter(q => quizAnswers[q.id] === q.correct_answer).length;
    const pct     = Math.round((correct / total) * 100);
    setQuizScore({ correct, total, pct });
    setQuizSubmitted(true);
    try {
      await axios.post(`${API}/learner/quizzes/${activeQuiz.id}/submit/`,
        { score_percent: pct }, { headers: auth });
    } catch {}
  };

  // ── Views ─────────────────────────────────────────────────────
  if (view === 'detail' && selectedId) {
    return (
      <CourseDetailPage
        courseId={selectedId}
        onBack={() => { setView('browse'); fetchAll(); }}
        onEnrolled={(id) => { setSelectedId(id); fetchAll(); }}
        onWatch={(id) => { setSelectedId(id); setView('player'); }}
      />
    );
  }
  if (view === 'player' && selectedId) {
    return (
      <VideoPlayerPage
        courseId={selectedId}
        onBack={() => { setView('browse'); fetchAll(); }}
      />
    );
  }

  // ── Browse ────────────────────────────────────────────────────
  return (
    <Box sx={{ p: 1 }}>

      {/* Tab bar */}
      <Paper sx={{ mb: 3, borderRadius: 3, border: '0.5px solid rgba(0,0,0,0.08)', bgcolor: 'background.paper' }}>
        <Tabs
          value={tabValue} onChange={(_, v) => setTabValue(v)}
          sx={{ '& .Mui-selected': { color: MAROON }, '& .MuiTabs-indicator': { bgcolor: MAROON },
            '& .MuiTab-root': { fontWeight: 600, fontSize: '0.82rem' } }}
        >
          <Tab label={`COURSES (${courses.length})`} />
          <Tab label={`QUIZZES (${quizzes.length})`} />
        </Tabs>
      </Paper>

      {/* ═══════ COURSES ═══════ */}
      {tabValue === 0 && (
        <Box>
          {/* Search + filter */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2.5 }}>
            <TextField
              placeholder="Search courses…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              size="small"
              sx={{ maxWidth: 320 }}
              InputProps={{ startAdornment: <InputAdornment position="start"><Search size={16} /></InputAdornment> }}
            />
            <Stack direction="row" spacing={0.75}>
              {[
                { id: 'all',      label: 'All'      },
                { id: 'free',     label: 'Free'     },
                { id: 'paid',     label: 'Paid'     },
                { id: 'verified', label: '✓ Verified' },
              ].map(f => (
                <Button key={f.id} size="small"
                  variant={filter === f.id ? 'contained' : 'outlined'}
                  onClick={() => setFilter(f.id)}
                  sx={{
                    borderRadius: 2, fontSize: '0.75rem', fontWeight: 600,
                    bgcolor: filter === f.id ? (f.id === 'verified' ? '#1a73e8' : MAROON) : 'transparent',
                    borderColor: filter === f.id ? (f.id === 'verified' ? '#1a73e8' : MAROON) : 'rgba(0,0,0,0.12)',
                    color: filter === f.id ? '#fff' : 'text.secondary',
                    '&:hover': { bgcolor: filter === f.id ? '#7a2627' : MAROON_SOFT },
                  }}
                >
                  {f.label}
                </Button>
              ))}
            </Stack>
          </Stack>

          {loading && <LinearProgress sx={{ borderRadius: 2, mb: 2, '& .MuiLinearProgress-bar': { bgcolor: MAROON } }} />}

          {!loading && filtered.length === 0 && (
            <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 3, bgcolor: 'rgba(255,255,255,0.5)' }}>
              <Video size={36} color="#bbb" style={{ marginBottom: 10 }} />
              <Typography sx={{ color: 'text.secondary' }}>
                {search ? `No courses match "${search}"` : 'No courses yet.'}
              </Typography>
            </Paper>
          )}

          <Grid container spacing={2.5}>
            {filtered.map(course => (
              <Grid item xs={12} sm={6} md={4} key={course.id}>
                <CourseCard
                  course={course}
                  currentUser={currentUser}
                  onDetails={(c) => { setSelectedId(c.id); setView('detail'); }}
                  onWatch={(c)   => { setSelectedId(c.id); setView('player'); }}
                  onEnroll={enrollFree}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* ═══════ QUIZZES ═══════ */}
      {tabValue === 1 && (
        <Box>
          {quizzes.length === 0 ? (
            <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 3 }}>
              <Typography sx={{ color: 'text.secondary' }}>No quizzes available yet.</Typography>
            </Paper>
          ) : (
            <Grid container spacing={2.5}>
              {quizzes.map(quiz => (
                <Grid item xs={12} sm={6} md={4} key={quiz.id}>
                  <Card sx={{ borderRadius: 3, border: '0.5px solid rgba(0,0,0,0.09)', bgcolor: 'background.paper',
                    transition: '0.2s', '&:hover': { transform: 'translateY(-3px)', boxShadow: 4 } }}>
                    <CardContent>
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                        <HelpCircle size={22} color={MAROON} />
                        <Chip label={`${quiz.questions?.length || 0} Questions`} size="small"
                          sx={{ bgcolor: MAROON_SOFT, color: MAROON, fontWeight: 700, fontSize: '0.7rem' }} />
                      </Stack>
                      <Typography sx={{ fontWeight: 700, mb: 0.5 }}>{quiz.title}</Typography>
                      {quiz.course_title && (
                        <Chip label={`📚 ${quiz.course_title}`} size="small"
                          sx={{ mb: 1.5, bgcolor: 'rgba(46,125,50,0.08)', color: GREEN, fontWeight: 600 }} />
                      )}
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, fontSize: '0.82rem' }}>
                        {quiz.description || 'No description'}
                      </Typography>
                      <Button variant="contained" fullWidth onClick={() => openQuiz(quiz)}
                        sx={{ borderRadius: 2, fontWeight: 700, bgcolor: MAROON, '&:hover': { bgcolor: '#7a2627' } }}>
                        Start Quiz
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {/* ═══════ QUIZ DIALOG ═══════ */}
      {activeQuiz && (
        <Box sx={{
          position: 'fixed', inset: 0, bgcolor: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, p: 2,
        }}>
          <Paper sx={{ borderRadius: 3, width: '100%', maxWidth: 600, maxHeight: '85vh',
            overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ px: 3, py: 2.5, borderBottom: '0.5px solid rgba(0,0,0,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography sx={{ fontWeight: 700, color: MAROON }}>{activeQuiz.title}</Typography>
                {activeQuiz.course_title && (
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>📚 {activeQuiz.course_title}</Typography>
                )}
              </Box>
              <Button size="small" onClick={() => setActiveQuiz(null)} sx={{ color: 'text.secondary' }}>Close</Button>
            </Box>

            <Box sx={{ flex: 1, overflowY: 'auto', px: 3, py: 2 }}>
              {!quizSubmitted ? (
                <Stack spacing={2}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Answer all {activeQuiz.questions.length} questions then submit.
                  </Typography>
                  {activeQuiz.questions.map((q, qi) => (
                    <Paper key={q.id} sx={{ p: 2.5, borderRadius: 2.5,
                      border: `0.5px solid ${quizAnswers[q.id] ? 'rgba(154,47,46,0.2)' : 'rgba(0,0,0,0.08)'}` }}>
                      <Typography sx={{ fontWeight: 600, mb: 1.5, fontSize: '0.9rem' }}>
                        Q{qi + 1}: {q.question_text}
                      </Typography>
                      <RadioGroup value={quizAnswers[q.id] || ''}
                        onChange={e => setQuizAnswers(p => ({ ...p, [q.id]: parseInt(e.target.value) }))}>
                        {[q.option1, q.option2, q.option3, q.option4].map((opt, i) => (
                          <FormControlLabel key={i} value={i + 1}
                            control={<Radio size="small" sx={{ color: MAROON, '&.Mui-checked': { color: MAROON } }} />}
                            label={<Typography variant="body2">{opt}</Typography>} />
                        ))}
                      </RadioGroup>
                    </Paper>
                  ))}
                </Stack>
              ) : (
                <Stack alignItems="center" spacing={2} sx={{ py: 2 }}>
                  <Typography sx={{ fontWeight: 900, fontSize: '2.5rem',
                    color: quizScore.pct >= 50 ? GREEN : MAROON }}>
                    {quizScore.pct}%
                  </Typography>
                  <Typography sx={{ color: 'text.secondary' }}>
                    {quizScore.correct}/{quizScore.total} correct
                  </Typography>
                  <LinearProgress variant="determinate" value={quizScore.pct}
                    sx={{ width: '100%', height: 10, borderRadius: 5,
                      '& .MuiLinearProgress-bar': { bgcolor: quizScore.pct >= 50 ? GREEN : MAROON } }} />
                  {quizScore.pct >= 100 && <Alert severity="success" sx={{ borderRadius: 2 }}>🎉 Perfect! +300 XP</Alert>}
                  {quizScore.pct >= 50 && quizScore.pct < 100 && <Alert severity="success" sx={{ borderRadius: 2 }}>🌟 Good job! +150 XP</Alert>}
                  {quizScore.pct < 50 && <Alert severity="warning" sx={{ borderRadius: 2 }}>Keep practicing! Try again to earn XP.</Alert>}
                </Stack>
              )}
            </Box>

            <Box sx={{ px: 3, py: 2, borderTop: '0.5px solid rgba(0,0,0,0.08)',
              display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button onClick={() => setActiveQuiz(null)} sx={{ color: 'text.secondary' }}>Close</Button>
              {!quizSubmitted ? (
                <Button variant="contained"
                  onClick={handleSubmitQuiz}
                  disabled={Object.keys(quizAnswers).length < activeQuiz.questions.length}
                  sx={{ bgcolor: MAROON, fontWeight: 700, borderRadius: 2, '&:hover': { bgcolor: '#7a2627' } }}>
                  Submit ({Object.keys(quizAnswers).length}/{activeQuiz.questions.length})
                </Button>
              ) : (
                <Button variant="outlined" onClick={() => { setQuizAnswers({}); setQuizSubmitted(false); setQuizScore(null); }}
                  sx={{ color: MAROON, borderColor: MAROON }}>
                  Try again
                </Button>
              )}
            </Box>
          </Paper>
        </Box>
      )}

      {/* Toast */}
      <Snackbar open={snack.open} autoHideDuration={4000}
        onClose={() => setSnack(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snack.severity} onClose={() => setSnack(s => ({ ...s, open: false }))}
          sx={{ borderRadius: 2.5, fontWeight: 600 }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CoursesTab;