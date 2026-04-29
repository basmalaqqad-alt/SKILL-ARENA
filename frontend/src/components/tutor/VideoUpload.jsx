// frontend/src/components/tutor/VideoUpload.jsx
// Step-based course creation: Info → Sections & Content → Done

import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, Paper, Button, TextField, Stack, Chip,
  Alert, CircularProgress, FormControlLabel, Switch, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Collapse, Tooltip, LinearProgress, Avatar,
} from '@mui/material';
import {
  Upload, Video, Trash2, Plus, FileText, File,
  Sparkles, Play, ChevronDown, ChevronUp,
  BookOpen, Layers, CheckCircle2, ArrowRight, ArrowLeft,
} from 'lucide-react';
import axios from 'axios';

const BRAND      = '#8A2D2E';
const BRAND_SOFT = 'rgba(138,45,46,0.08)';
const BORDER     = 'rgba(0,0,0,0.08)';
const GREEN      = '#2e7d32';
const GEMINI_KEY = 'AIzaSyBLrdcKH-XQmsMNzNIRNWezaM6FQgCBImw';

const DIFFICULTY = [
  { value: 'beginner',     label: 'Beginner',     color: '#2e7d32', bg: 'rgba(46,125,50,0.08)' },
  { value: 'intermediate', label: 'Intermediate', color: '#c77800', bg: 'rgba(199,120,0,0.08)' },
  { value: 'advanced',     label: 'Advanced',     color: BRAND,     bg: BRAND_SOFT             },
];

const api = (path) => `http://127.0.0.1:8000/api${path}`;
const auth = () => ({ Authorization: 'Token ' + localStorage.getItem('token') });

const getAISummary = async (title, desc) => {
  try {
    const prompt =
      'You are an expert educational content summarizer.\n\n' +
      'Course: "' + title + '"\nDescription: "' + (desc || 'none') + '"\n\n' +
      'Generate a professional summary:\n' +
      '📚 WHAT YOU WILL LEARN: (2-3 outcomes)\n' +
      '🎯 TARGET AUDIENCE:\n' +
      '🔑 KEY TOPICS: (3-4 topics)\n\nConcise and professional.';
    const res = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + GEMINI_KEY,
      { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.6, maxOutputTokens: 350 } }) }
    );
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch { return null; }
};

// ── Small helpers ─────────────────────────────────────────────────
const fileIcon = (type) => {
  if (type === 'pdf') return <FileText size={15} color="#d32f2f" />;
  if (type === 'doc') return <FileText size={15} color="#1565c0" />;
  return <File size={15} color="#555" />;
};
const fileChip = (type) => {
  if (type === 'pdf') return { label: 'PDF',  color: '#d32f2f', bg: 'rgba(211,47,47,0.08)' };
  if (type === 'doc') return { label: 'DOC',  color: '#1565c0', bg: 'rgba(21,101,192,0.08)' };
  return                     { label: 'FILE', color: '#555',    bg: 'rgba(0,0,0,0.06)' };
};

// ── Step indicator ────────────────────────────────────────────────
const StepBar = ({ step }) => (
  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
    {[
      { n: 1, label: 'Course Info' },
      { n: 2, label: 'Content'     },
      { n: 3, label: 'Done'        },
    ].map((s, i) => (
      <React.Fragment key={s.n}>
        <Stack alignItems="center" spacing={0.4}>
          <Avatar sx={{
            width: 30, height: 30, fontSize: '0.8rem', fontWeight: 800,
            bgcolor: step >= s.n ? BRAND : 'rgba(0,0,0,0.08)',
            color:   step >= s.n ? '#fff' : '#9E9892',
          }}>
            {step > s.n ? <CheckCircle2 size={16} /> : s.n}
          </Avatar>
          <Typography sx={{ fontSize: '0.65rem', fontWeight: step === s.n ? 700 : 400, color: step >= s.n ? BRAND : '#9E9892' }}>
            {s.label}
          </Typography>
        </Stack>
        {i < 2 && <Box sx={{ flex: 1, height: 2, bgcolor: step > s.n ? BRAND : 'rgba(0,0,0,0.08)', borderRadius: 1, mb: 2 }} />}
      </React.Fragment>
    ))}
  </Stack>
);

// ── Upload zone ───────────────────────────────────────────────────
const UploadZone = ({ id, accept, icon: Icon, label, fileName, color = BRAND, onChange }) => (
  <Box
    onClick={() => document.getElementById(id)?.click()}
    sx={{
      border: `1.5px dashed ${fileName ? GREEN : color}`,
      borderRadius: '10px', p: 2, textAlign: 'center', cursor: 'pointer',
      bgcolor: fileName ? 'rgba(46,125,50,0.03)' : 'rgba(138,45,46,0.02)',
      transition: '0.15s', '&:hover': { bgcolor: 'rgba(138,45,46,0.04)' },
    }}
  >
    <input id={id} type="file" accept={accept} hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) onChange(f); }} />
    <Icon size={22} color={fileName ? GREEN : color} style={{ marginBottom: 6 }} />
    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.82rem', color: fileName ? GREEN : color }}>
      {fileName || label}
    </Typography>
  </Box>
);

