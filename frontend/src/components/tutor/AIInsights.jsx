import React from 'react';
import { Paper, List, ListItem, ListItemText } from '@mui/material';

const TUTOR_COLORS = {
  cream: '#F8F4DF',
  maroon: '#9A2F2E',
  maroonLight: 'rgba(154, 47, 46, 0.08)',
};

const insightsMock = [
  'Top performing skill: Web Development',
  'Average completion rate: 72%',
  'Students needing help: 5',
];

const AIInsights = () => {
  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: 3,
        border: `2px solid ${TUTOR_COLORS.maroonLight}`,
        bgcolor: 'rgba(255, 255, 255, 0.6)',
      }}
    >
      <List>
        {insightsMock.map((line, idx) => (
          <ListItem
            key={idx}
            divider
            sx={{
              py: 2,
              '&:last-child': { borderBottom: 'none' },
            }}
          >
            <ListItemText
              primary={line}
              primaryTypographyProps={{ fontWeight: 600, color: TUTOR_COLORS.maroon }}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default AIInsights;
