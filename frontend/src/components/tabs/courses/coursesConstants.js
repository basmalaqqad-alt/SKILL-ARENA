// ─────────────────────────────────────────────────────────────────
//  coursesConstants.js
//  Shared colours, the Gemini helper, and the tiny StarRow widget.
//  Import from any file in the courses/ folder.
// ─────────────────────────────────────────────────────────────────

import React from 'react';
import { Stack, IconButton } from '@mui/material';
import { Star } from 'lucide-react';

// ── Brand colours ────────────────────────────────────────────────
export const MAROON       = '#9A2F2E';
export const MAROON_DARK  = '#7a2627';
export const MAROON_LIGHT = 'rgba(154,47,46,0.09)';
export const GOLD         = '#FACA07';
export const GREEN        = '#2e7d32';

// ── Gemini API key ───────────────────────────────────────────────
const GEMINI_API_KEY = 'AIzaSyBLrdcKH-XQmsMNzNIRNWezaM6FQgCBImw';

// ── Gemini: generate a short AI course summary ───────────────────
export const getCourseSummary = async (title, description) => {
  try {
    const prompt =
      'You are a helpful learning assistant on SkillArena.\n' +
      'A student is viewing this course:\n' +
      '- Title: "' + title + '"\n' +
      '- Description: "' + (description || 'No description provided') + '"\n\n' +
      'Write a SHORT engaging summary (3-4 sentences) that includes:\n' +
      '1. What the student will learn\n' +
      '2. Who this course is for\n' +
      '3. One motivating reason to enroll\n\n' +
      'Be friendly, use emojis. Reply in the same language as the title/description.';

    const res = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' +
        GEMINI_API_KEY,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 300 },
        }),
      }
    );
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch {
    return null;
  }
};

// ── StarRow ──────────────────────────────────────────────────────
//  A reusable row of 1-5 stars.
//  Props:
//    value     – current filled count (number)
//    onChange  – called with new value (omit / readOnly=true for display-only)
//    size      – icon size in px (default 26)
//    readOnly  – disables click & hover (default false)
export const StarRow = ({ value, onChange, size = 26, readOnly = false }) => (
  <Stack direction="row" spacing={0.25}>
    {[1, 2, 3, 4, 5].map((s) => (
      <IconButton
        key={s}
        size="small"
        onClick={() => !readOnly && onChange && onChange(s)}
        sx={{ p: 0.25, cursor: readOnly ? 'default' : 'pointer' }}
        disableRipple={readOnly}
      >
        <Star
          size={size}
          color={value >= s ? GOLD : '#d1ccc0'}
          fill={value >= s ? GOLD : 'transparent'}
          style={{ transition: 'all 0.15s' }}
        />
      </IconButton>
    ))}
  </Stack>
);