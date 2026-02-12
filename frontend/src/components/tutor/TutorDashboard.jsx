import React from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent } from '@mui/material';

const TutorDashboard = () => {
  return (
    <Box sx={{ p: 4 }}>
      <Typography
        variant="h4"
        sx={{ fontWeight: 900, mb: 4, color: 'primary.main' }}
      >
        TUTOR PANEL - SKILLARENA
      </Typography>

      <Grid container spacing={3}>
        {/* إحصائيات سريعة للمدرب */}
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: 'secondary.main', color: 'white' }}>
            <CardContent>
              <Typography variant="h6">My Students</Typography>
              <Typography variant="h3">24</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom>
              Manage My Courses
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Here you can add, edit, or remove your learning materials.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TutorDashboard;
