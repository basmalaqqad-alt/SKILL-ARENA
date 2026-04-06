import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Box, Typography, Paper, Grid, Stack, Chip, Avatar,
  LinearProgress, CircularProgress, TextField, Button,
} from '@mui/material';
import { Sparkles, BrainCircuit, Trophy, TrendingUp, CheckCircle, Clock, Zap, Send } from 'lucide-react';

const MAROON = '#9A2F2E';
const MAROON_LIGHT = 'rgba(154, 47, 46, 0.08)';
const GEMINI_API_KEY = 'AIzaSyBb4-7E61AZ2HhwfW41FY-2lNucffKl3Xc';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const askGemini = async (prompt) => {
  await sleep(2000);
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 500 },
      }),
    }
  );
  const data = await response.json();
  if (data.error) {
    console.error('Gemini API Error:', data.error);
    return `API Error: ${data.error.message}`;
  }
  if (!data.candidates || data.candidates.length === 0) {
    console.error('Gemini empty response:', data);
    return 'No candidates returned. Check API key or quota.';
  }
  return data.candidates[0].content.parts[0].text;
};

const AITab = ({ userName = 'Hero' }) => {
  const [profile, setProfile] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiRecommendation, setAiRecommendation] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role: 'ai', text: `Hi ${userName}! 👋 I'm your AI learning assistant powered by Gemini. Ask me anything about your courses or learning path!` }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Token ${token}` };
        const [profileRes, leaderRes] = await Promise.all([
          axios.get('http://127.0.0.1:8000/api/accounts/profile/', { headers }),
          axios.get('http://127.0.0.1:8000/api/accounts/leaderboard/', { headers }),
        ]);
        setProfile(profileRes.data);
        setLeaderboard(leaderRes.data || []);
      } catch (err) {
        console.error('Failed to fetch:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (profile) generateAIRecommendation();
  }, [profile]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const generateAIRecommendation = async () => {
    setAiLoading(true);
    try {
      const xp = profile?.experience ?? 0;
      const rank = profile?.rank_name || 'Novice';
      const completed = profile?.completed_courses ?? [];
      const inProgress = profile?.in_progress_courses ?? [];

      const prompt = `You are an AI learning advisor for SkillArena, an online learning platform.

Student profile:
- Name: ${userName}
- XP: ${xp}
- Rank: ${rank}
- Completed courses: ${completed.map(c => c.title).join(', ') || 'None yet'}
- In progress: ${inProgress.map(c => `${c.title} (${c.progress}%)`).join(', ') || 'None'}

Give a SHORT, motivating, personalized learning recommendation (3-4 sentences max).
Include:
1. One specific next step based on their progress
2. One motivational insight about their rank
3. A suggested focus area

Be friendly, energetic, and use emojis. Respond in English.`;

      const result = await askGemini(prompt);
      setAiRecommendation(result);
    } catch (err) {
      setAiRecommendation('Unable to load AI recommendations right now. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMessage = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setChatLoading(true);
    try {
      const xp = profile?.experience ?? 0;
      const rank = profile?.rank_name || 'Novice';
      const completed = profile?.completed_courses ?? [];
      const inProgress = profile?.in_progress_courses ?? [];

      const prompt = `You are a friendly AI learning assistant on SkillArena platform.

Student context:
- Name: ${userName}, XP: ${xp}, Rank: ${rank}
- Completed: ${completed.map(c => c.title).join(', ') || 'None'}
- In progress: ${inProgress.map(c => c.title).join(', ') || 'None'}

Student question: "${userMessage}"

