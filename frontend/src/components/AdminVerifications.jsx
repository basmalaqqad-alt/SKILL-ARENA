// ─────────────────────────────────────────────────────────────────
//  AdminVerifications.jsx
//  Admin panel — review, approve, or reject tutor credentials.
//  Add this as a route e.g. /admin/verifications
//  The logged-in user must be a Django superuser (is_staff=True).
// ─────────────────────────────────────────────────────────────────

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Typography, Paper, Stack, Chip, Button,
  TextField, Avatar, Tabs, Tab, Dialog,
  DialogTitle, DialogContent, DialogActions,
  Alert, LinearProgress, Divider,
} from '@mui/material';
import {
  ShieldCheck, ShieldX, Clock, FileText,
  Eye, GraduationCap, Building2, Calendar,
  BookOpen, User, CheckCircle2, XCircle,
} from 'lucide-react';

const MAROON       = '#9A2F2E';
const MAROON_DARK  = '#7a2627';
const MAROON_LIGHT = 'rgba(154,47,46,0.09)';
const GREEN        = '#2e7d32';
const ORANGE       = '#ed6c02';

const API = 'http://127.0.0.1:8000/api/accounts';

const CRED_LABEL = {
  bachelor:     "Bachelor's Degree",
  master:       "Master's Degree",
  phd:          'PhD / Doctorate',
  professional: 'Professional Certificate',
  other:        'Other',
};

// ── Status chip ─────────────────────────────────────────────────
const StatusChip = ({ status }) => {
  const map = {
    pending:  { label: 'Pending Review', color: ORANGE, bg: 'rgba(237,108,2,0.1)',  Icon: Clock       },
    approved: { label: 'Approved',       color: GREEN,  bg: 'rgba(46,125,50,0.1)', Icon: ShieldCheck  },
    rejected: { label: 'Rejected',       color: MAROON, bg: MAROON_LIGHT,           Icon: ShieldX      },
  };
  const s = map[status] || map.pending;
  return (
    <Stack direction="row" alignItems="center" spacing={0.5}
      sx={{ px: 1.25, py: 0.4, borderRadius: 99, bgcolor: s.bg, width: 'fit-content' }}>
      <s.Icon size={13} color={s.color} />
      <Typography sx={{ fontWeight: 700, fontSize: '0.75rem', color: s.color }}>{s.label}</Typography>
    </Stack>
  );
};

