import React from 'react';
import { Grid, Typography, Box } from '@mui/material';
import CourseCard from './CourseCard';

const CoursesTab = () => {
  // Mock data for courses
  const coursesList = [
    {
      id: 1,
      title: 'Introduction to React Hooks',
      duration: '2h 30m',
      lessons: 12,
      xpReward: 150,
      instructor: {
        name: 'Asouma',
        isTrusted: true,
        avatar: '', // Placeholder
      },
    },
    {
      id: 2,
      title: 'UI/UX Design Fundamentals',
      duration: '4h 15m',
      lessons: 20,
      xpReward: 300,
      instructor: {
        name: 'Ahmad',
        isTrusted: false,
        avatar: '', // Placeholder
      },
    },
  ];

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 900 }}>
        Available Quests ⚔️
      </Typography>
      <Grid container spacing={3}>
        {coursesList.map((course) => (
          <Grid item xs={12} sm={6} key={course.id}>
            <CourseCard course={course} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default CoursesTab;
