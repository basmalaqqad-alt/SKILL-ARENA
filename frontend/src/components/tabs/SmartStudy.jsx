// src/components/tabs/SmartStudy.jsx
// Fix: DOCX → extract text via mammoth.js before sending to Gemini
// PDF → send as base64 (Gemini supports it)
// TXT → read as plain text

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import mammoth from 'mammoth/mammoth.browser';
import {
  Box, Typography, Paper, Stack, Chip, Avatar,
  TextField, Button, CircularProgress, IconButton,
  Divider, Tabs, Tab, Alert,
} from '@mui/material';
import {
  Bot, Send, Upload, FileText, File, X,
  Sparkles, RotateCcw,
} from 'lucide-react';

const BRAND      = '#8A2D2E';
const BRAND_SOFT = 'rgba(138,45,46,0.07)';
const BORDER     = 'rgba(0,0,0,0.08)';
const GOLD       = '#FACA07';

// ── Quick actions ─────────────────────────────────────────────────
const ACTIONS = [
  { id: 'explain',      label: 'Explain',         icon: '💡', prompt: 'Please explain this content clearly and in detail. Use simple language, examples, and structure your explanation with sections.' },
  { id: 'simplify',     label: 'Simplify',         icon: '🧩', prompt: 'Please simplify this content. Make it very easy to understand, as if explaining to a beginner. Use bullet points and plain language.' },
  { id: 'summarize',    label: 'Summarize',        icon: '📋', prompt: 'Please provide a concise, well-structured summary of this content. Highlight the most important points.' },
  { id: 'examples',     label: 'Add Examples',     icon: '🔍', prompt: 'Please enrich this content by adding detailed, real-world examples that help understand the concepts better.' },
  { id: 'translate_ar', label: 'Translate → AR',   icon: '🌍', prompt: 'Please translate this content into Arabic. Keep the structure and meaning intact.' },
  { id: 'translate_en', label: 'Translate → EN',   icon: '🌐', prompt: 'Please translate this content into English. Keep the structure and meaning intact.' },
  { id: 'rewrite',      label: 'Improve Writing',  icon: '✍️', prompt: 'Please rewrite and improve this content: fix structure, clarity, grammar, and flow. Make it professional and well-organized.' },
  { id: 'quiz_me',      label: 'Quiz Me',           icon: '❓', prompt: 'Based on this content, create 5 multiple-choice questions (A/B/C/D) to test understanding. Format them clearly with the correct answer indicated.' },
];

// ── File helpers ──────────────────────────────────────────────────
const fileIcon = (type) => {
  if (type === 'pdf') return <FileText size={15} color="#d32f2f" />;
  if (type === 'doc') return <FileText size={15} color="#1565c0" />;
  return <File size={15} color="#555" />;
};
const fileChipStyle = (type) => {
  if (type === 'pdf') return { color: '#d32f2f', bg: 'rgba(211,47,47,0.08)', label: 'PDF' };
  if (type === 'doc') return { color: '#1565c0', bg: 'rgba(21,101,192,0.08)', label: 'DOC' };
  return { color: '#555', bg: 'rgba(0,0,0,0.06)', label: 'FILE' };
};

// ── Extract text from file ────────────────────────────────────────
const extractFileContent = async (file) => {
  const name = file.name.toLowerCase();

  if (name.endsWith('.docx') || name.endsWith('.doc')) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        try {
          const arrayBuffer = ev.target.result;
          const result = await mammoth.extractRawText({ arrayBuffer });
          const text = result.value?.trim();
          if (!text) reject(new Error('Could not extract text from this Word file.'));
          else resolve({ text, base64: null, mimeType: null });
        } catch (err) {
          reject(new Error('Failed to read Word file: ' + err.message));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file.'));
      reader.readAsArrayBuffer(file);
    });
  }

  if (name.endsWith('.txt')) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (ev) => resolve({ text: ev.target.result, base64: null, mimeType: null });
      reader.onerror = () => reject(new Error('Failed to read text file.'));
      reader.readAsText(file);
    });
  }

  if (name.endsWith('.pdf')) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const b64 = ev.target.result.split(',')[1];
        resolve({ text: null, base64: b64, mimeType: 'application/pdf' });
      };
      reader.onerror = () => reject(new Error('Failed to read PDF file.'));
      reader.readAsDataURL(file);
    });
  }

  throw new Error('Unsupported file type. Please upload a PDF, Word (.docx), or TXT file.');
};

