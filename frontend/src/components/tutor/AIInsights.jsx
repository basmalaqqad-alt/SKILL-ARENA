import React from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText } from '@mui/material';

const insightsMock = [
  'Top performing skill: Web Development',
  'Average completion rate: 72%',
  'Students needing help: 5',
];

const AIInsights = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 1, fontWeight: 800 }}>
        AI INSIGHTS
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
        Data-driven recommendations and analytics
      </Typography>

      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <List>
          {insightsMock.map((line, idx) => (
            <ListItem key={idx} divider>
              <ListItemText primary={line} />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default AIInsights;
