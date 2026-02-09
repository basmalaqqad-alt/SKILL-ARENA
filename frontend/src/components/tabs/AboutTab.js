import React from 'react';
import { Stack, Paper, Typography, Grid, Box } from '@mui/material';
import { Award } from 'lucide-react';

const AboutTab = () => {
  // Mock data for XP badges
  const badges = [5, 20, 50, 100];

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: 3, borderRadius: 3, bgcolor: '#8A2D2E', color: '#fff' }}>
        <Typography variant="h6" sx={{ color: '#FACA07', mb: 1.5 }}>
          The Arena Ecosystem 🏆
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Instructors with the Shield Icon have verified certificates. Anyone
          can teach, but Trusted Tutors gain more visibility and credibility!
        </Typography>

        <Grid container spacing={2}>
          {badges.map((xp) => (
            <Grid item xs={3} key={xp}>
              <Box
                sx={{
                  p: 1,
                  bgcolor: 'rgba(255,255,255,0.1)',
                  borderRadius: 2,
                  textAlign: 'center',
                }}
              >
                <Award size={20} color="#FACA07" />
                <Typography variant="caption" display="block">
                  {xp} XP
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Stack>
  );
};

export default AboutTab;
