// src/components/tabs/CourseDetailPage.jsx
// صفحة تفاصيل الكورس الكاملة — تُفتح من Browse page عند الضغط على "Details"

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Typography, Stack, Chip, Button, Paper,
  Avatar, LinearProgress, Alert, Divider, IconButton,
  Collapse,
} from '@mui/material';
import {
  ArrowLeft, ShieldCheck, GraduationCap, Building2,
  BookOpen, Play, Lock, ChevronDown, ChevronUp,
  Star, FileText, CheckCircle2, Smartphone, CreditCard,
  Sparkles, Download,
} from 'lucide-react';

const MAROON      = '#9A2F2E';
const MAROON_DARK = '#7a2627';
const MAROON_SOFT = 'rgba(154,47,46,0.08)';
const GREEN       = '#2e7d32';
const BLUE        = '#1a73e8';
const GOLD        = '#f59e0b';
const API         = 'http://127.0.0.1:8000/api';

// ── Stars display ─────────────────────────────────────────────────
const Stars = ({ value, size = 14 }) => (
  <Stack direction="row" spacing={0.25}>
    {[1,2,3,4,5].map(s => (
      <Star key={s} size={size}
        color={value >= s ? GOLD : '#d1ccc0'}
        fill={value >= s ? GOLD : 'transparent'}
      />
    ))}
  </Stack>
);

// ── Lesson row inside syllabus ────────────────────────────────────
const LessonRow = ({ lesson, idx, isAccessible, onWatch, courseId }) => (
  <Stack direction="row" alignItems="center" spacing={1.5}
    onClick={() => isAccessible && onWatch && onWatch(courseId)}
    sx={{
      px: 1.5, py: 1, borderRadius: '8px',
      cursor: isAccessible ? 'pointer' : 'default',
      '&:hover': isAccessible ? { bgcolor: MAROON_SOFT } : {},
    }}
  >
    <Box sx={{
      width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      bgcolor: isAccessible ? MAROON_SOFT : 'rgba(0,0,0,0.06)',
      fontSize: 11,
    }}>
      {isAccessible
        ? <Play size={10} color={MAROON} />
        : <Lock size={10} color="#999" />
      }
    </Box>
    <Typography variant="body2" sx={{
      flex: 1, fontSize: '0.82rem', fontWeight: 500,
      color: isAccessible ? 'text.primary' : 'text.disabled',
    }}>
      {lesson.title || `Lesson ${idx + 1}`}
    </Typography>
    <Stack direction="row" spacing={0.75}>
      {lesson.has_quiz && (
        <Chip label="Quiz" size="small" sx={{
          height: 18, fontSize: '0.62rem', fontWeight: 700,
          bgcolor: MAROON_SOFT, color: MAROON,
        }} />
      )}
      {lesson.duration_seconds && (
        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
          {Math.floor(lesson.duration_seconds / 60)}m
        </Typography>
      )}
      {!isAccessible && <Lock size={12} color="#bbb" />}
    </Stack>
  </Stack>
);

// ── Section accordion ─────────────────────────────────────────────
const SectionAccordion = ({ section, idx, isEnrolled }) => {
  const [open, setOpen] = useState(idx === 0);
  const videos    = section.videos    || [];
  const materials = section.materials || [];

  return (
    <Box sx={{ mb: 1 }}>
      <Box
        onClick={() => setOpen(!open)}
        sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          px: 1.5, py: 1.25, borderRadius: '10px', cursor: 'pointer',
          bgcolor: open ? MAROON_SOFT : 'rgba(0,0,0,0.03)',
          '&:hover': { bgcolor: MAROON_SOFT },
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <BookOpen size={14} color={open ? MAROON : '#9E9892'} />
          <Typography sx={{ fontWeight: 600, fontSize: '0.88rem', color: open ? MAROON : 'text.primary' }}>
            {section.title}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {videos.length} video{videos.length !== 1 ? 's' : ''}
            {materials.length > 0 && ` · ${materials.length} file${materials.length !== 1 ? 's' : ''}`}
          </Typography>
          {open ? <ChevronUp size={14} color="#9E9892" /> : <ChevronDown size={14} color="#9E9892" />}
        </Stack>
      </Box>
      <Collapse in={open}>
        <Box sx={{ pl: 1, pt: 0.5 }}>
          {videos.map((v, i) => (
            <LessonRow key={v.id} lesson={v} idx={i} isAccessible={isEnrolled} />
          ))}
          {materials.map(m => (
            <Stack key={m.id} direction="row" alignItems="center" spacing={1.5}
              sx={{ px: 1.5, py: 0.75 }}>
              <FileText size={13} color={isEnrolled ? MAROON : '#bbb'} />
              <Typography variant="caption" sx={{ color: isEnrolled ? 'text.primary' : 'text.disabled', fontSize: '0.78rem' }}>
                {m.title}
              </Typography>
              {!isEnrolled && <Lock size={11} color="#bbb" />}
            </Stack>
          ))}
        </Box>
      </Collapse>
    </Box>
  );
};

