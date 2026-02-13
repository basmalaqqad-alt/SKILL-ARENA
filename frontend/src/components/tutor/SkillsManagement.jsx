import React from 'react';
import { Box, Typography, Paper, Button, Grid } from '@mui/material';

const TUTOR_COLORS = {
  cream: '#F8F4DF',
  maroon: '#9A2F2E',
  maroonLight: 'rgba(154, 47, 46, 0.08)',
};

const SkillsManagement = () => {
  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: 3,
        border: `2px solid ${TUTOR_COLORS.maroonLight}`,
        bgcolor: 'rgba(255, 255, 255, 0.6)',
      }}
    >
      <Typography variant="body1" sx={{ color: TUTOR_COLORS.maroon, mb: 2, fontWeight: 500 }}>
        Here you can add, edit, and categorize skills that your students can learn.
      </Typography>

      <Grid container spacing={2}>
        <Grid item>
          <Button
            variant="contained"
            sx={{
              bgcolor: TUTOR_COLORS.maroon,
              '&:hover': { bgcolor: '#7a2627' },
              fontWeight: 700,
            }}
          >
            Add New Skill
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="outlined"
            sx={{
              borderColor: TUTOR_COLORS.maroon,
              color: TUTOR_COLORS.maroon,
              fontWeight: 700,
              '&:hover': {
                borderColor: TUTOR_COLORS.maroon,
                bgcolor: TUTOR_COLORS.maroonLight,
              },
            }}
          >
            Import / Export
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default SkillsManagement;
