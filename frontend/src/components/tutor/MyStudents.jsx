import React from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Avatar } from '@mui/material';

const studentsMock = [
  { id: 1, name: 'Ali Hassan', progress: 'Intermediate' },
  { id: 2, name: 'Sara Ahmed', progress: 'Beginner' },
  { id: 3, name: 'Omar Khalid', progress: 'Advanced' },
];

const MyStudents = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 1, fontWeight: 800 }}>
        MY STUDENTS
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
        Track and manage your students' progress
      </Typography>

      <Paper sx={{ p: 1, borderRadius: 2 }}>
        <List>
          {studentsMock.map((s) => (
            <ListItem key={s.id} divider>
              <Avatar sx={{ mr: 2 }}>{s.name.charAt(0)}</Avatar>
              <ListItemText primary={s.name} secondary={s.progress} />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default MyStudents;
