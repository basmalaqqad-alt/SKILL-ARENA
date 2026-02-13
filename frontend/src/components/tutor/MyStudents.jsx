import React from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Avatar } from '@mui/material';

const TUTOR_COLORS = {
  cream: '#F8F4DF',
  maroon: '#9A2F2E',
  maroonLight: 'rgba(154, 47, 46, 0.08)',
};

const studentsMock = [
  { id: 1, name: 'Ali Hassan', progress: 'Intermediate' },
  { id: 2, name: 'Sara Ahmed', progress: 'Beginner' },
  { id: 3, name: 'Omar Khalid', progress: 'Advanced' },
];

const MyStudents = () => {
  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: 3,
        border: `2px solid ${TUTOR_COLORS.maroonLight}`,
        bgcolor: 'rgba(255, 255, 255, 0.6)',
      }}
    >
      <List>
        {studentsMock.map((s) => (
          <ListItem
            key={s.id}
            divider
            sx={{
              py: 2,
              '&:last-child': { borderBottom: 'none' },
            }}
          >
            <Avatar
              sx={{
                mr: 2,
                bgcolor: TUTOR_COLORS.maroon,
                fontWeight: 700,
              }}
            >
              {s.name.charAt(0)}
            </Avatar>
            <ListItemText
              primary={s.name}
              primaryTypographyProps={{ fontWeight: 700, color: TUTOR_COLORS.maroon }}
              secondary={s.progress}
              secondaryTypographyProps={{ color: 'text.secondary' }}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default MyStudents;
