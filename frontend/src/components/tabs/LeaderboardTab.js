import React from 'react';
import {
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Typography,
  Chip,
  Stack,
  Box, // Box is now correctly imported
} from '@mui/material';
import { Trophy, Medal } from 'lucide-react';

/**
 * SkillArena Leaderboard Component
 * Displays top users ranked by their earned XP.
 */
const LeaderboardTab = () => {
  // Mock data for the top players
  const topPlayers = [
    { id: 1, name: 'Asouma', xp: 2500, rank: 1, color: '#FACA07' },
    { id: 2, name: 'Ahmad_Dev', xp: 1800, rank: 2, color: '#C0C0C0' },
    { id: 3, name: 'Sara_JS', xp: 1200, rank: 3, color: '#CD7F32' },
  ];

  return (
    <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
      {/* Header section with brand colors */}
      <Box sx={{ p: 3, bgcolor: 'primary.main', color: 'white' }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Trophy color="#FACA07" size={32} />
          <Typography variant="h6" sx={{ fontWeight: 900 }}>
            Arena Champions
          </Typography>
        </Stack>
      </Box>

      {/* Rankings List */}
      <List sx={{ p: 0 }}>
        {topPlayers.map((player) => (
          <ListItem
            key={player.id}
            divider
            sx={{
              py: 2,
              bgcolor:
                player.rank === 1 ? 'rgba(250, 202, 7, 0.05)' : 'transparent',
            }}
          >
            <ListItemAvatar>
              <Box sx={{ position: 'relative' }}>
                <Avatar sx={{ bgcolor: 'grey.300', fontWeight: 800 }}>
                  {player.name[0]}
                </Avatar>
                {/* Visual rank indicator (Medal) */}
                <Box sx={{ position: 'absolute', top: -10, left: -10 }}>
                  <Medal size={20} color={player.color} fill={player.color} />
                </Box>
              </Box>
            </ListItemAvatar>

            <ListItemText
              primary={player.name}
              primaryTypographyProps={{ fontWeight: 700 }}
              secondary={`Rank #${player.rank}`}
            />

            <Chip
              label={`${player.xp} XP`}
              size="small"
              sx={{ fontWeight: 900, bgcolor: 'background.default' }}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default LeaderboardTab;
