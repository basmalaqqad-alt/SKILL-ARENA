import React from 'react';
import { Box, Typography, Paper, LinearProgress, Grid } from '@mui/material';

const TUTOR_COLORS = {
  cream: '#F8F4DF',
  maroon: '#9A2F2E',
  maroonLight: 'rgba(154, 47, 46, 0.08)',
};

const TutorProfile = () => {
  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: 3,
        border: `2px solid ${TUTOR_COLORS.maroonLight}`,
        bgcolor: 'rgba(255, 255, 255, 0.6)',
      }}
    >
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: TUTOR_COLORS.maroon }}>
            Experience (XP)
          </Typography>
          <Box sx={{ my: 2 }}>
            <LinearProgress
              variant="determinate"
              value={65}
              sx={{
                height: 12,
                borderRadius: 6,
                bgcolor: TUTOR_COLORS.maroonLight,
                '& .MuiLinearProgress-bar': { bgcolor: TUTOR_COLORS.maroon },
              }}
            />
            <Typography variant="body2" sx={{ mt: 1, fontWeight: 600, color: TUTOR_COLORS.maroon }}>
              650 / 1000 XP
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: TUTOR_COLORS.maroon }}>
            Personal Info
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
            Name: {localStorage.getItem('username') || 'Tutor'}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Email: tutor@example.com
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default TutorProfile;