// ── Groq API Configuration ────────────────────────────────────────
// التعديل: القراءة من المتغيرات البيئية لضمان الأمان[cite: 1]
const GROQ_KEY = process.env.REACT_APP_GROQ_API_KEY;
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile'; 

const geminiPost = async (body) => {
  const parts = body?.contents?.[0]?.parts || [];
  let prompt = '';
  for (const p of parts) {
    if (p.text) prompt += p.text + '\n';
    if (p.inline_data) prompt += '[PDF document attached — analyze it based on the task]\n';
  }

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + GROQ_KEY,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: 'You are a smart study assistant helping students understand educational content. Respond clearly with structure, headings, and examples.' },
        { role: 'user',   content: prompt },
      ],
      max_tokens: 1500,
      temperature: 0.5,
    }),
  });

  const data = await res.json();
  if (data.error) throw new Error(data.error.message || 'Groq API error');
  return data.choices?.[0]?.message?.content || '';
};

const askGeminiText = async (text, prompt) => {
  const fullPrompt =
    'You are a smart study assistant helping a student understand educational content.\n\n' +
    '=== DOCUMENT CONTENT ===\n' + text.slice(0, 30000) + '\n=== END ===\n\n' +
    'Task: ' + prompt + '\n\n' +
    'Respond clearly, structured, with headings/bullets/examples where useful.';

  return geminiPost({
    contents: [{ parts: [{ text: fullPrompt }] }],
    generationConfig: { temperature: 0.5, maxOutputTokens: 1500 },
  });
};

const askGeminiPDF = async (base64, prompt) => {
  return geminiPost({
    contents: [{
      parts: [
        { inline_data: { mime_type: 'application/pdf', data: base64 } },
        { text: 'Task: ' + prompt + '\n\nRespond clearly, structured, with headings/bullets/examples.' },
      ]
    }],
    generationConfig: { temperature: 0.5, maxOutputTokens: 1500 },
  });
};

const MessageBubble = ({ msg }) => {
  const isUser = msg.role === 'user';
  return (
    <Box sx={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start',
      alignItems: 'flex-end', gap: 1, mb: 1.5 }}>
      {!isUser && (
        <Avatar sx={{ width: 30, height: 30, bgcolor: BRAND, flexShrink: 0 }}>
          <Bot size={16} color="#fff" />
        </Avatar>
      )}
      <Box sx={{
        maxWidth: '80%', px: 2, py: 1.5,
        borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
        bgcolor: isUser ? BRAND : '#fff',
        border: isUser ? 'none' : '1px solid ' + BORDER,
        boxShadow: isUser ? 'none' : '0 1px 4px rgba(0,0,0,0.05)',
      }}>
        {msg.action && (
          <Typography variant="caption" sx={{ fontWeight: 700,
            color: isUser ? 'rgba(255,255,255,0.7)' : '#9E9892',
            display: 'block', mb: 0.5 }}>
            {msg.action}
          </Typography>
        )}
        <Typography variant="body2" sx={{
          lineHeight: 1.75, whiteSpace: 'pre-wrap', fontSize: '0.875rem',
          color: isUser ? '#fff' : '#1A1614',
        }}>
          {msg.text}
        </Typography>
      </Box>
      {isUser && (
        <Avatar sx={{ width: 30, height: 30, bgcolor: '#4285F4',
          flexShrink: 0, fontSize: '0.72rem', fontWeight: 700 }}>
          {(localStorage.getItem('username') || 'U')[0].toUpperCase()}
        </Avatar>
      )}
    </Box>
  );
};