// ════════════════════════════════════════════════════════════════════
//  CourseDetailPage
// ════════════════════════════════════════════════════════════════════
const CourseDetailPage = ({ courseId, onBack, onEnrolled, onWatch }) => {
  const [course,     setCourse]     = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [enrolling,  setEnrolling]  = useState(false);
  const [payMethod,  setPayMethod]  = useState(null);
  const [showPay,    setShowPay]    = useState(false);
  const [aiSummary,  setAiSummary]  = useState('');
  const [aiLoading,  setAiLoading]  = useState(false);

  const token  = localStorage.getItem('token');
  const auth   = { Authorization: 'Token ' + token };

  useEffect(() => {
    fetchCourse();
  }, [courseId]); // eslint-disable-line

  const fetchCourse = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/learner/courses/${courseId}/`, { headers: auth });
      setCourse(res.data);
    } catch { setError('Failed to load course.'); }
    finally { setLoading(false); }
  };

  const loadAISummary = async () => {
    if (!course || aiSummary) return;
    setAiLoading(true);
    const GEMINI_KEY = 'AIzaSyBLrdcKH-XQmsMNzNIRNWezaM6FQgCBImw';
    try {
      const prompt = `Course: "${course.title}"\nDescription: "${course.description || 'none'}"\n\nWrite a SHORT engaging 3-sentence summary about what learners will gain. Be friendly, use emojis.`;
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.7, maxOutputTokens: 200 } }) }
      );
      const data = await res.json();
      setAiSummary(data.candidates?.[0]?.content?.parts?.[0]?.text || '');
    } catch { setAiSummary(''); }
    finally { setAiLoading(false); }
  };

  useEffect(() => { if (course) loadAISummary(); }, [course]); // eslint-disable-line

  const enrollFree = async () => {
    setEnrolling(true);
    try {
      await axios.post(`${API}/learner/courses/${courseId}/enroll/`, {}, { headers: auth });
      await fetchCourse();
      onEnrolled && onEnrolled(courseId);
    } catch (e) { setError(e.response?.data?.error || 'Enrollment failed.'); }
    finally { setEnrolling(false); }
  };

  const enrollPaid = async () => {
    if (!payMethod) { setError('Please select a payment method.'); return; }
    setEnrolling(true);
    try {
      await axios.post(`${API}/learner/courses/${courseId}/enroll/`,
        { payment_method: payMethod }, { headers: auth });
      await fetchCourse();
      setShowPay(false);
      onEnrolled && onEnrolled(courseId);
    } catch (e) { setError(e.response?.data?.error || 'Payment failed.'); }
    finally { setEnrolling(false); }
  };

  if (loading) return (
    <Box sx={{ p: 4, textAlign: 'center' }}>
      <LinearProgress sx={{ borderRadius: 2, '& .MuiLinearProgress-bar': { bgcolor: MAROON } }} />
    </Box>
  );

  if (!course) return (
    <Box sx={{ p: 3 }}>
      <Alert severity="error" sx={{ borderRadius: 2 }}>{error || 'Course not found.'}</Alert>
    </Box>
  );

  const isPaid     = course.is_paid && Number(course.price) > 0;
  const isEnrolled = course.enrolled;
  const credential = course.tutor_credential;
  const sections   = course.sections   || [];
  const extraVids  = course.extra_videos || [];
  const materials  = course.materials   || [];

  return (
    <Box>
      {error && (
        <Alert severity="error" onClose={() => setError('')}
          sx={{ mx: 2, mt: 2, borderRadius: 2 }}>{error}</Alert>
      )}

      {/* ── Hero ── */}
      <Box sx={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #2d1b3d 100%)',
        px: { xs: 2, md: 4 }, py: 3,
      }}>
        <Button startIcon={<ArrowLeft size={16} />} onClick={onBack}
          sx={{ color: 'rgba(255,255,255,0.6)', mb: 2, fontSize: '0.8rem', p: 0,
            '&:hover': { color: '#fff', bgcolor: 'transparent' } }}>
          Back to courses
        </Button>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="flex-start">
          <Box sx={{ flex: 1 }}>
            {/* Badges */}
            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 1.5 }}>
              {course.difficulty && (
                <Chip label={course.difficulty} size="small"
                  sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)', fontSize: '0.7rem' }} />
              )}
              <Chip label={`${(course.video_count || 1)} lessons`} size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)', fontSize: '0.7rem' }} />
              <Chip
                label={isPaid ? `SAR ${Number(course.price).toFixed(0)}` : 'Free'}
                size="small"
                sx={{
                  bgcolor: isPaid ? 'rgba(154,47,46,0.4)' : 'rgba(46,125,50,0.35)',
                  color: '#fff', fontSize: '0.7rem', fontWeight: 700,
                }}
              />
            </Stack>

            <Typography sx={{ fontWeight: 700, fontSize: { xs: '1.1rem', sm: '1.3rem' }, color: '#fff', mb: 1, lineHeight: 1.3 }}>
              {course.title}
            </Typography>

            {course.description && (
              <Typography sx={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.85rem', mb: 1.5, lineHeight: 1.6 }}>
                {course.description}
              </Typography>
            )}

            {course.average_rating > 0 && (
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <Stars value={Math.round(course.average_rating)} size={13} />
                <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem' }}>
                  {course.average_rating.toFixed(1)} ({course.rating_count} ratings)
                </Typography>
              </Stack>
            )}

            {/* CTA */}
            {isEnrolled ? (
              <Button variant="contained" size="large"
                onClick={() => onWatch && onWatch(courseId)}
                startIcon={<Play size={16} fill="#fff" />}
                sx={{ bgcolor: MAROON, fontWeight: 700, borderRadius: 2, '&:hover': { bgcolor: MAROON_DARK } }}>
                Watch course
              </Button>
            ) : isPaid ? (
              <Button variant="contained" size="large"
                startIcon={<Lock size={16} />}
                onClick={() => setShowPay(!showPay)}
                sx={{ bgcolor: MAROON, fontWeight: 700, borderRadius: 2, '&:hover': { bgcolor: MAROON_DARK } }}>
                Buy — SAR {Number(course.price).toFixed(0)}
              </Button>
            ) : (
              <Button variant="contained" size="large"
                onClick={enrollFree} disabled={enrolling}
                sx={{ bgcolor: GREEN, fontWeight: 700, borderRadius: 2, '&:hover': { bgcolor: '#1b5e20' } }}>
                {enrolling ? 'Enrolling…' : 'Enroll for free'}
              </Button>
            )}
          </Box>

          {/* Preview video card */}
          <Box sx={{
            width: { xs: '100%', sm: 200 }, flexShrink: 0,
            bgcolor: 'rgba(0,0,0,0.4)', borderRadius: 2,
            border: '0.5px solid rgba(255,255,255,0.1)', overflow: 'hidden',
          }}>
            <Box sx={{ height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(0,0,0,0.3)' }}>
              <Box sx={{
                width: 44, height: 44, borderRadius: '50%',
                bgcolor: 'rgba(255,255,255,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' },
              }}>
                <Play size={18} color="#fff" fill="#fff" style={{ marginLeft: 3 }} />
              </Box>
            </Box>
            <Box sx={{ p: 1.25 }}>
              <Typography sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.78rem', fontWeight: 600 }}>
                {isEnrolled ? 'Watch course' : 'Free preview'}
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem' }}>
                {isEnrolled ? 'Continue where you left off' : 'Introduction only'}
              </Typography>
            </Box>
          </Box>
        </Stack>
      </Box>

      {/* ── Payment panel ── */}
      <Collapse in={showPay && !isEnrolled}>
        <Paper sx={{
          mx: 2, mt: 2, p: 2.5, borderRadius: 2.5,
          border: `1.5px solid ${MAROON_SOFT}`,
        }}>
          <Typography sx={{ fontWeight: 700, mb: 1.5, fontSize: '0.9rem' }}>
            Choose payment method
          </Typography>
          <Stack direction="row" spacing={1.5} sx={{ mb: 2 }}>
            {[
              { id: 'apple_pay', label: 'Apple Pay', Icon: Smartphone },
              { id: 'card',      label: 'Card',      Icon: CreditCard  },
            ].map(({ id, label, Icon }) => (
              <Box key={id} onClick={() => setPayMethod(id)}
                sx={{
                  flex: 1, py: 1.5, borderRadius: 2, cursor: 'pointer', textAlign: 'center',
                  border: `1.5px solid ${payMethod === id ? MAROON : 'rgba(0,0,0,0.1)'}`,
                  bgcolor: payMethod === id ? MAROON_SOFT : '#fafaf9',
                  transition: '0.15s',
                }}>
                <Icon size={20} color={payMethod === id ? MAROON : '#9E9892'} />
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, mt: 0.5,
                  color: payMethod === id ? MAROON : 'text.secondary' }}>{label}</Typography>
              </Box>
            ))}
          </Stack>
          <Button variant="contained" fullWidth onClick={enrollPaid}
            disabled={enrolling || !payMethod}
            sx={{ bgcolor: MAROON, fontWeight: 700, borderRadius: 2, '&:hover': { bgcolor: MAROON_DARK } }}>
            {enrolling ? 'Processing…' : `Pay SAR ${Number(course.price).toFixed(0)} & Enroll`}
          </Button>
        </Paper>
      </Collapse>

      {/* ── Body ── */}
      <Box sx={{ px: { xs: 2, md: 4 }, py: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="flex-start">

          {/* ── Left: instructor + content ── */}
          <Box sx={{ flex: 1, minWidth: 0 }}>

            {/* AI Summary */}
            {(aiLoading || aiSummary) && (
              <Paper sx={{ p: 2, mb: 3, borderRadius: 2.5,
                border: '1px solid rgba(66,133,244,0.25)', bgcolor: 'rgba(66,133,244,0.04)' }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <Sparkles size={14} color={BLUE} />
                  <Typography variant="caption" sx={{ fontWeight: 700, color: BLUE }}>AI Course Summary</Typography>
                  <Chip label="Gemini AI ✨" size="small"
                    sx={{ bgcolor: 'rgba(66,133,244,0.1)', color: BLUE, fontWeight: 700, fontSize: '0.62rem', height: 18 }} />
                </Stack>
                {aiLoading
                  ? <LinearProgress sx={{ height: 3, borderRadius: 2 }} />
                  : <Typography variant="body2" sx={{ lineHeight: 1.8, whiteSpace: 'pre-wrap', color: 'text.secondary' }}>
                      {aiSummary}
                    </Typography>
                }
              </Paper>
            )}

            {/* Instructor card */}
            <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', mb: 1.5 }}>Instructor</Typography>
            <Paper sx={{ p: 2, mb: 3, borderRadius: 2.5, border: '0.5px solid rgba(0,0,0,0.08)' }}>
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: credential ? 1.5 : 0 }}>
                <Avatar sx={{ width: 44, height: 44, bgcolor: MAROON, fontWeight: 700, fontSize: '1rem' }}>
                  {course.tutor_username?.[0]?.toUpperCase()}
                </Avatar>
                <Box>
                  <Stack direction="row" alignItems="center" spacing={0.75}>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.95rem' }}>
                      {course.tutor_username}
                    </Typography>
                    {course.tutor_verified && (
                      <Stack direction="row" alignItems="center" spacing={0.4}
                        sx={{ bgcolor: 'rgba(26,115,232,0.08)', borderRadius: 99, px: 0.75, py: 0.25 }}>
                        <ShieldCheck size={12} color={BLUE} />
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: BLUE }}>Verified</Typography>
                      </Stack>
                    )}
                  </Stack>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>Instructor</Typography>
                </Box>
              </Stack>

              {/* Credential info — automatic from DB */}
              {credential && (
                <>
                  <Divider sx={{ my: 1.25 }} />
                  <Stack spacing={0.75}>
                    <Stack direction="row" spacing={1} alignItems="flex-start">
                      <GraduationCap size={14} color={BLUE} style={{ flexShrink: 0, marginTop: 2 }} />
                      <Typography variant="body2" sx={{ fontSize: '0.82rem', color: 'text.secondary', lineHeight: 1.5 }}>
                        <strong style={{ color: 'var(--color-text-primary)' }}>{credential.credential_type}</strong>
                        {credential.institution && ` — ${credential.institution}`}
                        {credential.graduation_year && `, ${credential.graduation_year}`}
                      </Typography>
                    </Stack>
                    {credential.field_of_study && (
                      <Stack direction="row" spacing={1} alignItems="flex-start">
                        <Building2 size={14} color={BLUE} style={{ flexShrink: 0, marginTop: 2 }} />
                        <Typography variant="body2" sx={{ fontSize: '0.82rem', color: 'text.secondary' }}>
                          Field: <strong style={{ color: 'var(--color-text-primary)' }}>{credential.field_of_study}</strong>
                        </Typography>
                      </Stack>
                    )}
                  </Stack>
                </>
              )}

              {/* Not verified message */}
              {!course.tutor_verified && (
                <Typography variant="caption" sx={{ color: 'text.tertiary', display: 'block', mt: 0.75 }}>
                  Credentials not yet submitted
                </Typography>
              )}
            </Paper>

            {/* Course content */}
            <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', mb: 1.5 }}>
              Course content
            </Typography>

            {/* Sections */}
            {sections.length > 0
              ? sections.map((sec, i) => (
                  <SectionAccordion key={sec.id} section={sec} idx={i} isEnrolled={isEnrolled} />
                ))
              : (
                // Flat structure (legacy courses)
                <Box>
                  {/* Main video */}
                  <LessonRow
                    lesson={{ title: 'Main lesson', has_quiz: false }}
                    idx={0}
                    isAccessible={true}
                    onWatch={onWatch}
                    courseId={courseId}
                  />
                  {extraVids.map((v, i) => (
                    <LessonRow key={v.id} lesson={v} idx={i + 1} isAccessible={isEnrolled} onWatch={onWatch} courseId={courseId} />
                  ))}
                  {materials.length > 0 && (
                    <Box sx={{ mt: 1.5 }}>
                      <Typography variant="overline" sx={{ color: 'text.secondary', fontSize: '0.65rem', display: 'block', mb: 1 }}>
                        Materials
                      </Typography>
                      <Stack spacing={0.75}>
                        {materials.map(m => (
                          isEnrolled ? (
                            <Button
                              key={m.id}
                              component="a"
                              href={m.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              download
                              variant="outlined"
                              size="medium"
                              startIcon={<FileText size={16} color={MAROON} />}
                              endIcon={<Download size={14} />}
                              sx={{
                                justifyContent: 'flex-start', borderRadius: '10px',
                                borderColor: 'rgba(154,47,46,0.25)', color: MAROON,
                                fontWeight: 600, fontSize: '0.85rem', px: 2, py: 0.9,
                                bgcolor: MAROON_SOFT,
                                '&:hover': { bgcolor: 'rgba(154,47,46,0.15)', borderColor: MAROON },
                              }}
                            >
                              {m.title}
                            </Button>
                          ) : (
                            <Stack key={m.id} direction="row" alignItems="center" spacing={1.5}
                              sx={{ px: 1.5, py: 0.75 }}>
                              <FileText size={14} color="#bbb" />
                              <Typography variant="body2" sx={{ color: 'text.disabled', fontSize: '0.82rem' }}>
                                {m.title}
                              </Typography>
                              <Lock size={12} color="#bbb" />
                            </Stack>
                          )
                        ))}
                      </Stack>
                    </Box>
                  )}
                </Box>
              )
            }

            {/* Lock notice for paid unrolled */}
            {isPaid && !isEnrolled && (
              <Paper sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: 'rgba(0,0,0,0.03)',
                border: '1px dashed rgba(0,0,0,0.12)', textAlign: 'center' }}>
                <Lock size={18} color="#bbb" style={{ marginBottom: 6 }} />
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Purchase the course to unlock all sections
                </Typography>
              </Paper>
            )}
          </Box>

          {/* ── Right: sticky info card ── */}
          <Box sx={{ width: { xs: '100%', md: 220 }, flexShrink: 0 }}>
            <Paper sx={{ p: 2, borderRadius: 2.5, border: '0.5px solid rgba(0,0,0,0.08)', position: 'sticky', top: 16 }}>
              {/* Price */}
              <Typography sx={{ fontWeight: 900, fontSize: '1.4rem', color: isPaid ? MAROON : GREEN, mb: 0.5 }}>
                {isPaid ? `SAR ${Number(course.price).toFixed(0)}` : 'Free'}
              </Typography>

              {/* Stats */}
              <Stack spacing={0.5} sx={{ mb: 2 }}>
                {[
                  ['Lessons', `${course.video_count || 1} videos`],
                  ['Level',   course.difficulty || 'All levels'],
                  ['Sections', sections.length > 0 ? `${sections.length} sections` : 'Single section'],
                ].map(([k, v]) => (
                  <Stack key={k} direction="row" justifyContent="space-between">
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>{k}</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>{v}</Typography>
                  </Stack>
                ))}
              </Stack>

              {/* CTA */}
              {isEnrolled ? (
                <Chip
                  icon={<CheckCircle2 size={14} />}
                  label="You're enrolled"
                  sx={{ width: '100%', bgcolor: 'rgba(46,125,50,0.1)', color: GREEN,
                    fontWeight: 700, fontSize: '0.82rem', borderRadius: 2 }}
                />
              ) : isPaid ? (
                <Button variant="contained" fullWidth onClick={() => setShowPay(true)}
                  sx={{ bgcolor: MAROON, fontWeight: 700, borderRadius: 2, '&:hover': { bgcolor: MAROON_DARK } }}>
                  Buy & Enroll
                </Button>
              ) : (
                <Button variant="contained" fullWidth onClick={enrollFree} disabled={enrolling}
                  sx={{ bgcolor: GREEN, fontWeight: 700, borderRadius: 2, '&:hover': { bgcolor: '#1b5e20' } }}>
                  {enrolling ? 'Enrolling…' : 'Enroll free'}
                </Button>
              )}

              {/* Verified badge */}
              {course.tutor_verified && (
                <Paper sx={{ mt: 1.5, p: 1.25, borderRadius: 2,
                  border: '0.5px solid rgba(26,115,232,0.2)', bgcolor: 'rgba(26,115,232,0.04)' }}>
                  <Stack direction="row" spacing={0.75} alignItems="center">
                    <ShieldCheck size={14} color={BLUE} />
                    <Typography sx={{ fontSize: '0.75rem', color: BLUE, fontWeight: 600 }}>
                      Verified instructor
                    </Typography>
                  </Stack>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                    Credentials automatically confirmed on upload
                  </Typography>
                </Paper>
              )}
            </Paper>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
};

export default CourseDetailPage;