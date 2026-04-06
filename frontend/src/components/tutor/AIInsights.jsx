import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Box, Typography, Paper, Grid, CircularProgress,
  Stack, Chip, LinearProgress, Avatar, Button, TextField,
} from '@mui/material';
import { BarChart2, TrendingUp, Users, AlertCircle, Star, BookOpen, DollarSign, Award, Zap, BrainCircuit, Sparkles, Send } from 'lucide-react';

const MAROON = '#9A2F2E';
const MAROON_LIGHT = 'rgba(154, 47, 46, 0.08)';
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_KEY;

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
        generationConfig: { temperature: 0.7, maxOutputTokens: 600 },
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

const StatCard = ({ icon: Icon, title, value, subtitle, color = MAROON }) => (
  <Paper sx={{ p: 2.5, borderRadius: 3, border: `2px solid ${MAROON_LIGHT}`, bgcolor: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: 2 }}>
    <Avatar sx={{ bgcolor: color, width: 48, height: 48 }}><Icon size={24} color="#fff" /></Avatar>
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 900, color: MAROON, lineHeight: 1.2 }}>{value}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 700 }}>{title}</Typography>
      {subtitle && <Typography variant="caption" sx={{ color: 'text.secondary' }}>{subtitle}</Typography>}
    </Box>
  </Paper>
);

const AIInsights = () => {
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role: 'ai', text: "Hi! 👋 I'm your AI teaching assistant powered by Gemini. Ask me anything about your students or courses!" }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Token ${token}` };
        const [coursesRes, studentsRes] = await Promise.all([
          axios.get('http://127.0.0.1:8000/api/tutor/courses/list/', { headers }),
          axios.get('http://127.0.0.1:8000/api/accounts/tutor/my-students/', { headers }),
        ]);
        setCourses(coursesRes.data || []);
        setStudents(studentsRes.data || []);
      } catch (err) {
        console.error('Failed to fetch:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (courses.length > 0 || students.length > 0) generateAIAnalysis();
  }, [courses, students]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const buildContext = () => {
    const courseStats = courses.map(course => {
      const enrolled = students.filter(s => s.courses.some(c => c.course_id === course.id));
      const completed = students.filter(s => s.courses.some(c => c.course_id === course.id && c.completed));
      const avgProgress = enrolled.length > 0
        ? Math.round(enrolled.reduce((sum, s) => { const c = s.courses.find(c => c.course_id === course.id); return sum + (c?.progress || 0); }, 0) / enrolled.length)
        : 0;
      return { ...course, enrolledCount: enrolled.length, completedCount: completed.length, completionRate: enrolled.length > 0 ? Math.round((completed.length / enrolled.length) * 100) : 0, avgProgress };
    });
    return courseStats;
  };

  const generateAIAnalysis = async () => {
    setAiLoading(true);
    try {
      const courseStats = buildContext();
      const prompt = `You are an AI teaching advisor for SkillArena platform.

Tutor's data:
- Total courses: ${courses.length}
- Total students: ${students.length}
- Courses breakdown:
${courseStats.map(c => `  * "${c.title}": ${c.enrolledCount} students enrolled, ${c.completionRate}% completion rate, avg progress ${c.avgProgress}%`).join('\n')}

Give a SHORT, insightful analysis (4-5 sentences) including:
1. What's going well
2. What needs attention
3. One specific actionable tip to improve student engagement

Be direct, data-driven, and use emojis. Respond in English.`;

      const result = await askGemini(prompt);
      setAiAnalysis(result);
    } catch (err) {
      setAiAnalysis('Unable to load AI analysis right now. Please try again.');
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
      const courseStats = buildContext();
      const prompt = `You are a helpful AI teaching assistant on SkillArena platform.

Tutor context:
- Courses: ${courses.map(c => c.title).join(', ') || 'None'}
- Students: ${students.length}
- Course stats: ${courseStats.map(c => `${c.title}: ${c.enrolledCount} students, ${c.completionRate}% completion`).join(' | ')}