const SmartStudy = () => {
  const [tab,            setTab]            = useState(0);
  const [courses,        setCourses]        = useState([]);
  const [selectedSource, setSelectedSource] = useState(null);
  const [messages,       setMessages]       = useState([]);
  const [input,          setInput]          = useState('');
  const [loading,        setLoading]        = useState(false);
  const [loadingMsg,     setLoadingMsg]     = useState('');
  const [uploadError,    setUploadError]    = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => { fetchCourses(); }, []);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(
        'http://127.0.0.1:8000/api/learner/courses/enrolled/',
        { headers: { Authorization: 'Token ' + token } }
      );
      setCourses(res.data || []);
    } catch {}
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError('');
    setLoading(true);
    setLoadingMsg('Reading file…');

    try {
      const { text, base64, mimeType } = await extractFileContent(file);

      setSelectedSource({ name: file.name, text, base64, mimeType });
      setMessages([{
        role: 'ai',
        text: `📎 File loaded: **${file.name}**\n\nReady! Choose an action below or ask me anything about this document.`,
        id: Date.now(),
      }]);
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setLoading(false);
      setLoadingMsg('');
    }
  };

  const handleSelectCourseMaterial = async (mat) => {
    setLoading(true);
    setLoadingMsg('Loading file…');
    setUploadError('');
    try {
      const res  = await fetch(mat.file_url);
      const blob = await res.blob();
      const file = new File([blob], mat.title, { type: blob.type });
      const { text, base64, mimeType } = await extractFileContent(file);
      setSelectedSource({ name: mat.title, text, base64, mimeType });
      setMessages([{
        role: 'ai',
        text: `📚 File selected: **${mat.title}**\n\nReady! Choose an action or type your question.`,
        id: Date.now(),
      }]);
    } catch (err) {
      setMessages([{
        role: 'ai',
        text: '⚠️ Could not read this file: ' + err.message + '\n\nTry uploading it directly using the Upload tab.',
        id: Date.now(),
      }]);
    } finally {
      setLoading(false);
      setLoadingMsg('');
    }
  };

  const callGemini = async (prompt) => {
    if (!selectedSource) return;
    setLoading(true);
    setLoadingMsg('AI is analyzing your document…');
    try {
      let response;
      if (selectedSource.text) {
        response = await askGeminiText(selectedSource.text, prompt);
      } else if (selectedSource.base64 && selectedSource.mimeType === 'application/pdf') {
        response = await askGeminiPDF(selectedSource.base64, prompt);
      } else {
        throw new Error('Unknown file type. Please re-upload the file.');
      }
      setMessages(prev => [...prev, { role: 'ai', text: response, id: Date.now() }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'ai',
        text: '⚠️ ' + (err.message || 'Something went wrong. Please try again.'),
        id: Date.now(),
      }]);
    } finally {
      setLoading(false);
      setLoadingMsg('');
    }
  };

  const handleAction = async (action) => {
    if (!selectedSource || loading) return;
    setMessages(prev => [...prev, {
      role: 'user', text: action.icon + ' ' + action.label,
      action: 'Quick Action', id: Date.now(),
    }]);
    await callGemini(action.prompt);
  };

  const handleSend = async () => {
    if (!selectedSource || !input.trim() || loading) return;
    const text = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text, id: Date.now() }]);
    await callGemini(text);
  };

  const handleReset = () => {
    setSelectedSource(null);
    setMessages([]);
    setInput('');
    setUploadError('');
  };

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="flex-start">
        <Box sx={{ width: { xs: '100%', md: 300 }, flexShrink: 0 }}>
          <Paper sx={{ borderRadius: '16px', border: '1px solid ' + BORDER, overflow: 'hidden' }}>
            <Box sx={{ p: 2.5, background: `linear-gradient(135deg, ${BRAND} 0%, #5A1516 100%)`, color: '#fff' }}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 40, height: 40 }}>
                  <Bot size={22} color={GOLD} />
                </Avatar>
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: '1rem', lineHeight: 1 }}>Smart Study</Typography>
                  <Typography sx={{ fontSize: '0.72rem', opacity: 0.8 }}>AI-powered document assistant</Typography>
                </Box>
              </Stack>
            </Box>
            <Box sx={{ borderBottom: '1px solid ' + BORDER }}>
              <Tabs value={tab} onChange={(_, v) => setTab(v)}
                sx={{ '& .MuiTab-root': { fontSize: '0.78rem', minWidth: 'auto', px: 2, py: 1.25 },
                  '& .Mui-selected': { color: BRAND }, '& .MuiTabs-indicator': { bgcolor: BRAND } }}>
                <Tab label="Upload File" />
                <Tab label="Course Files" />
              </Tabs>
            </Box>
            <Box sx={{ p: 2 }}>
              {selectedSource && (
                <Box sx={{ mb: 2, p: 1.5, borderRadius: '10px', bgcolor: BRAND_SOFT,
                  border: '1px solid rgba(138,45,46,0.2)' }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <FileText size={14} color={BRAND} />
                    <Typography variant="caption" sx={{ fontWeight: 600, color: BRAND,
                      flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {selectedSource.name}
                    </Typography>
                    <IconButton size="small" onClick={handleReset} sx={{ p: 0.25, color: BRAND }}>
                      <X size={13} />
                    </IconButton>
                  </Stack>
                </Box>
              )}
              {uploadError && (
                <Alert severity="error" sx={{ mb: 1.5, borderRadius: 2, fontSize: '0.78rem' }}
                  onClose={() => setUploadError('')}>
                  {uploadError}
                </Alert>
              )}
              {tab === 0 && (
                <Box>
                  <Box
                    onClick={() => !loading && document.getElementById('smart-study-upload').click()}
                    sx={{
                      border: `1.5px dashed ${selectedSource ? BRAND : BORDER}`,
                      borderRadius: '12px', p: 2.5, textAlign: 'center',
                      cursor: loading ? 'wait' : 'pointer',
                      bgcolor: selectedSource ? BRAND_SOFT : 'transparent',
                      transition: '0.15s',
                      '&:hover': !loading ? { bgcolor: BRAND_SOFT, borderColor: BRAND } : {},
                    }}
                  >
                    <input
                      id="smart-study-upload" type="file" hidden
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleFileUpload}
                    />
                    {loading
                      ? <CircularProgress size={22} sx={{ color: BRAND, mb: 0.75 }} />
                      : <Upload size={24} color={selectedSource ? BRAND : '#9E9892'} style={{ marginBottom: 8 }} />
                    }
                    <Typography variant="body2" sx={{ fontWeight: 600,
                      color: selectedSource ? BRAND : '#9E9892', fontSize: '0.82rem' }}>
                      {loading ? loadingMsg : selectedSource ? selectedSource.name.slice(0, 22) + '…' : 'Upload PDF, Word, or TXT'}
                    </Typography>
                    {!loading && (
                      <Typography variant="caption" sx={{ color: '#B5B0AB' }}>
                        PDF · DOCX · TXT · max 10 MB
                      </Typography>
                    )}
                  </Box>
                </Box>
              )}
              {tab === 1 && (
                <Box>
                  {courses.length === 0 ? (
                    <Typography variant="body2" sx={{ color: '#9E9892', textAlign: 'center', py: 2 }}>
                      No enrolled courses found.
                    </Typography>
                  ) : (
                    courses.map(course => (
                      <Box key={course.id} sx={{ mb: 1.5 }}>
                        <Typography variant="overline" sx={{ color: '#9E9892', fontSize: '0.62rem', display: 'block', mb: 0.5 }}>
                          {course.title}
                        </Typography>
                        {(!course.materials || course.materials.length === 0) ? (
                          <Typography variant="caption" sx={{ color: '#B5B0AB', pl: 0.5 }}>No files</Typography>
                        ) : (
                          course.materials.map(mat => {
                            const chip = fileChipStyle(mat.material_type);
                            const isSelected = selectedSource?.name === mat.title;
                            return (
                              <Stack key={mat.id} direction="row" alignItems="center" spacing={1}
                                onClick={() => !loading && handleSelectCourseMaterial(mat)}
                                sx={{
                                  p: 1, borderRadius: '8px', cursor: loading ? 'wait' : 'pointer', mb: 0.5,
                                  border: '1px solid ' + (isSelected ? BRAND : BORDER),
                                  bgcolor: isSelected ? BRAND_SOFT : 'rgba(0,0,0,0.02)',
                                  transition: '0.15s',
                                  '&:hover': !loading ? { bgcolor: BRAND_SOFT, borderColor: BRAND } : {},
                                }}>
                                {fileIcon(mat.material_type)}
                                <Typography variant="caption" sx={{ fontWeight: 600, flexGrow: 1,
                                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                  fontSize: '0.78rem', color: isSelected ? BRAND : '#1A1614' }}>
                                  {mat.title}
                                </Typography>
                                <Chip label={chip.label} size="small"
                                  sx={{ height: 16, fontSize: '0.58rem', fontWeight: 700,
                                    bgcolor: chip.bg, color: chip.color, borderRadius: '3px' }} />
                              </Stack>
                            );
                          })
                        )}
                      </Box>
                    ))
                  )}
                </Box>
              )}
            </Box>
            {selectedSource && (
              <Box sx={{ px: 2, pb: 2 }}>
                <Divider sx={{ mb: 1.5 }} />
                <Typography variant="overline" sx={{ color: '#9E9892', fontSize: '0.62rem', display: 'block', mb: 1 }}>
                  QUICK ACTIONS
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                  {ACTIONS.map(a => (
                    <Chip key={a.id} label={a.icon + ' ' + a.label} size="small"
                      onClick={() => handleAction(a)}
                      disabled={loading}
                      sx={{ cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600, height: 26,
                        border: '1px solid ' + BORDER, bgcolor: 'transparent',
                        '&:hover': { bgcolor: BRAND_SOFT, borderColor: BRAND, color: BRAND },
                        transition: '0.15s',
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Paper>
        </Box>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Paper sx={{ borderRadius: '16px', border: '1px solid ' + BORDER,
            display: 'flex', flexDirection: 'column', height: 600, overflow: 'hidden' }}>
            <Box sx={{ px: 2.5, py: 1.75, borderBottom: '1px solid ' + BORDER,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Sparkles size={16} color={BRAND} />
                <Typography sx={{ fontWeight: 700, fontSize: '0.9rem' }}>
                  {selectedSource ? selectedSource.name : 'Smart Study Assistant'}
                </Typography>
              </Stack>
              {selectedSource && (
                <Button size="small" startIcon={<RotateCcw size={13} />} onClick={handleReset}
                  sx={{ fontSize: '0.72rem', color: '#9E9892', fontWeight: 600 }}>
                  New session
                </Button>
              )}
            </Box>
            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
              {messages.length === 0 && !selectedSource && (
                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', textAlign: 'center', px: 3 }}>
                  <Avatar sx={{ width: 56, height: 56, bgcolor: BRAND_SOFT, mb: 2 }}>
                    <Bot size={28} color={BRAND} />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    Smart Study Assistant
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#9E9892', maxWidth: 300 }}>
                    Upload a PDF, Word (.docx), or TXT file — or select from your course materials.
                  </Typography>
                </Box>
              )}
              {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}
              {loading && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  <Avatar sx={{ width: 30, height: 30, bgcolor: BRAND }}>
                    <Bot size={16} color="#fff" />
                  </Avatar>
                  <Box sx={{ px: 2, py: 1.5, borderRadius: '16px 16px 16px 4px',
                    bgcolor: '#fff', border: '1px solid ' + BORDER }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <CircularProgress size={12} sx={{ color: BRAND }} />
                      <Typography variant="caption" sx={{ color: '#9E9892' }}>
                        {loadingMsg || 'Thinking…'}
                      </Typography>
                    </Stack>
                  </Box>
                </Box>
              )}
              <div ref={chatEndRef} />
            </Box>
            <Box sx={{ p: 2, borderTop: '1px solid ' + BORDER, bgcolor: '#FAFAF9' }}>
              {!selectedSource ? (
                <Typography variant="body2" sx={{ textAlign: 'center', color: '#B5B0AB', py: 0.5 }}>
                  ← Upload or select a file to start
                </Typography>
              ) : (
                <Stack direction="row" spacing={1} alignItems="center">
                  <TextField
                    fullWidth size="small"
                    placeholder="Ask anything about this document…"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                    disabled={loading}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                  />
                  <IconButton onClick={handleSend}
                    disabled={loading || !input.trim()}
                    sx={{ bgcolor: BRAND, color: '#fff', borderRadius: '10px', width: 40, height: 40,
                      '&:hover': { bgcolor: '#721F20' }, '&.Mui-disabled': { bgcolor: BORDER } }}>
                    <Send size={17} />
                  </IconButton>
                </Stack>
              )}
            </Box>
          </Paper>
        </Box>
      </Stack>
    </Box>
  );
};

export default SmartStudy;