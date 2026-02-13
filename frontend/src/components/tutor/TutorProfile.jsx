import React from 'react';
import { Box, Typography, Paper, LinearProgress, Grid } from '@mui/material';

const TutorProfile = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 1, fontWeight: 800 }}>
        PROFILE
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
        Overview & Experience (XP)
      </Typography>

      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1">Experience (XP)</Typography>
            <Box sx={{ my: 2 }}>
              <LinearProgress variant="determinate" value={65} sx={{ height: 12, borderRadius: 6 }} />
              <Typography variant="body2" sx={{ mt: 1 }}>650 / 1000 XP</Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1">Personal Info</Typography>
            <Typography variant="body2" color="text.secondary">Name: Mohamed Tutor</Typography>
            <Typography variant="body2" color="text.secondary">Email: tutor@example.com</Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default TutorProfile;