Tutor question: "${userMessage}"

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

  const courseStats = buildContext();
  const bestCourse = [...courseStats].sort((a, b) => b.completionRate - a.completionRate)[0];
  const needsImprovementCourse = [...courseStats].filter(c => c.enrolledCount > 0).sort((a, b) => a.completionRate - b.completionRate)[0];
  const stuckStudents = students.filter(s => s.courses.some(c => c.progress > 0 && c.progress < 100 && !c.completed));
  const paidCourses = courses.filter(c => c.is_paid && Number(c.price) > 0);
  const estimatedEarnings = paidCourses.reduce((sum, course) => {
    const stat = courseStats.find(cs => cs.id === course.id);
    return sum + (stat?.enrolledCount || 0) * Number(course.price);
  }, 0);
  const totalCompletions = students.reduce((sum, s) => sum + s.courses.filter(c => c.completed).length, 0);

  return (
    <Box>
      {/* Header */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, background: 'linear-gradient(135deg, #9A2F2E 0%, #4A1516 100%)', color: 'white' }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 52, height: 52 }}><BarChart2 size={28} color="#FACA07" /></Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 900 }}>AI Tutor Insights</Typography>
            <Typography variant="body2" sx={{ opacity: 0.85 }}>Powered by Google Gemini AI — real-time smart analysis</Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}><StatCard icon={Users} title="Total Students" value={students.length} subtitle="enrolled in your courses" /></Grid>
        <Grid item xs={6} md={3}><StatCard icon={BookOpen} title="Total Courses" value={courses.length} subtitle="published by you" /></Grid>
        <Grid item xs={6} md={3}><StatCard icon={Award} title="Completions" value={totalCompletions} subtitle="courses fully completed" color="#2e7d32" /></Grid>
        <Grid item xs={6} md={3}><StatCard icon={DollarSign} title="Est. Earnings" value={`SAR ${estimatedEarnings.toFixed(0)}`} subtitle="from paid enrollments" color="#ed6c02" /></Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Stack spacing={3}>
            {/* Gemini AI Analysis */}
            <Paper sx={{ p: 3, borderRadius: 3, border: `2px solid rgba(66,133,244,0.3)`, bgcolor: 'rgba(66,133,244,0.03)' }}>
              <Typography variant="h6" sx={{ fontWeight: 900, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <BrainCircuit size={20} color="#4285F4" /> AI Teaching Analysis
                <Chip label="Gemini AI ✨" size="small" sx={{ bgcolor: 'rgba(66,133,244,0.1)', color: '#4285F4', fontWeight: 700, ml: 1 }} />
              </Typography>
              {aiLoading ? (
                <Stack direction="row" spacing={2} alignItems="center">
                  <CircularProgress size={20} sx={{ color: '#4285F4' }} />
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>Gemini is analyzing your data...</Typography>
                </Stack>
              ) : (
                <>
                  <Typography variant="body2" sx={{ lineHeight: 1.9, whiteSpace: 'pre-wrap' }}>{aiAnalysis}</Typography>
                  <Button size="small" onClick={generateAIAnalysis} sx={{ mt: 1.5, color: '#4285F4', fontWeight: 700 }} startIcon={<Sparkles size={16} />}>Refresh Analysis</Button>
                </>
              )}
            </Paper>

            {/* Course Performance */}
            <Paper sx={{ p: 3, borderRadius: 3, border: `2px solid ${MAROON_LIGHT}`, bgcolor: 'rgba(255,255,255,0.6)' }}>
              <Typography variant="h6" sx={{ fontWeight: 900, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUp size={20} color={MAROON} /> Course Performance
              </Typography>
              {courseStats.length === 0 ? (
                <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>No courses yet. Publish your first course to see analytics!</Typography>
              ) : (
                <Stack spacing={2.5}>
                  {courseStats.map(course => (
                    <Box key={course.id}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 800 }} noWrap>{course.title}</Typography>
                        <Stack direction="row" spacing={1}>
                          <Chip label={`${course.enrolledCount} students`} size="small" sx={{ bgcolor: MAROON_LIGHT, color: MAROON, fontWeight: 700 }} />
                          <Chip label={`${course.completionRate}% done`} size="small" sx={{ bgcolor: course.completionRate >= 70 ? 'rgba(46,125,50,0.1)' : 'rgba(237,108,2,0.1)', color: course.completionRate >= 70 ? '#2e7d32' : '#ed6c02', fontWeight: 700 }} />
                        </Stack>
                      </Stack>
                      <LinearProgress variant="determinate" value={course.avgProgress} sx={{ height: 8, borderRadius: 4, bgcolor: 'rgba(0,0,0,0.06)', '& .MuiLinearProgress-bar': { bgcolor: MAROON } }} />
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>Avg progress: {course.avgProgress}%</Typography>
                    </Box>
                  ))}
                </Stack>
              )}
            </Paper>

            {/* AI Chat */}
            <Paper sx={{ p: 3, borderRadius: 3, border: `2px solid ${MAROON_LIGHT}`, bgcolor: 'rgba(255,255,255,0.6)' }}>
              <Typography variant="h6" sx={{ fontWeight: 900, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Sparkles size={20} color={MAROON} /> Chat with AI Assistant
                <Chip label="Gemini AI ✨" size="small" sx={{ bgcolor: 'rgba(66,133,244,0.1)', color: '#4285F4', fontWeight: 700, ml: 1 }} />
              </Typography>
              <Box sx={{ maxHeight: 250, overflowY: 'auto', mb: 2, display: 'flex', flexDirection: 'column', gap: 1.5, p: 0.5 }}>
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
                <TextField fullWidth size="small" placeholder="Ask about your students or courses..." value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()} disabled={chatLoading} />
                <Button variant="contained" onClick={sendChatMessage} disabled={chatLoading || !chatInput.trim()}
                  sx={{ bgcolor: MAROON, '&:hover': { bgcolor: '#7a2627' }, minWidth: 48, px: 1.5 }}>
                  <Send size={18} />
                </Button>
              </Stack>
            </Paper>
          </Stack>
        </Grid>

        <Grid item xs={12} md={5}>
          <Stack spacing={2}>
            {bestCourse && bestCourse.enrolledCount > 0 && (
              <Paper sx={{ p: 2.5, borderRadius: 3, border: '2px solid rgba(46,125,50,0.2)', bgcolor: 'rgba(46,125,50,0.04)' }}>
                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                  <Star size={22} color="#2e7d32" fill="#2e7d32" />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#2e7d32', mb: 0.5 }}>🏆 Top Performing Course</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>"{bestCourse.title}"</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>{bestCourse.completionRate}% completion rate!</Typography>
                  </Box>
                </Stack>
              </Paper>
            )}

            {needsImprovementCourse && needsImprovementCourse.completionRate < 50 && (
              <Paper sx={{ p: 2.5, borderRadius: 3, border: '2px solid rgba(237,108,2,0.2)', bgcolor: 'rgba(237,108,2,0.04)' }}>
                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                  <AlertCircle size={22} color="#ed6c02" />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#ed6c02', mb: 0.5 }}>⚠️ Needs Improvement</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>"{needsImprovementCourse.title}"</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>Only {needsImprovementCourse.completionRate}% completion.</Typography>
                  </Box>
                </Stack>
              </Paper>
            )}

            <Paper sx={{ p: 2.5, borderRadius: 3, border: `2px solid ${MAROON_LIGHT}`, bgcolor: 'rgba(255,255,255,0.6)' }}>
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <Zap size={22} color={MAROON} />
                <Box sx={{ width: '100%' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 900, color: MAROON, mb: 1 }}>💡 Students Need Attention</Typography>
                  {stuckStudents.length === 0 ? (
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>All students are progressing well! 🎉</Typography>
                  ) : (
                    <>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
                        {stuckStudents.length} student{stuckStudents.length > 1 ? 's' : ''} haven't finished yet
                      </Typography>
                      <Stack spacing={0.5}>
                        {stuckStudents.slice(0, 3).map(s => (
                          <Chip key={s.id} avatar={<Avatar sx={{ bgcolor: MAROON, fontSize: '0.7rem' }}>{s.username.charAt(0).toUpperCase()}</Avatar>}
                            label={s.username} size="small" sx={{ bgcolor: MAROON_LIGHT, fontWeight: 700, justifyContent: 'flex-start' }} />
                        ))}
                        {stuckStudents.length > 3 && <Typography variant="caption" sx={{ color: 'text.secondary' }}>+{stuckStudents.length - 3} more</Typography>}
                      </Stack>
                    </>
                  )}
                </Box>
              </Stack>
            </Paper>

            {paidCourses.length > 0 && (
              <Paper sx={{ p: 2.5, borderRadius: 3, border: '2px solid rgba(250,202,7,0.3)', bgcolor: 'rgba(250,202,7,0.05)' }}>
                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                  <DollarSign size={22} color="#b8860b" />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#b8860b', mb: 0.5 }}>💰 Earnings Breakdown</Typography>
                    {paidCourses.map(c => {
                      const stat = courseStats.find(cs => cs.id === c.id);
                      return <Typography key={c.id} variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>{c.title}: {stat?.enrolledCount || 0} × SAR {Number(c.price)} = SAR {((stat?.enrolledCount || 0) * Number(c.price)).toFixed(0)}</Typography>;
                    })}
                  </Box>
                </Stack>
              </Paper>
            )}
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AIInsights;
