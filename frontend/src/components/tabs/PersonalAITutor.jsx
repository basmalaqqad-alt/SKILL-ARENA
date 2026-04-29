// src/components/tabs/PersonalAITutor.jsx
// Groq بدل Gemini — بدون quota وبدون limit

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Box, Typography, Paper, Stack, Chip, Avatar,
  TextField, Button, CircularProgress, LinearProgress,
} from '@mui/material';
import { Bot, Send, RotateCcw, BookOpen, Star, Zap, Sparkles } from 'lucide-react';
import { askGroq } from '../../utils/groqClient';

const MAROON       = '#9A2F2E';
const MAROON_LIGHT = 'rgba(154,47,46,0.08)';

const BADGES = [
  { at: 5,  name: 'AI Scholar',     emoji: '🎓', color: '#4285F4', bg: 'rgba(66,133,244,0.1)'  },
  { at: 10, name: 'Smart Achiever', emoji: '🏆', color: '#ed6c02', bg: 'rgba(237,108,2,0.1)'   },
  { at: 20, name: 'Knowledge Hero', emoji: '⚡', color: '#9A2F2E', bg: 'rgba(154,47,46,0.1)'   },
];

const PersonalAITutor = ({ userName = 'Hero' }) => {
  const [courses,        setCourses]        = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [messages,       setMessages]       = useState([]);
  const [input,          setInput]          = useState('');
  const [loading,        setLoading]        = useState(false);
  const [doPoints,       setDoPoints]       = useState(0);
  const [correctStreak,  setCorrectStreak]  = useState(0);
  const [badges,         setBadges]         = useState([]);
  const [newBadge,       setNewBadge]       = useState(null);
  const [history,        setHistory]        = useState([]);
  const [phase,          setPhase]          = useState('select');
  const chatEndRef = useRef(null);

  useEffect(() => { fetchCourses(); }, []);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => {
    if (newBadge) {
      const t = setTimeout(() => setNewBadge(null), 4000);
      return () => clearTimeout(t);
    }
  }, [newBadge]);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://127.0.0.1:8000/api/learner/courses/enrolled/', {
        headers: { Authorization: 'Token ' + token },
      });
      setCourses(res.data || []);
    } catch {}
  };

  const addMessage = (role, text, type = 'normal') =>
    setMessages(prev => [...prev, { role, text, type, id: Date.now() + Math.random() }]);

  const generateQuestion = async (course, questionHistory) => {
    setLoading(true);
    try {
      const prompt =
        'You are a friendly AI tutor. Quiz the student on: "' + course.title + '".\n' +
        'Description: "' + (course.description || 'No description') + '".\n' +
        'Ask ONE clear question. Already asked: ' +
        (questionHistory.length > 0 ? questionHistory.join(' | ') : 'none') + '.\n' +
        'Just ask the question directly. Keep it concise (1-2 sentences). End with "?"';

      const question = await askGroq(prompt);
      addMessage('ai', question, 'question');
      setHistory(prev => [...prev, question]);
    } catch (e) {
      addMessage('ai', 'Oops! Let me try again... 🔄', 'error');
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = async (course) => {
    setSelectedCourse(course);
    setPhase('quiz');
    setDoPoints(0); setCorrectStreak(0);
    setBadges([]); setHistory([]); setMessages([]);
    addMessage('ai',
      'Great choice, ' + userName + '! 🎯 Let\'s dive into **' + course.title + '**!\n\n' +
      'I\'ll ask you questions one by one. Answer in your own words — I\'ll give you feedback after each one.\n\n' +
      'Ready? Here comes your first question! 🚀',
      'intro'
    );
    await generateQuestion(course, []);
  };

  const evaluateAnswer = async (userAnswer) => {
    if (!selectedCourse || !userAnswer.trim()) return;
    setLoading(true);
    const lastQuestion = history[history.length - 1] || 'the course topic';
    try {
      const prompt =
        'You are a friendly AI tutor evaluating a student answer.\n' +
        'Course: "' + selectedCourse.title + '"\n' +
        'Question: "' + lastQuestion + '"\n' +
        'Student answer: "' + userAnswer + '"\n\n' +
        'Respond in this EXACT format:\n' +
        'RESULT: CORRECT or INCORRECT\n' +
        'FEEDBACK: (1-2 sentences, friendly, use emojis. If wrong, briefly explain the right answer.)\n\n' +
        'Be encouraging. Keep it short.';

      const response = await askGroq(prompt);
      const isCorrect = response.toUpperCase().includes('RESULT: CORRECT');
      const feedbackMatch = response.match(/FEEDBACK:\s*([\s\S]+)/i);
      const feedback = feedbackMatch ? feedbackMatch[1].trim() : response;

      const newPoints  = doPoints + (isCorrect ? 10 : 0);
      const newCorrect = isCorrect ? correctStreak + 1 : correctStreak;
      setDoPoints(newPoints);
      setCorrectStreak(newCorrect);
      addMessage('ai', feedback, isCorrect ? 'correct' : 'incorrect');

      const earned = BADGES.find(b => newCorrect === b.at && !badges.find(x => x.name === b.name));
      if (earned) {
        setBadges(prev => [...prev, earned]);
        setNewBadge(earned);
        setTimeout(() => {
          addMessage('ai',
            '🏅 **Badge Unlocked: ' + earned.name + '** ' + earned.emoji + '\n' +
            'You\'ve answered ' + newCorrect + ' questions correctly! Keep it up!',
            'badge'
          );
        }, 500);
      }

      setTimeout(() => {
        addMessage('ai', '➡️ Next question coming up...', 'transition');
        setTimeout(() => generateQuestion(selectedCourse, history), 800);
      }, 1500);

    } catch {
      addMessage('ai', 'Something went wrong. Try again! 🔄', 'error');
      setLoading(false);
    }
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    addMessage('user', text);
    await evaluateAnswer(text);
  };

  const handleReset = () => {
    setPhase('select'); setSelectedCourse(null);
    setMessages([]); setDoPoints(0); setCorrectStreak(0);
    setBadges([]); setHistory([]); setNewBadge(null);
  };

  const nextBadge = BADGES.find(b => correctStreak < b.at);
  const progressToBadge = nextBadge ? Math.round((correctStreak / nextBadge.at) * 100) : 100;

  // ── SELECT SCREEN ─────────────────────────────────────────────
  if (phase === 'select') {
    return (
      <Box sx={{ maxWidth: 700, mx: 'auto', px: 1 }}>
        <Paper elevation={0} sx={{ p: 4, borderRadius: 4,
          background: 'linear-gradient(135deg, #9A2F2E 0%, #4A1516 100%)',
          color: '#fff', mb: 3, textAlign: 'center' }}>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 64, height: 64, mx: 'auto', mb: 2 }}>
            <Bot size={34} color="#FACA07" />
          </Avatar>
          <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, color: '#fff' }}>Personal AI Tutor</Typography>
          <Typography variant="body1" sx={{ opacity: 0.9, color: '#fff' }}>
            Your smart learning companion — powered by AI ✨
          </Typography>
        </Paper>

        <Paper sx={{ p: 3, borderRadius: 3, border: '2px solid ' + MAROON_LIGHT, bgcolor: 'rgba(255,255,255,0.7)' }}>
          <Typography variant="h6" sx={{ fontWeight: 900, color: MAROON, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <BookOpen size={20} color={MAROON} />
            Which course would you like me to quiz you on?
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
            Choose from your enrolled courses below 👇
          </Typography>

          {courses.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography sx={{ color: 'text.secondary' }}>
                You haven't enrolled in any courses yet!
              </Typography>
            </Box>
          ) : (
            <Stack spacing={1.5}>
              {courses.map(course => (
                <Paper key={course.id} onClick={() => startQuiz(course)}
                  sx={{ p: 2, borderRadius: 2, border: '2px solid ' + MAROON_LIGHT,
                    cursor: 'pointer', transition: '0.2s',
                    '&:hover': { border: '2px solid ' + MAROON, bgcolor: MAROON_LIGHT, transform: 'translateX(4px)' } }}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ bgcolor: MAROON, width: 44, height: 44 }}>
                      <BookOpen size={22} color="#fff" />
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: MAROON }}>{course.title}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {course.description ? course.description.slice(0, 60) + '...' : 'Click to start quiz'}
                      </Typography>
                    </Box>
                    <Chip label="Quiz me!" size="small" sx={{ bgcolor: MAROON, color: '#fff', fontWeight: 700 }} />
                  </Stack>
                </Paper>
              ))}
            </Stack>
          )}
        </Paper>
      </Box>
    );
  }

  // ── QUIZ SCREEN ───────────────────────────────────────────────
  return (
    <Box sx={{ maxWidth: 780, mx: 'auto', px: 1 }}>
      {newBadge && (
        <Box sx={{ position: 'fixed', top: 80, left: '50%', transform: 'translateX(-50%)', zIndex: 9999,
          bgcolor: newBadge.bg, border: '2px solid ' + newBadge.color, borderRadius: 3, p: 2,
          boxShadow: 6, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography fontSize={32}>{newBadge.emoji}</Typography>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 900, color: newBadge.color }}>Badge Unlocked!</Typography>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>{newBadge.name}</Typography>
          </Box>
          <Sparkles size={24} color={newBadge.color} />
        </Box>
      )}

      <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3,
        background: 'linear-gradient(135deg, #9A2F2E 0%, #4A1516 100%)', color: '#fff', mb: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 40, height: 40 }}>
              <Bot size={22} color="#FACA07" />
            </Avatar>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 900, lineHeight: 1 }}>AI Tutor</Typography>
              <Typography variant="caption" sx={{ opacity: 0.85 }}>{selectedCourse?.title}</Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box sx={{ textAlign: 'center', bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 2, px: 1.5, py: 0.5 }}>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Zap size={16} color="#FACA07" />
                <Typography variant="body2" sx={{ fontWeight: 900 }}>{doPoints}</Typography>
              </Stack>
              <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.65rem' }}>DO POINTS</Typography>
            </Box>
            <Box sx={{ textAlign: 'center', bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 2, px: 1.5, py: 0.5 }}>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Star size={16} color="#FACA07" />
                <Typography variant="body2" sx={{ fontWeight: 900 }}>{correctStreak}</Typography>
              </Stack>
              <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.65rem' }}>CORRECT</Typography>
            </Box>
            <Button size="small" onClick={handleReset} startIcon={<RotateCcw size={14} />}
              sx={{ color: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.3)', fontWeight: 700, fontSize: '0.7rem' }}>
              Switch
            </Button>
          </Stack>
        </Stack>

        {nextBadge && (
          <Box sx={{ mt: 1.5 }}>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
              <Typography variant="caption" sx={{ opacity: 0.85 }}>Next: {nextBadge.name} {nextBadge.emoji}</Typography>
              <Typography variant="caption" sx={{ opacity: 0.85 }}>{correctStreak}/{nextBadge.at}</Typography>
            </Stack>
            <LinearProgress variant="determinate" value={progressToBadge}
              sx={{ height: 6, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.2)',
                '& .MuiLinearProgress-bar': { bgcolor: '#FACA07', borderRadius: 3 } }} />
          </Box>
        )}

        {badges.length > 0 && (
          <Stack direction="row" spacing={0.5} sx={{ mt: 1 }} flexWrap="wrap">
            {badges.map(b => (
              <Chip key={b.name} label={b.emoji + ' ' + b.name} size="small"
                sx={{ bgcolor: b.bg, color: b.color, fontWeight: 700, fontSize: '0.7rem', border: '1px solid ' + b.color }} />
            ))}
          </Stack>
        )}
      </Paper>

      <Paper sx={{ borderRadius: 3, border: '2px solid ' + MAROON_LIGHT, bgcolor: 'rgba(255,255,255,0.7)', overflow: 'hidden' }}>
        <Box sx={{ height: 420, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {messages.map(msg => (
            <Box key={msg.id} sx={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 1 }}>
              {msg.role === 'ai' && (
                <Avatar sx={{ width: 32, height: 32, bgcolor: MAROON, flexShrink: 0 }}>
                  <Bot size={18} color="#fff" />
                </Avatar>
              )}
              <Box sx={{
                maxWidth: '78%', p: 1.5,
                borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                bgcolor: msg.role === 'user' ? MAROON
                  : msg.type === 'correct'   ? 'rgba(46,125,50,0.1)'
                  : msg.type === 'incorrect' ? 'rgba(154,47,46,0.08)'
                  : msg.type === 'badge'     ? 'rgba(250,202,7,0.1)'
                  : msg.type === 'question'  ? 'rgba(66,133,244,0.08)'
                  : 'rgba(0,0,0,0.04)',
                border: msg.type === 'correct'   ? '1px solid rgba(46,125,50,0.3)'
                  : msg.type === 'incorrect' ? '1px solid rgba(154,47,46,0.2)'
                  : msg.type === 'badge'     ? '1px solid rgba(250,202,7,0.4)'
                  : msg.type === 'question'  ? '1px solid rgba(66,133,244,0.2)'
                  : 'none',
              }}>
                {msg.type === 'correct'   && <Typography variant="caption" sx={{ color: '#2e7d32', fontWeight: 800, display: 'block', mb: 0.25 }}>✅ Correct!</Typography>}
                {msg.type === 'incorrect' && <Typography variant="caption" sx={{ color: MAROON,    fontWeight: 800, display: 'block', mb: 0.25 }}>❌ Not quite...</Typography>}
                {msg.type === 'badge'     && <Typography variant="caption" sx={{ color: '#b8860b', fontWeight: 800, display: 'block', mb: 0.25 }}>🏅 Badge Earned!</Typography>}
                {msg.type === 'question'  && <Typography variant="caption" sx={{ color: '#4285F4', fontWeight: 800, display: 'block', mb: 0.25 }}>❓ Question</Typography>}
                <Typography variant="body2" sx={{
                  lineHeight: 1.7, whiteSpace: 'pre-wrap',
                  color: msg.role === 'user' ? '#fff'
                    : msg.type === 'correct'   ? '#1b5e20'
                    : msg.type === 'incorrect' ? '#7a2627'
                    : msg.type === 'badge'     ? '#b8860b'
                    : 'text.primary',
                }}>
                  {msg.text}
                </Typography>
              </Box>
              {msg.role === 'user' && (
                <Avatar sx={{ width: 32, height: 32, bgcolor: '#4285F4', flexShrink: 0 }}>
                  <Typography variant="caption" sx={{ fontWeight: 900, color: '#fff', fontSize: '0.7rem' }}>
                    {userName.charAt(0).toUpperCase()}
                  </Typography>
                </Avatar>
              )}
            </Box>
          ))}

          {loading && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: MAROON }}><Bot size={18} color="#fff" /></Avatar>
              <Box sx={{ p: 1.5, borderRadius: '18px 18px 18px 4px', bgcolor: 'rgba(0,0,0,0.04)' }}>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <CircularProgress size={12} sx={{ color: MAROON }} />
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>AI Tutor is thinking...</Typography>
                </Stack>
              </Box>
            </Box>
          )}
          <div ref={chatEndRef} />
        </Box>

        <Box sx={{ p: 2, borderTop: '1px solid ' + MAROON_LIGHT, bgcolor: 'rgba(255,255,255,0.9)' }}>
          <Stack direction="row" spacing={1}>
            <TextField fullWidth size="small" placeholder="Type your answer here..."
              value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
              disabled={loading}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, '&.Mui-focused fieldset': { borderColor: MAROON } } }} />
            <Button variant="contained" onClick={handleSend} disabled={loading || !input.trim()}
              sx={{ bgcolor: MAROON, '&:hover': { bgcolor: '#7a2627' }, borderRadius: 3, minWidth: 48, px: 1.5 }}>
              <Send size={18} />
            </Button>
          </Stack>
          <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
            Press Enter to send • +10 Do Points per correct answer
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default PersonalAITutor;