// ════════════════════════════════════════════════════════════════════
const AdminVerifications = () => {
  const [requests,   setRequests]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [tabValue,   setTabValue]   = useState('pending');

  // Review dialog
  const [selected,   setSelected]   = useState(null);
  const [note,       setNote]       = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback,   setFeedback]   = useState('');

  const token      = localStorage.getItem('token');
  const authHeader = { Authorization: 'Token ' + token };

  // ── Fetch ──────────────────────────────────────────────────────
  const fetchRequests = async (statusFilter = tabValue) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/admin/verifications/?status=${statusFilter}`, { headers: authHeader });
      setRequests(res.data || []);
    } catch { setRequests([]); }
    finally  { setLoading(false); }
  };

  useEffect(() => { fetchRequests(tabValue); }, [tabValue]); // eslint-disable-line

  // ── Approve ────────────────────────────────────────────────────
  const handleApprove = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      await axios.post(
        `${API}/admin/verifications/${selected.id}/approve/`,
        { note },
        { headers: authHeader }
      );
      setFeedback(`✅ ${selected.tutor_username} has been verified!`);
      setSelected(null);
      fetchRequests();
    } catch (e) {
      setFeedback(e.response?.data?.error || 'Approval failed.');
    }
    setSubmitting(false);
  };

  // ── Reject ─────────────────────────────────────────────────────
  const handleReject = async () => {
    if (!selected) return;
    if (!note.trim()) { setFeedback('Please enter a rejection reason for the tutor.'); return; }
    setSubmitting(true);
    try {
      await axios.post(
        `${API}/admin/verifications/${selected.id}/reject/`,
        { note },
        { headers: authHeader }
      );
      setFeedback(`❌ ${selected.tutor_username}'s request has been rejected.`);
      setSelected(null);
      fetchRequests();
    } catch (e) {
      setFeedback(e.response?.data?.error || 'Rejection failed.');
    }
    setSubmitting(false);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 900, mx: 'auto' }}>

      {/* ── Page header ── */}
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
        <Avatar sx={{ bgcolor: MAROON_LIGHT, width: 48, height: 48 }}>
          <ShieldCheck size={26} color={MAROON} />
        </Avatar>
        <Box>
          <Typography sx={{ fontWeight: 900, fontSize: '1.2rem' }}>
            Instructor Verification Requests
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Review submitted credentials and grant or deny the Verified badge
          </Typography>
        </Box>
      </Stack>

      {/* ── Feedback alert ── */}
      {feedback && (
        <Alert
          severity={feedback.startsWith('✅') ? 'success' : feedback.startsWith('❌') ? 'error' : 'warning'}
          onClose={() => setFeedback('')}
          sx={{ mb: 2, borderRadius: 2 }}
        >
          {feedback}
        </Alert>
      )}

      {/* ── Status tabs ── */}
      <Paper sx={{ mb: 3, borderRadius: 2.5, border: `1.5px solid ${MAROON_LIGHT}` }}>
        <Tabs
          value={tabValue}
          onChange={(_, v) => setTabValue(v)}
          sx={{
            '& .MuiTab-root':       { fontWeight: 700 },
            '& .Mui-selected':      { color: MAROON },
            '& .MuiTabs-indicator': { bgcolor: MAROON },
          }}
        >
          <Tab value="pending"  label="⏳ Pending Review" />
          <Tab value="approved" label="✅ Approved"       />
          <Tab value="rejected" label="❌ Rejected"       />
          <Tab value="all"      label="📋 All"            />
        </Tabs>
      </Paper>

      {/* ── List ── */}
      {loading && <LinearProgress sx={{ borderRadius: 2, mb: 2 }} />}

      {!loading && requests.length === 0 && (
        <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 3, bgcolor: '#fafaf9' }}>
          <Typography sx={{ color: 'text.secondary' }}>No {tabValue} requests found.</Typography>
        </Paper>
      )}

      <Stack spacing={2}>
        {requests.map((req) => (
          <Paper
            key={req.id}
            sx={{
              p: 2.5, borderRadius: 2.5,
              border: `1.5px solid ${req.status === 'pending' ? 'rgba(237,108,2,0.25)' : MAROON_LIGHT}`,
              bgcolor: req.status === 'approved' ? 'rgba(46,125,50,0.03)' : '#fafaf9',
            }}
          >
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={1.5}>

              {/* Left: tutor info */}
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Avatar sx={{ bgcolor: MAROON, fontWeight: 700 }}>
                  {req.tutor_username?.[0]?.toUpperCase()}
                </Avatar>
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography sx={{ fontWeight: 800 }}>{req.tutor_username}</Typography>
                    <StatusChip status={req.status} />
                  </Stack>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {req.tutor_email}
                  </Typography>
                </Box>
              </Stack>

              {/* Right: quick info + action */}
              <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap">
                <Chip
                  icon={<GraduationCap size={14} />}
                  label={CRED_LABEL[req.credential_type] || req.credential_type}
                  size="small"
                  sx={{ fontWeight: 700, bgcolor: MAROON_LIGHT, color: MAROON }}
                />
                <Chip
                  label={req.institution}
                  size="small"
                  variant="outlined"
                  sx={{ fontWeight: 600 }}
                />
                <Button
                  variant="contained" size="small"
                  startIcon={<Eye size={15} />}
                  onClick={() => { setSelected(req); setNote(''); setFeedback(''); }}
                  sx={{
                    bgcolor: req.status === 'pending' ? MAROON : '#555',
                    fontWeight: 700, borderRadius: 2,
                    '&:hover': { bgcolor: req.status === 'pending' ? MAROON_DARK : '#333' },
                  }}
                >
                  Review
                </Button>
              </Stack>
            </Stack>

            {/* Submitted date */}
            <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1, display: 'block' }}>
              Submitted: {new Date(req.submitted_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              {req.reviewed_at && ` · Reviewed: ${new Date(req.reviewed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`}
            </Typography>

            {/* Rejection note if any */}
            {req.status === 'rejected' && req.admin_note && (
              <Alert severity="error" sx={{ mt: 1.5, borderRadius: 2, py: 0.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>Rejection reason: </Typography>
                <Typography variant="caption">{req.admin_note}</Typography>
              </Alert>
            )}
          </Paper>
        ))}
      </Stack>

      {/* ════ Review dialog ════ */}
      <Dialog
        open={!!selected}
        onClose={() => setSelected(null)}
        maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        {selected && (
          <>
            <DialogTitle>
              <Stack direction="row" alignItems="center" spacing={1.25}>
                <Avatar sx={{ bgcolor: MAROON, fontWeight: 700 }}>
                  {selected.tutor_username?.[0]?.toUpperCase()}
                </Avatar>
                <Box>
                  <Typography sx={{ fontWeight: 900 }}>{selected.tutor_username}</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>{selected.tutor_email}</Typography>
                </Box>
                <Box sx={{ ml: 'auto' }}>
                  <StatusChip status={selected.status} />
                </Box>
              </Stack>
            </DialogTitle>

            <DialogContent dividers>
              {/* Credential details */}
              <Typography sx={{ fontWeight: 800, mb: 1.5, fontSize: '0.9rem' }}>
                Submitted Credential
              </Typography>
              <Stack spacing={1} sx={{ mb: 2.5 }}>
                {[
                  [GraduationCap, 'Type',            CRED_LABEL[selected.credential_type]],
                  [Building2,    'Institution',      selected.institution],
                  [Calendar,     'Graduation Year',  selected.graduation_year],
                  [BookOpen,     'Field of Study',   selected.field_of_study],
                ].map(([Icon, label, value]) => (
                  <Stack key={label} direction="row" alignItems="center" spacing={1.25}>
                    <Icon size={16} color={MAROON} style={{ flexShrink: 0 }} />
                    <Typography variant="body2" sx={{ color: 'text.secondary', width: 130 }}>{label}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{value}</Typography>
                  </Stack>
                ))}
              </Stack>

              <Divider sx={{ mb: 2 }} />

              {/* Document viewer */}
              <Typography sx={{ fontWeight: 800, mb: 1.5, fontSize: '0.9rem' }}>
                Uploaded Document
              </Typography>
              {selected.document_url ? (
                <Stack spacing={1.5}>
                  {/* Preview for images */}
                  {/\.(jpg|jpeg|png)$/i.test(selected.document_url) ? (
                    <Box
                      component="img"
                      src={selected.document_url}
                      alt="Credential document"
                      sx={{ width: '100%', maxHeight: 320, objectFit: 'contain', borderRadius: 2, border: `1px solid ${MAROON_LIGHT}` }}
                    />
                  ) : (
                    // PDF — show open link
                    <Paper sx={{ p: 2, borderRadius: 2, border: `1.5px solid ${MAROON_LIGHT}`, bgcolor: '#fafaf9', textAlign: 'center' }}>
                      <FileText size={36} color={MAROON} style={{ marginBottom: 8 }} />
                      <Typography sx={{ fontWeight: 700, mb: 1 }}>PDF Document</Typography>
                      <Button
                        variant="outlined" size="small"
                        href={selected.document_url} target="_blank" rel="noopener noreferrer"
                        startIcon={<Eye size={15} />}
                        sx={{ borderColor: MAROON, color: MAROON, fontWeight: 700, borderRadius: 2 }}
                      >
                        Open PDF in New Tab
                      </Button>
                    </Paper>
                  )}

                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', textAlign: 'center' }}>
                    ⚠️ Verify that this document is genuine before approving.
                    Check the institution name, student name, dates, and official stamps/seals.
                  </Typography>
                </Stack>
              ) : (
                <Alert severity="warning" sx={{ borderRadius: 2 }}>No document was uploaded.</Alert>
              )}

              <Divider sx={{ my: 2 }} />

              {/* Admin note */}
              <Typography sx={{ fontWeight: 800, mb: 1, fontSize: '0.9rem' }}>
                {selected.status === 'pending' ? 'Decision Note' : 'Admin Note'}
              </Typography>
              <TextField
                fullWidth multiline rows={3} size="small"
                placeholder={
                  selected.status === 'pending'
                    ? 'Optional for approval. Required if rejecting — explain what was wrong.'
                    : 'Previous note…'
                }
                value={note}
                onChange={(e) => setNote(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root.Mui-focused fieldset': { borderColor: MAROON },
                  '& label.Mui-focused': { color: MAROON },
                }}
              />
              {feedback && (
                <Alert
                  severity={feedback.startsWith('Please') ? 'warning' : 'error'}
                  sx={{ mt: 1.5, borderRadius: 2 }}
                >
                  {feedback}
                </Alert>
              )}
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
              <Button onClick={() => setSelected(null)} sx={{ color: 'text.secondary' }}>
                Close
              </Button>

              {selected.status !== 'approved' && (
                <Button
                  variant="outlined"
                  onClick={handleReject}
                  disabled={submitting}
                  startIcon={<XCircle size={16} />}
                  sx={{ borderColor: MAROON, color: MAROON, fontWeight: 700, borderRadius: 2 }}
                >
                  Reject
                </Button>
              )}

              {selected.status !== 'approved' && (
                <Button
                  variant="contained"
                  onClick={handleApprove}
                  disabled={submitting}
                  startIcon={<CheckCircle2 size={16} />}
                  sx={{ bgcolor: GREEN, fontWeight: 700, borderRadius: 2, '&:hover': { bgcolor: '#1b5e20' } }}
                >
                  {submitting ? 'Processing…' : 'Approve & Verify'}
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default AdminVerifications;