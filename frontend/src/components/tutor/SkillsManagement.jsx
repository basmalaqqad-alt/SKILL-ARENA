import React from 'react';
import { Box, Typography, Paper, Button, Grid } from '@mui/material';

const SkillsManagement = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 1, fontWeight: 800 }}>
        SKILLS MANAGEMENT
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
        Manage Your Skills & Students
      </Typography>

      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Here you can add, edit, and categorize skills that your students can learn.
        </Typography>

        <Grid container spacing={2}>
          <Grid item>
            <Button variant="contained">Add New Skill</Button>
          </Grid>
          <Grid item>
            <Button variant="outlined">Import / Export</Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default SkillsManagement;
