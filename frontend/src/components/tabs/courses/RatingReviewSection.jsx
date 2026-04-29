// ─────────────────────────────────────────────────────────────────
//  RatingReviewSection.jsx
//  Star rating + aggregate bar chart + comments list + add review.
//  Props:
//    courseDetail    – full course object from API
//    currentUsername – logged-in user's username (from localStorage)
//    onRate          – async fn(stars: number)
//    onComment       – async fn(text: string)
//    submitting      – bool
// ─────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import {
  Box, Typography, Paper, Stack, Chip, Avatar,
  Button, TextField, IconButton, Divider,
  LinearProgress, Alert, Collapse,
} from '@mui/material';
import { Star, Lock, CheckCircle2, ChevronDown, ChevronUp, Send } from 'lucide-react';
import { MAROON, MAROON_DARK, MAROON_LIGHT, GOLD, GREEN, StarRow } from './coursesConstants';

// ── Label for each star value ──────────────────────────────────
const STAR_LABEL = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

// ────────────────────────────────────────────────────────────────
const RatingReviewSection = ({ courseDetail, currentUsername, onRate, onComment, submitting }) => {
  const [stars,       setStars]       = useState(0);
  const [hovered,     setHovered]     = useState(0);
  const [commentText, setComment]     = useState('');
  const [rateSuccess, setRateSuccess] = useState(false);
  const [showAll,     setShowAll]     = useState(false);

  const isEnrolled  = courseDetail?.enrolled;
  const alreadyRated = (courseDetail?.user_rating || 0) > 0;
  const comments    = courseDetail?.comments || [];
  const visible     = showAll ? comments : comments.slice(0, 3);

  // ── Submit rating ─────────────────────────────────────────────
  const submitRating = async () => {
    if (stars < 1) return;
    await onRate(stars);
    setRateSuccess(true);
    setTimeout(() => setRateSuccess(false), 3000);
  };

  // ── Post comment (also triggered by Enter key) ────────────────
  const submitComment = () => {
    if (!commentText.trim()) return;
    onComment(commentText);
    setComment('');
  };

  return (
    <Box>
      <Divider sx={{ my: 2 }} />

      {/* ── Aggregate rating with distribution bars ───────────── */}
      {courseDetail?.average_rating != null && (
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2.5 }}>
          {/* Big number */}
          <Box sx={{ textAlign: 'center', minWidth: 72 }}>
            <Typography sx={{ fontWeight: 900, fontSize: '2.4rem', lineHeight: 1, color: MAROON }}>
              {Number(courseDetail.average_rating).toFixed(1)}
            </Typography>
            <StarRow value={Math.round(courseDetail.average_rating)} readOnly size={16} />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {courseDetail.rating_count || 0} rating{courseDetail.rating_count !== 1 ? 's' : ''}
            </Typography>
          </Box>

          <Divider orientation="vertical" flexItem />

          {/* Bar chart 5→1 */}
          <Box sx={{ flex: 1 }}>
            {[5, 4, 3, 2, 1].map((s) => {
              const count = courseDetail?.rating_distribution?.[s] || 0;
              const total = courseDetail?.rating_count || 1;
              const pct   = Math.round((count / total) * 100);
              return (
                <Stack key={s} direction="row" alignItems="center" spacing={1} sx={{ mb: 0.4 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, width: 8 }}>{s}</Typography>
                  <Star size={11} color={GOLD} fill={GOLD} />
                  <LinearProgress
                    variant="determinate" value={pct}
                    sx={{
                      flex: 1, height: 6, borderRadius: 3,
                      bgcolor: 'rgba(0,0,0,0.08)',
                      '& .MuiLinearProgress-bar': { bgcolor: GOLD },
                    }}
                  />
                  <Typography variant="caption" sx={{ color: 'text.secondary', width: 24 }}>
                    {count}
                  </Typography>
                </Stack>
              );
            })}
          </Box>
        </Stack>
      )}

      {/* ── Rate this course ──────────────────────────────────── */}
      <Paper sx={{
        p: 2, borderRadius: 2.5, mb: 2.5,
        border: `1.5px solid ${MAROON_LIGHT}`,
        bgcolor: alreadyRated ? 'rgba(46,125,50,0.04)' : '#fafaf9',
      }}>
        <Typography sx={{ fontWeight: 800, mb: 1.25, fontSize: '0.95rem' }}>
          {alreadyRated ? '✅ Your Rating' : '⭐ Rate This Course'}
        </Typography>

        {/* Already rated */}
        {alreadyRated && (
          <Stack direction="row" alignItems="center" spacing={1}>
            <StarRow value={courseDetail.user_rating} readOnly size={24} />
            <Typography variant="body2" sx={{ color: GREEN, fontWeight: 700 }}>
              You rated this {courseDetail.user_rating}/5
            </Typography>
          </Stack>
        )}

        {/* Enrolled, not yet rated */}
        {!alreadyRated && isEnrolled && (
          <>
            <Stack
              direction="row" spacing={0.5} sx={{ mb: 1.5 }}
              onMouseLeave={() => setHovered(0)}
            >
              {[1, 2, 3, 4, 5].map((s) => (
                <IconButton
                  key={s} size="small"
                  onClick={() => setStars(s)}
                  onMouseEnter={() => setHovered(s)}
                  sx={{ p: 0.5 }}
                >
                  <Star
                    size={30}
                    color={(hovered || stars) >= s ? GOLD : '#d1ccc0'}
                    fill={(hovered || stars) >= s ? GOLD : 'transparent'}
                    style={{
                      transition: 'all 0.1s',
                      transform: (hovered || stars) >= s ? 'scale(1.15)' : 'scale(1)',
                    }}
                  />
                </IconButton>
              ))}
              {stars > 0 && (
                <Typography sx={{ ml: 1, fontWeight: 700, color: MAROON, alignSelf: 'center' }}>
                  {STAR_LABEL[stars]}
                </Typography>
              )}
            </Stack>

            <Collapse in={rateSuccess}>
              <Alert
                severity="success"
                icon={<CheckCircle2 size={18} />}
                sx={{ mb: 1.5, borderRadius: 2 }}
              >
                Rating submitted! Thank you.
              </Alert>
            </Collapse>

            <Button
              variant="contained" size="small"
              onClick={submitRating}
              disabled={submitting || stars < 1}
              sx={{
                bgcolor: MAROON, borderRadius: 2, fontWeight: 700,
                '&:hover': { bgcolor: MAROON_DARK },
              }}
            >
              Submit Rating
            </Button>
          </>
        )}

        {/* Not enrolled */}
        {!isEnrolled && (
          <Stack direction="row" alignItems="center" spacing={1}>
            <Lock size={16} color="#888" />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Enroll in this course to leave a rating
            </Typography>
          </Stack>
        )}
      </Paper>

      {/* ── Reviews list ─────────────────────────────────────── */}
      <Typography sx={{ fontWeight: 800, mb: 1.5, fontSize: '0.95rem' }}>
        💬 Reviews ({comments.length})
      </Typography>

      <Stack spacing={1.25} sx={{ mb: 2 }}>
        {visible.length === 0 && (
          <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 2 }}>
            No reviews yet. Be the first to share your experience!
          </Typography>
        )}

        {visible.map((c) => (
          <Paper
            key={c.id}
            sx={{
              p: 1.75, borderRadius: 2.5,
              border: '1px solid rgba(0,0,0,0.08)',
              bgcolor: c.username === currentUsername ? 'rgba(154,47,46,0.04)' : '#fafaf9',
            }}
          >
            <Stack direction="row" spacing={1.25} alignItems="flex-start">
              <Avatar sx={{ width: 32, height: 32, bgcolor: MAROON, fontSize: '0.78rem', fontWeight: 700 }}>
                {c.username?.[0]?.toUpperCase() || '?'}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.4 }}>
                  <Typography variant="caption" sx={{ fontWeight: 800 }}>
                    {c.username}
                    {c.username === currentUsername && (
                      <Chip
                        label="You" size="small"
                        sx={{ ml: 0.75, height: 16, fontSize: '0.6rem', bgcolor: MAROON_LIGHT, color: MAROON, fontWeight: 700 }}
                      />
                    )}
                  </Typography>
                  {c.stars > 0 && <StarRow value={c.stars} readOnly size={13} />}
                </Stack>
                <Typography variant="body2" sx={{ lineHeight: 1.6 }}>{c.text}</Typography>
              </Box>
            </Stack>
          </Paper>
        ))}

        {/* Show more / less toggle */}
        {comments.length > 3 && (
          <Button
            size="small" variant="text"
            onClick={() => setShowAll(!showAll)}
            endIcon={showAll ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            sx={{ color: MAROON, fontWeight: 700, alignSelf: 'center' }}
          >
            {showAll ? 'Show less' : `Show all ${comments.length} reviews`}
          </Button>
        )}
      </Stack>

      {/* ── Add a review ─────────────────────────────────────── */}
      {isEnrolled ? (
        <Paper sx={{ p: 1.5, borderRadius: 2.5, border: `1.5px solid ${MAROON_LIGHT}`, bgcolor: '#fafaf9' }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 1 }}>
            Share your experience
          </Typography>
          <Stack direction="row" spacing={1} alignItems="flex-end">
            <TextField
              fullWidth multiline maxRows={3} size="small"
              placeholder="Write your review…"
              value={commentText}
              onChange={(e) => setComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  submitComment();
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': { borderRadius: 2 },
                '& .MuiOutlinedInput-root.Mui-focused fieldset': { borderColor: MAROON },
              }}
            />
            <IconButton
              onClick={submitComment}
              disabled={submitting || !commentText.trim()}
              sx={{
                bgcolor: MAROON, color: '#fff', borderRadius: 2, width: 40, height: 40,
                '&:hover': { bgcolor: MAROON_DARK },
                '&:disabled': { bgcolor: 'rgba(0,0,0,0.12)' },
              }}
            >
              <Send size={18} />
            </IconButton>
          </Stack>
        </Paper>
      ) : (
        <Paper sx={{ p: 2, borderRadius: 2.5, border: '1px dashed rgba(0,0,0,0.15)', textAlign: 'center' }}>
          <Lock size={20} color="#aaa" style={{ marginBottom: 4 }} />
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Enroll to leave a review
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default RatingReviewSection;