// ── Section card ──────────────────────────────────────────────────
const SectionCard = ({ section, courseId, onRefresh, onDeleteSection }) => {
  const [expanded,    setExpanded]    = useState(true);
  const [vidDialog,   setVidDialog]   = useState(false);
  const [matDialog,   setMatDialog]   = useState(false);
  const [vidFile,     setVidFile]     = useState(null);
  const [vidTitle,    setVidTitle]    = useState('');
  const [matFile,     setMatFile]     = useState(null);
  const [matTitle,    setMatTitle]    = useState('');
  const [uploading,   setUploading]   = useState(false);

  const uploadVideo = async () => {
    if (!vidFile) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('video_file', vidFile);
      fd.append('title',      vidTitle || vidFile.name);
      fd.append('section_id', section.id);
      await axios.post(api(`/tutor/courses/${courseId}/videos/`), fd,
        { headers: { ...auth(), 'Content-Type': 'multipart/form-data' } });
      setVidDialog(false); setVidFile(null); setVidTitle('');
      onRefresh();
    } catch (e) { alert(e.response?.data?.error || 'Upload failed'); }
    finally { setUploading(false); }
  };

  const uploadMaterial = async () => {
    if (!matFile) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file',       matFile);
      fd.append('title',      matTitle || matFile.name);
      fd.append('section_id', section.id);
      await axios.post(api(`/tutor/courses/${courseId}/materials/`), fd,
        { headers: { ...auth(), 'Content-Type': 'multipart/form-data' } });
      setMatDialog(false); setMatFile(null); setMatTitle('');
      onRefresh();
    } catch (e) { alert(e.response?.data?.error || 'Upload failed'); }
    finally { setUploading(false); }
  };

  const deleteVideo = async (vidId) => {
    if (!window.confirm('Delete this video?')) return;
    await axios.delete(api(`/tutor/courses/${courseId}/videos/${vidId}/`), { headers: auth() });
    onRefresh();
  };

  const deleteMaterial = async (matId) => {
    if (!window.confirm('Delete this file?')) return;
    await axios.delete(api(`/tutor/courses/${courseId}/materials/${matId}/`), { headers: auth() });
    onRefresh();
  };

  const videos    = section.videos    || [];
  const materials = section.materials || [];

  return (
    <Paper sx={{ borderRadius: '12px', border: `1px solid ${BORDER}`, overflow: 'hidden', mb: 1.5 }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" sx={{ px: 2, py: 1.25, bgcolor: BRAND_SOFT }}>
        <BookOpen size={15} color={BRAND} style={{ marginRight: 8, flexShrink: 0 }} />
        <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', flexGrow: 1, color: BRAND }}>{section.title}</Typography>
        <Typography variant="caption" sx={{ color: '#9E9892', mr: 1 }}>
          {videos.length} video{videos.length !== 1 ? 's' : ''} · {materials.length} file{materials.length !== 1 ? 's' : ''}
        </Typography>
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Add video">
            <IconButton size="small" onClick={() => setVidDialog(true)} sx={{ color: BRAND, p: 0.5 }}>
              <Plus size={14} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Add file">
            <IconButton size="small" onClick={() => setMatDialog(true)} sx={{ color: BRAND, p: 0.5 }}>
              <FileText size={14} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete section">
            <IconButton size="small" onClick={() => onDeleteSection(section.id)} sx={{ color: '#d32f2f', p: 0.5 }}>
              <Trash2 size={13} />
            </IconButton>
          </Tooltip>
          <IconButton size="small" onClick={() => setExpanded(!expanded)} sx={{ p: 0.5 }}>
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </IconButton>
        </Stack>
      </Stack>

      {/* Content */}
      <Collapse in={expanded}>
        <Box sx={{ px: 2, py: 1.5 }}>
          {videos.length === 0 && materials.length === 0 && (
            <Typography variant="caption" sx={{ color: '#B5B0AB' }}>
              No content yet — add videos or files using the buttons above.
            </Typography>
          )}
          <Stack spacing={0.75}>
            {videos.map((v, i) => (
              <Stack key={v.id} direction="row" alignItems="center" spacing={1.25}
                sx={{ px: 1.5, py: 1, borderRadius: '8px', bgcolor: 'rgba(0,0,0,0.02)', border: `1px solid ${BORDER}` }}>
                <Play size={14} color={BRAND} />
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.82rem', flexGrow: 1 }}>
                  {v.title || `Video ${i + 1}`}
                </Typography>
                {v.has_quiz && <Chip label="Quiz" size="small" sx={{ height: 17, fontSize: '0.62rem', fontWeight: 700, bgcolor: 'rgba(46,125,50,0.1)', color: GREEN }} />}
                <Chip label="VIDEO" size="small" sx={{ height: 17, fontSize: '0.62rem', fontWeight: 700, bgcolor: BRAND_SOFT, color: BRAND }} />
                <IconButton size="small" onClick={() => deleteVideo(v.id)} sx={{ color: BRAND, p: 0.5 }}>
                  <Trash2 size={13} />
                </IconButton>
              </Stack>
            ))}
            {materials.map((m) => {
              const ch = fileChip(m.material_type);
              return (
                <Stack key={m.id} direction="row" alignItems="center" spacing={1.25}
                  sx={{ px: 1.5, py: 1, borderRadius: '8px', bgcolor: 'rgba(0,0,0,0.02)', border: `1px solid ${BORDER}` }}>
                  {fileIcon(m.material_type)}
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.82rem', flexGrow: 1 }}>{m.title}</Typography>
                  <Chip label={ch.label} size="small" sx={{ height: 17, fontSize: '0.62rem', fontWeight: 700, bgcolor: ch.bg, color: ch.color }} />
                  <IconButton size="small" onClick={() => deleteMaterial(m.id)} sx={{ color: BRAND, p: 0.5 }}>
                    <Trash2 size={13} />
                  </IconButton>
                </Stack>
              );
            })}
          </Stack>
        </Box>
      </Collapse>

      {/* Add Video Dialog */}
      <Dialog open={vidDialog} onClose={() => { setVidDialog(false); setVidFile(null); setVidTitle(''); }}
        maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Add Video — {section.title}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 0.5 }}>
            <TextField fullWidth size="small" label="Video Title" value={vidTitle}
              onChange={(e) => setVidTitle(e.target.value)} placeholder="e.g. Introduction" />
            <UploadZone id={`vid-${section.id}`} accept="video/*" icon={Video}
              label="Click to select video" fileName={vidFile?.name}
              onChange={(f) => setVidFile(f)} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setVidDialog(false)} sx={{ color: '#6B6560' }}>Cancel</Button>
          <Button variant="contained" onClick={uploadVideo} disabled={!vidFile || uploading}
            startIcon={uploading ? <CircularProgress size={14} color="inherit" /> : <Upload size={14} />}
            sx={{ borderRadius: '8px', fontWeight: 600, bgcolor: BRAND, '&:hover': { bgcolor: '#7a2627' } }}>
            {uploading ? 'Uploading…' : 'Add Video'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add File Dialog */}
      <Dialog open={matDialog} onClose={() => { setMatDialog(false); setMatFile(null); setMatTitle(''); }}
        maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Add File — {section.title}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 0.5 }}>
            <TextField fullWidth size="small" label="File Title" value={matTitle}
              onChange={(e) => setMatTitle(e.target.value)} placeholder="e.g. Lecture Notes" />
            <UploadZone id={`mat-${section.id}`}
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              icon={FileText} label="Click to select PDF or Word file" fileName={matFile?.name}
              color="#1565c0" onChange={(f) => setMatFile(f)} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setMatDialog(false)} sx={{ color: '#6B6560' }}>Cancel</Button>
          <Button variant="contained" onClick={uploadMaterial} disabled={!matFile || uploading}
            startIcon={uploading ? <CircularProgress size={14} color="inherit" /> : <Upload size={14} />}
            sx={{ borderRadius: '8px', fontWeight: 600, bgcolor: BRAND, '&:hover': { bgcolor: '#7a2627' } }}>
            {uploading ? 'Uploading…' : 'Add File'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

// ════════════════════════════════════════════════════════════════════
//  VideoUpload — main component
// ════════════════════════════════════════════════════════════════════
const VideoUpload = () => {
  const [step,        setStep]        = useState(1);   // 1=Info, 2=Content, 3=Done
  const [courses,     setCourses]     = useState([]);
  const [draftCourse, setDraftCourse] = useState(null); // course just created in step 1
  const [error,       setError]       = useState('');
  const [success,     setSuccess]     = useState('');
  const [loading,     setLoading]     = useState(false);

  // Step 1 fields
  const [title,       setTitle]       = useState('');
  const [description, setDescription] = useState('');
  const [videoFile,   setVideoFile]   = useState(null);
  const [isPaid,      setIsPaid]      = useState(false);
  const [price,       setPrice]       = useState('');
  const [difficulty,  setDifficulty]  = useState('beginner');

  // Step 2 — new section
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [addingSection,   setAddingSection]   = useState(false);

  // AI summary state
  const [aiSummary,   setAiSummary]   = useState('');
  const [aiLoading,   setAiLoading]   = useState(false);
  const [aiForCourse, setAiForCourse] = useState(null);

  // Existing courses expanded
  const [expandedId, setExpandedId]   = useState(null);

  // Extra video / material dialogs for existing courses (legacy flat)
  const [vidDialog, setVidDialog] = useState(false);
  const [selCourse, setSelCourse] = useState(null);
  const [extraVidFile, setExtraVidFile] = useState(null);
  const [extraVidTitle, setExtraVidTitle] = useState('');
  const [vidUploading, setVidUploading] = useState(false);
  const [matDialog, setMatDialog] = useState(false);
  const [matCourse, setMatCourse] = useState(null);
  const [matFile, setMatFile] = useState(null);
  const [matTitle, setMatTitle] = useState('');
  const [matUploading, setMatUploading] = useState(false);

  useEffect(() => { fetchCourses(); }, []);

  const fetchCourses = async () => {
    try {
      const res = await axios.get(api('/tutor/courses/list/'), { headers: auth() });
      setCourses(res.data || []);
    } catch {}
  };

  const refreshDraft = async () => {
    if (!draftCourse?.id) return;
    try {
      const res = await axios.get(api('/tutor/courses/list/'), { headers: auth() });
      const updated = (res.data || []).find(c => c.id === draftCourse.id);
      if (updated) setDraftCourse(updated);
      setCourses(res.data || []);
    } catch {}
  };

  // ── Step 1: publish course ────────────────────────────────────
  const handlePublish = async () => {
    setError('');
    if (!title.trim())  { setError('Course title is required.'); return; }
    if (!videoFile)     { setError('Please upload the main course video.'); return; }
    if (isPaid && (!price || isNaN(price) || Number(price) <= 0)) {
      setError('Please enter a valid price.'); return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('title',       title.trim());
      fd.append('description', description.trim());
      fd.append('video_file',  videoFile);
      fd.append('is_paid',     isPaid);
      fd.append('price',       isPaid ? price : '0');
      fd.append('difficulty',  difficulty);
      const res = await axios.post(api('/tutor/courses/'), fd,
        { headers: { ...auth(), 'Content-Type': 'multipart/form-data' } });
      setDraftCourse(res.data);
      setStep(2);
      setSuccess('Course published! Now add sections and content.');
    } catch (e) { setError(e.response?.data?.error || 'Upload failed.'); }
    finally { setLoading(false); }
  };

  // ── Step 2: add section ───────────────────────────────────────
  const handleAddSection = async () => {
    if (!newSectionTitle.trim() || !draftCourse?.id) return;
    setAddingSection(true);
    try {
      await axios.post(api(`/tutor/courses/${draftCourse.id}/sections/`),
        { title: newSectionTitle.trim() }, { headers: auth() });
      setNewSectionTitle('');
      await refreshDraft();
    } catch (e) { setError(e.response?.data?.error || 'Failed to add section.'); }
    finally { setAddingSection(false); }
  };

  const handleDeleteSection = async (sectionId) => {
    if (!window.confirm('Delete this section and all its content?')) return;
    await axios.delete(api(`/tutor/courses/${draftCourse.id}/sections/${sectionId}/`), { headers: auth() });
    await refreshDraft();
  };

  // ── Existing courses: delete ──────────────────────────────────
  const handleDeleteCourse = async (id) => {
    if (!window.confirm('Delete this course?')) return;
    await axios.delete(api(`/tutor/courses/${id}/`), { headers: auth() });
    fetchCourses();
  };

  // ── Existing courses: extra video ─────────────────────────────
  const handleAddVideo = async () => {
    if (!extraVidFile || !selCourse) return;
    setVidUploading(true);
    try {
      const fd = new FormData();
      fd.append('video_file', extraVidFile);
      fd.append('title',      extraVidTitle || extraVidFile.name);
      await axios.post(api(`/tutor/courses/${selCourse.id}/videos/`), fd,
        { headers: { ...auth(), 'Content-Type': 'multipart/form-data' } });
      setVidDialog(false); setExtraVidFile(null); setExtraVidTitle('');
      fetchCourses(); setSuccess('Video added!');
    } catch (e) { setError(e.response?.data?.error || 'Failed.'); }
    finally { setVidUploading(false); }
  };

  const handleDeleteVideo = async (courseId, vidId) => {
    if (!window.confirm('Delete?')) return;
    await axios.delete(api(`/tutor/courses/${courseId}/videos/${vidId}/`), { headers: auth() });
    fetchCourses();
  };

  // ── Existing courses: material ────────────────────────────────
  const handleAddMaterial = async () => {
    if (!matFile || !matCourse) return;
    setMatUploading(true);
    try {
      const fd = new FormData();
      fd.append('file',  matFile);
      fd.append('title', matTitle || matFile.name);
      await axios.post(api(`/tutor/courses/${matCourse.id}/materials/`), fd,
        { headers: { ...auth(), 'Content-Type': 'multipart/form-data' } });
      setMatDialog(false); setMatFile(null); setMatTitle('');
      fetchCourses(); setSuccess('File added!');
    } catch (e) { setError(e.response?.data?.error || 'Failed.'); }
    finally { setMatUploading(false); }
  };

  const handleDeleteMaterial = async (courseId, matId) => {
    if (!window.confirm('Delete?')) return;
    await axios.delete(api(`/tutor/courses/${courseId}/materials/${matId}/`), { headers: auth() });
    fetchCourses();
  };

  // ── AI summary ────────────────────────────────────────────────
  const handleAISummary = async (course) => {
    setAiForCourse(course.id); setAiSummary(''); setAiLoading(true);
    const s = await getAISummary(course.title, course.description);
    setAiSummary(s || 'Could not generate summary.'); setAiLoading(false);
  };

  // ════════════════════════════════════════════════════════════════
  //  RENDER
  // ════════════════════════════════════════════════════════════════
  return (
    <Box>
      {error   && <Alert severity="error"   sx={{ mb: 2, borderRadius: '10px' }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2, borderRadius: '10px' }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>

        {/* ════ LEFT: Create / Edit panel ════ */}
        <Box sx={{ flex: '1 1 380px', minWidth: 320 }}>
          <Paper sx={{ p: 3, borderRadius: '16px', border: `1px solid ${BORDER}` }}>

            {step < 3 && <StepBar step={step} />}

            {/* ── STEP 1: Course Info ── */}
            {step === 1 && (
              <Stack spacing={2.5}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, letterSpacing: '-0.01em' }}>
                  Course Information
                </Typography>

                <TextField fullWidth size="small" label="Course Title *" value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  error={!!error && !title.trim()}
                  helperText={!!error && !title.trim() ? 'Title is required' : ''} />

                <TextField fullWidth size="small" label="Description" value={description}
                  onChange={(e) => setDescription(e.target.value)} multiline rows={3} />

                {/* Difficulty */}
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#6B6560', mb: 0.75, display: 'block', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Difficulty
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    {DIFFICULTY.map((d) => (
                      <Box key={d.value} onClick={() => setDifficulty(d.value)}
                        sx={{ flex: 1, py: 0.75, textAlign: 'center', borderRadius: '8px', cursor: 'pointer',
                          border: `1.5px solid ${difficulty === d.value ? d.color : BORDER}`,
                          bgcolor: difficulty === d.value ? d.bg : 'transparent', transition: '0.15s' }}>
                        <Typography sx={{ fontSize: '0.78rem', fontWeight: difficulty === d.value ? 700 : 500,
                          color: difficulty === d.value ? d.color : '#9E9892' }}>{d.label}</Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>

                {/* Paid */}
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Paid Course</Typography>
                  <Switch checked={isPaid} onChange={(e) => setIsPaid(e.target.checked)} size="small" />
                </Stack>
                {isPaid && (
                  <TextField fullWidth size="small" label="Price (SAR)" type="number"
                    value={price} onChange={(e) => setPrice(e.target.value)} inputProps={{ min: 1 }} />
                )}

                {/* Main video */}
                <UploadZone id="main-video" accept="video/*" icon={Video}
                  label="Click to select main course video *"
                  fileName={videoFile?.name} onChange={(f) => setVideoFile(f)} />

                <Button variant="contained" fullWidth onClick={handlePublish} disabled={loading}
                  endIcon={loading ? <CircularProgress size={16} color="inherit" /> : <ArrowRight size={16} />}
                  sx={{ py: 1.25, borderRadius: '10px', fontWeight: 700, bgcolor: BRAND, '&:hover': { bgcolor: '#7a2627' } }}>
                  {loading ? 'Publishing…' : 'Publish & Continue →'}
                </Button>
              </Stack>
            )}

            {/* ── STEP 2: Sections & Content ── */}
            {step === 2 && draftCourse && (
              <Box>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: '-0.01em' }}>
                      Add Sections
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#9E9892' }}>
                      Organise your course into chapters
                    </Typography>
                  </Box>
                  <Chip label={draftCourse.title} size="small" sx={{ bgcolor: BRAND_SOFT, color: BRAND, fontWeight: 700 }} />
                </Stack>

                {/* Add section input */}
                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                  <TextField
                    fullWidth size="small" placeholder="Section title e.g. Introduction"
                    value={newSectionTitle}
                    onChange={(e) => setNewSectionTitle(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddSection(); }}
                    sx={{ '& .MuiOutlinedInput-root.Mui-focused fieldset': { borderColor: BRAND } }}
                  />
                  <Button variant="contained" onClick={handleAddSection}
                    disabled={!newSectionTitle.trim() || addingSection}
                    startIcon={addingSection ? <CircularProgress size={14} color="inherit" /> : <Plus size={14} />}
                    sx={{ whiteSpace: 'nowrap', borderRadius: '8px', fontWeight: 600, bgcolor: BRAND, '&:hover': { bgcolor: '#7a2627' } }}>
                    Add
                  </Button>
                </Stack>

                {/* Section list */}
                {(draftCourse.sections || []).length === 0 && (
                  <Paper sx={{ p: 2.5, borderRadius: '10px', textAlign: 'center', bgcolor: '#fafaf9', border: `1px dashed ${BORDER}`, mb: 2 }}>
                    <Layers size={28} color="#B5B0AB" style={{ marginBottom: 6 }} />
                    <Typography variant="body2" sx={{ color: '#B5B0AB' }}>
                      No sections yet. Add a section above, then add videos and files to it.
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#9E9892' }}>
                      (You can also skip sections and add content directly to the course)
                    </Typography>
                  </Paper>
                )}

                {(draftCourse.sections || []).map((sec) => (
                  <SectionCard key={sec.id} section={sec} courseId={draftCourse.id}
                    onRefresh={refreshDraft} onDeleteSection={handleDeleteSection} />
                ))}

                <Stack direction="row" spacing={1.5} sx={{ mt: 2.5 }}>
                  <Button variant="outlined" onClick={() => setStep(1)}
                    startIcon={<ArrowLeft size={15} />}
                    sx={{ borderColor: BORDER, color: '#6B6560', borderRadius: '8px', fontWeight: 600 }}>
                    Back
                  </Button>
                  <Button variant="contained" fullWidth onClick={() => { setStep(3); fetchCourses(); setSuccess('Course created successfully! 🎉'); }}
                    endIcon={<CheckCircle2 size={15} />}
                    sx={{ borderRadius: '8px', fontWeight: 700, bgcolor: GREEN, '&:hover': { bgcolor: '#1b5e20' } }}>
                    Done — Publish Course
                  </Button>
                </Stack>
              </Box>
            )}

            {/* ── STEP 3: Done ── */}
            {step === 3 && (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <CheckCircle2 size={48} color={GREEN} style={{ marginBottom: 12 }} />
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>Course Published!</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                  Your course is now live and visible to learners.
                </Typography>
                <Button variant="contained" onClick={() => { setStep(1); setTitle(''); setDescription(''); setVideoFile(null); setIsPaid(false); setPrice(''); setDifficulty('beginner'); setDraftCourse(null); setError(''); setSuccess(''); }}
                  sx={{ borderRadius: '10px', fontWeight: 700, bgcolor: BRAND, '&:hover': { bgcolor: '#7a2627' } }}>
                  Create Another Course
                </Button>
              </Box>
            )}
          </Paper>
        </Box>

        {/* ════ RIGHT: My Courses ════ */}
        <Box sx={{ flex: '1 1 420px', minWidth: 320 }}>
          <Paper sx={{ p: 3, borderRadius: '16px', border: `1px solid ${BORDER}` }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2.5, letterSpacing: '-0.01em' }}>
              My Courses{' '}
              <Typography component="span" sx={{ color: '#9E9892', fontWeight: 400, fontSize: '0.9rem' }}>
                ({courses.length})
              </Typography>
            </Typography>

            {courses.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 5, color: '#B5B0AB' }}>
                <Video size={36} style={{ marginBottom: 10, opacity: 0.4 }} />
                <Typography variant="body2">No courses yet.</Typography>
              </Box>
            ) : (
              <Stack spacing={2}>
                {courses.map((course) => {
                  const expanded = expandedId === course.id;
                  const sections = course.sections || [];
                  return (
                    <Paper key={course.id} sx={{ borderRadius: '12px', border: `1px solid ${BORDER}`, overflow: 'hidden' }}>
                      {/* Course header row */}
                      <Box sx={{ p: 2, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <Box sx={{ flexGrow: 1, mr: 1, cursor: 'pointer' }} onClick={() => setExpandedId(expanded ? null : course.id)}>
                          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" gap={0.5} sx={{ mb: 0.25 }}>
                            <Typography sx={{ fontWeight: 700, fontSize: '0.92rem' }}>{course.title}</Typography>
                            {course.difficulty && (
                              <Chip label={course.difficulty} size="small"
                                sx={{ height: 18, fontSize: '0.62rem', fontWeight: 600,
                                  bgcolor: course.difficulty === 'beginner' ? 'rgba(46,125,50,0.08)' : course.difficulty === 'intermediate' ? 'rgba(199,120,0,0.08)' : BRAND_SOFT,
                                  color:   course.difficulty === 'beginner' ? '#2e7d32' : course.difficulty === 'intermediate' ? '#c77800' : BRAND }} />
                            )}
                            <Chip label={course.display_price || (course.is_paid ? `SAR ${course.price}` : 'Free')} size="small"
                              sx={{ height: 18, fontSize: '0.62rem', fontWeight: 600,
                                bgcolor: course.is_paid ? 'rgba(199,120,0,0.08)' : 'rgba(46,125,50,0.08)',
                                color:   course.is_paid ? '#c77800' : '#2e7d32' }} />
                          </Stack>
                          <Typography variant="caption" sx={{ color: '#9E9892' }}>
                            {sections.length > 0
                              ? `${sections.length} section${sections.length !== 1 ? 's' : ''} · ${course.video_count || 1} video${(course.video_count || 1) !== 1 ? 's' : ''} · ${course.materials?.length || 0} file${(course.materials?.length || 0) !== 1 ? 's' : ''}`
                              : `${1 + (course.extra_videos?.length || 0)} video${(1 + (course.extra_videos?.length || 0)) !== 1 ? 's' : ''} · ${course.materials?.length || 0} file${(course.materials?.length || 0) !== 1 ? 's' : ''}`
                            }
                          </Typography>
                        </Box>
                        <Stack direction="row" spacing={0.5} alignItems="center" flexShrink={0}>
                          <Button size="small" startIcon={<Sparkles size={13} />} onClick={() => handleAISummary(course)}
                            sx={{ fontSize: '0.72rem', color: '#4285F4', fontWeight: 600, px: 1, minWidth: 0, py: 0.5 }}>AI</Button>
                          <Button size="small" startIcon={<Plus size={13} />} onClick={() => { setSelCourse(course); setVidDialog(true); }}
                            sx={{ fontSize: '0.72rem', color: BRAND, fontWeight: 600, px: 1, minWidth: 0, py: 0.5 }}>+ Vid</Button>
                          <Button size="small" startIcon={<Plus size={13} />} onClick={() => { setMatCourse(course); setMatDialog(true); }}
                            sx={{ fontSize: '0.72rem', color: BRAND, fontWeight: 600, px: 1, minWidth: 0, py: 0.5 }}>+ File</Button>
                          <IconButton size="small" onClick={() => handleDeleteCourse(course.id)} sx={{ color: BRAND, p: 0.5 }}>
                            <Trash2 size={15} />
                          </IconButton>
                          <IconButton size="small" onClick={() => setExpandedId(expanded ? null : course.id)} sx={{ p: 0.5 }}>
                            {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                          </IconButton>
                        </Stack>
                      </Box>

                      {/* Expanded — sections + flat content */}
                      {expanded && (
                        <Box sx={{ px: 2, pb: 2, borderTop: `1px solid ${BORDER}`, pt: 1.5 }}>
                          {/* Sections */}
                          {sections.map((sec) => (
                            <SectionCard key={sec.id} section={sec} courseId={course.id}
                              onRefresh={fetchCourses} onDeleteSection={async (sid) => {
                                if (!window.confirm('Delete section?')) return;
                                await axios.delete(api(`/tutor/courses/${course.id}/sections/${sid}/`), { headers: auth() });
                                fetchCourses();
                              }} />
                          ))}

                          {/* Flat extra videos */}
                          {(course.extra_videos || []).filter(v => !v.section).length > 0 && (
                            <Box sx={{ mb: 1 }}>
                              <Typography variant="overline" sx={{ color: '#9E9892', fontSize: '0.66rem', mb: 0.75, display: 'block' }}>
                                Additional Videos
                              </Typography>
                              <Stack spacing={0.75}>
                                {course.extra_videos.filter(v => !v.section).map((v, i) => (
                                  <Stack key={v.id} direction="row" alignItems="center" spacing={1.25}
                                    sx={{ px: 1.5, py: 1, borderRadius: '8px', bgcolor: 'rgba(0,0,0,0.02)', border: `1px solid ${BORDER}` }}>
                                    <Play size={14} color={BRAND} />
                                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.82rem', flexGrow: 1 }}>
                                      {v.title || `Video ${i + 2}`}
                                    </Typography>
                                    {v.has_quiz && <Chip label="Quiz" size="small" sx={{ height: 17, fontSize: '0.62rem', fontWeight: 700, bgcolor: 'rgba(46,125,50,0.1)', color: GREEN }} />}
                                    <Chip label="VIDEO" size="small" sx={{ height: 17, fontSize: '0.62rem', fontWeight: 700, bgcolor: BRAND_SOFT, color: BRAND }} />
                                    <IconButton size="small" onClick={() => handleDeleteVideo(course.id, v.id)} sx={{ color: BRAND, p: 0.5 }}>
                                      <Trash2 size={13} />
                                    </IconButton>
                                  </Stack>
                                ))}
                              </Stack>
                            </Box>
                          )}

                          {/* Flat materials */}
                          {(course.materials || []).filter(m => !m.section).length > 0 && (
                            <Box>
                              <Typography variant="overline" sx={{ color: '#9E9892', fontSize: '0.66rem', mb: 0.75, display: 'block' }}>
                                Course Materials
                              </Typography>
                              <Stack spacing={0.75}>
                                {course.materials.filter(m => !m.section).map((m) => {
                                  const ch = fileChip(m.material_type);
                                  return (
                                    <Stack key={m.id} direction="row" alignItems="center" spacing={1.25}
                                      sx={{ px: 1.5, py: 1, borderRadius: '8px', bgcolor: 'rgba(0,0,0,0.02)', border: `1px solid ${BORDER}` }}>
                                      {fileIcon(m.material_type)}
                                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.82rem', flexGrow: 1 }}>{m.title}</Typography>
                                      <Chip label={ch.label} size="small" sx={{ height: 17, fontSize: '0.62rem', fontWeight: 700, bgcolor: ch.bg, color: ch.color }} />
                                      <IconButton size="small" onClick={() => handleDeleteMaterial(course.id, m.id)} sx={{ color: BRAND, p: 0.5 }}>
                                        <Trash2 size={13} />
                                      </IconButton>
                                    </Stack>
                                  );
                                })}
                              </Stack>
                            </Box>
                          )}

                          {!sections.length && !course.extra_videos?.length && !course.materials?.length && (
                            <Typography variant="caption" sx={{ color: '#B5B0AB' }}>No extra content yet.</Typography>
                          )}
                        </Box>
                      )}

                      {/* AI Summary */}
                      {aiForCourse === course.id && (
                        <Box sx={{ px: 2, pb: 2, borderTop: `1px solid ${BORDER}` }}>
                          <Stack direction="row" alignItems="center" spacing={0.75} sx={{ pt: 1.5, mb: 1 }}>
                            <Sparkles size={13} color="#4285F4" />
                            <Typography variant="caption" sx={{ fontWeight: 700, color: '#4285F4' }}>AI Summary</Typography>
                            <Button size="small" onClick={() => setAiForCourse(null)}
                              sx={{ ml: 'auto', fontSize: '0.65rem', color: '#9E9892', minWidth: 0, p: 0.25 }}>hide</Button>
                          </Stack>
                          {aiLoading
                            ? <Stack direction="row" alignItems="center" spacing={1}><LinearProgress sx={{ flex: 1, height: 3, borderRadius: 3 }} /><Typography variant="caption" sx={{ color: '#9E9892' }}>Generating…</Typography></Stack>
                            : <Typography variant="caption" sx={{ lineHeight: 1.85, whiteSpace: 'pre-wrap', display: 'block', color: '#44403C' }}>{aiSummary}</Typography>
                          }
                        </Box>
                      )}
                    </Paper>
                  );
                })}
              </Stack>
            )}
          </Paper>
        </Box>
      </Box>

      {/* ── Add Video Dialog (existing courses flat) ── */}
      <Dialog open={vidDialog} onClose={() => { setVidDialog(false); setExtraVidFile(null); setExtraVidTitle(''); }}
        maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Add Video — {selCourse?.title}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 0.5 }}>
            <TextField fullWidth size="small" label="Video Title" value={extraVidTitle}
              onChange={(e) => setExtraVidTitle(e.target.value)} placeholder="e.g. Lesson 2" />
            <UploadZone id="extra-vid" accept="video/*" icon={Video}
              label="Click to select video" fileName={extraVidFile?.name} onChange={(f) => setExtraVidFile(f)} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setVidDialog(false)} sx={{ color: '#6B6560' }}>Cancel</Button>
          <Button variant="contained" onClick={handleAddVideo} disabled={!extraVidFile || vidUploading}
            startIcon={vidUploading ? <CircularProgress size={14} color="inherit" /> : <Upload size={14} />}
            sx={{ borderRadius: '8px', fontWeight: 600, bgcolor: BRAND, '&:hover': { bgcolor: '#7a2627' } }}>
            {vidUploading ? 'Uploading…' : 'Add Video'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Add Material Dialog (existing courses flat) ── */}
      <Dialog open={matDialog} onClose={() => { setMatDialog(false); setMatFile(null); setMatTitle(''); }}
        maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Add File — {matCourse?.title}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 0.5 }}>
            <TextField fullWidth size="small" label="File Title" value={matTitle}
              onChange={(e) => setMatTitle(e.target.value)} placeholder="e.g. Lecture Notes" />
            <UploadZone id="mat-file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              icon={FileText} label="Click to select PDF or Word file"
              fileName={matFile?.name} color="#1565c0" onChange={(f) => setMatFile(f)} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setMatDialog(false)} sx={{ color: '#6B6560' }}>Cancel</Button>
          <Button variant="contained" onClick={handleAddMaterial} disabled={!matFile || matUploading}
            startIcon={matUploading ? <CircularProgress size={14} color="inherit" /> : <Upload size={14} />}
            sx={{ borderRadius: '8px', fontWeight: 600, bgcolor: BRAND, '&:hover': { bgcolor: '#7a2627' } }}>
            {matUploading ? 'Uploading…' : 'Add File'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VideoUpload;