Answer helpfully and concisely (2-3 sentences). Be friendly and use emojis. Respond in the same language as the question.`;

      const result = await askGemini(prompt);
      setChatMessages(prev => [...prev, { role: 'ai', text: result }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'ai', text: '❌ Sorry, could not process your request. Please try again.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress sx={{ color: MAROON }} /></Box>;
  }

  const xp = profile?.experience ?? 0;
  const rankName = profile?.rank_name || 'Novice';
  const progressPercent = profile?.progress_percentage ?? 0;
  const completedCourses = profile?.completed_courses ?? [];
  const inProgressCourses = profile?.in_progress_courses ?? [];

  const rankThresholds = [
    { name: 'Novice', max: 999, next: 'Warrior' },
    { name: 'Warrior', max: 4999, next: 'Knight' },
    { name: 'Knight', max: 14999, next: 'Master' },
    { name: 'Master', max: 49999, next: 'Legend' },
    { name: 'Legend', max: Infinity, next: null },
  ];
  const currentRank = rankThresholds.find(r => xp <= r.max) || rankThresholds[0];
  const xpToNextRank = currentRank.next ? currentRank.max + 1 - xp : 0;
  const myRank = leaderboard.find(p => p.username === profile?.username);
  const nextRankPlayer = myRank ? leaderboard.find(p => p.rank === myRank.rank - 1) : null;
  const xpGapToNext = nextRankPlayer ? nextRankPlayer.xp - xp : null;

  return (
    <Box sx={{ p: 1 }}>
      {/* Header */}
      <Paper elevation={0} sx={{ p: 4, borderRadius: 4, background: 'linear-gradient(135deg, #9A2F2E 0%, #4A1516 100%)', color: 'white', mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 60, height: 60 }}>
            <Sparkles size={32} color="#FACA07" />
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 900 }}>AI Personal Insights</Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>Powered by Google Gemini AI — personalized just for you, {userName} 🚀</Typography>
          </Box>
        </Stack>
      </Paper>

      {/* XP Progress */}
      <Paper sx={{ p: 3, borderRadius: 3, mb: 3, border: `2px solid ${MAROON_LIGHT}`, bgcolor: 'rgba(255,255,255,0.6)' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 900, display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUp size={20} color={MAROON} /> Your Rank Progress
          </Typography>
          <Chip label={rankName.toUpperCase()} sx={{ bgcolor: '#FACA07', color: '#000', fontWeight: 900 }} />
        </Stack>
        <LinearProgress variant="determinate" value={progressPercent} sx={{ height: 12, borderRadius: 6, bgcolor: MAROON_LIGHT, '& .MuiLinearProgress-bar': { bgcolor: MAROON }, mb: 1 }} />
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="caption" sx={{ fontWeight: 700 }}>{xp} XP</Typography>
          {currentRank.next
            ? <Typography variant="caption" sx={{ color: 'text.secondary' }}>{xpToNextRank} XP to reach <strong>{currentRank.next}</strong></Typography>
            : <Typography variant="caption" sx={{ color: MAROON, fontWeight: 800 }}>🏆 MAX RANK — LEGEND!</Typography>}
        </Stack>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Stack spacing={3}>

            {/* Gemini Recommendation */}
            <Paper sx={{ p: 3, borderRadius: 3, border: `2px solid rgba(66,133,244,0.3)`, bgcolor: 'rgba(66,133,244,0.03)' }}>
              <Typography variant="h6" sx={{ fontWeight: 900, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <BrainCircuit size={20} color="#4285F4" /> AI Recommendation
                <Chip label="Gemini AI ✨" size="small" sx={{ bgcolor: 'rgba(66,133,244,0.1)', color: '#4285F4', fontWeight: 700, ml: 1 }} />
              </Typography>
              {aiLoading ? (
                <Stack direction="row" spacing={2} alignItems="center">
                  <CircularProgress size={20} sx={{ color: '#4285F4' }} />
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>Gemini is analyzing your profile...</Typography>
                </Stack>
              ) : (
                <>
                  <Typography variant="body2" sx={{ lineHeight: 1.9, color: 'text.primary', whiteSpace: 'pre-wrap' }}>{aiRecommendation}</Typography>
                  <Button size="small" onClick={generateAIRecommendation} sx={{ mt: 1.5, color: '#4285F4', fontWeight: 700 }} startIcon={<Sparkles size={16} />}>
                    Refresh
                  </Button>
                </>
              )}
            </Paper>

            {/* AI Chat */}
            <Paper sx={{ p: 3, borderRadius: 3, border: `2px solid ${MAROON_LIGHT}`, bgcolor: 'rgba(255,255,255,0.6)' }}>
              <Typography variant="h6" sx={{ fontWeight: 900, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Sparkles size={20} color={MAROON} /> Chat with AI Assistant
                <Chip label="Gemini AI ✨" size="small" sx={{ bgcolor: 'rgba(66,133,244,0.1)', color: '#4285F4', fontWeight: 700, ml: 1 }} />
              </Typography>
              <Box sx={{ maxHeight: 280, overflowY: 'auto', mb: 2, display: 'flex', flexDirection: 'column', gap: 1.5, p: 1 }}>
                {chatMessages.map((msg, idx) => (
                  <Box key={idx} sx={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                    <Box sx={{ maxWidth: '80%', p: 1.5, borderRadius: 2, bgcolor: msg.role === 'user' ? MAROON : 'rgba(66,133,244,0.08)', color: msg.role === 'user' ? '#fff' : 'text.primary' }}>
                      <Typography variant="body2" sx={{ lineHeight: 1.6 }}>{msg.text}</Typography>
                    </Box>
                  </Box>
                ))}
                {chatLoading && (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CircularProgress size={16} sx={{ color: '#4285F4' }} />
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>AI is thinking...</Typography>
                  </Stack>
                )}
                <div ref={chatEndRef} />
              </Box>
              <Stack direction="row" spacing={1}>
                <TextField fullWidth size="small" placeholder="Ask me anything about your learning..." value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()} disabled={chatLoading} />
                <Button variant="contained" onClick={sendChatMessage} disabled={chatLoading || !chatInput.trim()}
                  sx={{ bgcolor: MAROON, '&:hover': { bgcolor: '#7a2627' }, minWidth: 48, px: 1.5 }}>
                  <Send size={18} />
                </Button>
              </Stack>
            </Paper>

            {/* In Progress */}
            {inProgressCourses.length > 0 && (
              <Paper sx={{ p: 3, borderRadius: 3, border: `2px solid ${MAROON_LIGHT}`, bgcolor: 'rgba(255,255,255,0.6)' }}>
                <Typography variant="h6" sx={{ fontWeight: 900, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Clock size={20} color={MAROON} /> Continue Learning
                </Typography>
                <Stack spacing={2}>
                  {inProgressCourses.map((course) => (
                    <Box key={course.id}>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>{course.title}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: MAROON }}>{course.progress ?? 0}%</Typography>
                      </Stack>
                      <LinearProgress variant="determinate" value={course.progress ?? 0} sx={{ height: 8, borderRadius: 4, bgcolor: 'rgba(0,0,0,0.05)', '& .MuiLinearProgress-bar': { bgcolor: MAROON } }} />
                    </Box>
                  ))}
                </Stack>
              </Paper>
            )}
          </Stack>
        </Grid>

        <Grid item xs={12} md={5}>
          <Stack spacing={3}>
            {/* Leaderboard */}
            <Paper sx={{ p: 3, borderRadius: 3, border: `2px solid ${MAROON_LIGHT}`, bgcolor: 'rgba(255,255,255,0.6)' }}>
              <Typography variant="h6" sx={{ fontWeight: 900, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Trophy size={20} color={MAROON} /> Leaderboard Position
              </Typography>
              {myRank ? (
                <Stack spacing={1}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>Your rank</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 900, color: MAROON }}>#{myRank.rank}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>Your XP</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 900 }}>{xp} XP</Typography>
                  </Stack>
                  {xpGapToNext !== null && xpGapToNext > 0 && (
                    <Box sx={{ mt: 1, p: 1.5, borderRadius: 2, bgcolor: MAROON_LIGHT }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: MAROON }}>
                        💡 Only <strong>{xpGapToNext} more XP</strong> to beat <strong>{nextRankPlayer?.username}</strong> and reach #{myRank.rank - 1}!
                      </Typography>
                    </Box>
                  )}
                  {myRank.rank === 1 && (
                    <Box sx={{ mt: 1, p: 1.5, borderRadius: 2, bgcolor: 'rgba(250,202,7,0.1)' }}>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: '#b8860b' }}>🏆 You're #1! Keep it up!</Typography>
                    </Box>
                  )}
                </Stack>
              ) : (
                <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>Complete courses to appear on the leaderboard!</Typography>
              )}
            </Paper>

            {/* Stats */}
            <Paper sx={{ p: 3, borderRadius: 3, border: `2px solid ${MAROON_LIGHT}`, bgcolor: 'rgba(255,255,255,0.6)' }}>
              <Typography variant="h6" sx={{ fontWeight: 900, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Zap size={20} color={MAROON} /> Your Stats
              </Typography>
              <Stack spacing={1.5}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>Total XP</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 900, color: MAROON }}>{xp} XP</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>Courses completed</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 900 }}>{completedCourses.length}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>In progress</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 900 }}>{inProgressCourses.length}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>Current rank</Typography>
                  <Chip label={rankName} size="small" sx={{ bgcolor: '#FACA07', color: '#000', fontWeight: 800 }} />
                </Stack>
              </Stack>
            </Paper>

            {completedCourses.length > 0 && (
              <Paper sx={{ p: 3, borderRadius: 3, border: '2px solid rgba(46,125,50,0.15)', bgcolor: 'rgba(46,125,50,0.03)' }}>
                <Typography variant="h6" sx={{ fontWeight: 900, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircle size={20} color="#2e7d32" /> Completed ({completedCourses.length})
                </Typography>
                <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
                  {completedCourses.map((c) => (
                    <Chip key={c.id} icon={<CheckCircle size={14} color="#2e7d32" />} label={c.title} size="small"
                      sx={{ bgcolor: 'rgba(46,125,50,0.1)', color: '#2e7d32', fontWeight: 700 }} />
                  ))}
                </Stack>
              </Paper>
            )}
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AITab;
