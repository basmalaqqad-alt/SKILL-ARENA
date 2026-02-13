import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
  Box,
  CircularProgress,
} from '@mui/material';
import { Trophy, Medal, User } from 'lucide-react';

const LeaderboardTab = () => {
  const [topPlayers, setTopPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }
    axios.get('http://127.0.0.1:8000/api/accounts/leaderboard/', {
      headers: { Authorization: `Token ${token}` }
    })
      .then(res => setTopPlayers(res.data || []))
      .catch(() => setTopPlayers([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Paper sx={{ borderRadius: 3, overflow: 'hidden', border: '2px solid rgba(154, 47, 46, 0.1)' }}>
      <Box sx={{ p: 3, bgcolor: 'primary.main', color: 'white' }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Trophy color="#FACA07" size={32} />
          <Typography variant="h6" sx={{ fontWeight: 900 }}>
            Arena Champions
          </Typography>
        </Stack>
      </Box>

      {loading ? (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress sx={{ color: '#9A2F2E' }} />
        </Box>
      ) : (
        <List sx={{ p: 0 }}>
          {topPlayers.length === 0 ? (
            <ListItem>
              <Typography variant="body2" color="text.secondary">No rankings yet.</Typography>
            </ListItem>
          ) : (
            topPlayers.map((player) => (
              <ListItem
                key={player.id}
                divider
                sx={{
                  py: 2,
                  bgcolor: player.rank === 1 ? 'rgba(250, 202, 7, 0.05)' : 'transparent',
                }}
              >
                <ListItemAvatar>
                  <Box sx={{ position: 'relative' }}>
                    <Avatar
                      src={player.avatar_url || undefined}
                      sx={{ bgcolor: 'grey.300', fontWeight: 800 }}
                    >
                      {!player.avatar_url && (player.username?.[0] || <User size={24} />)}
                    </Avatar>
                    {player.color && (
                      <Box sx={{ position: 'absolute', top: -10, left: -10 }}>
                        <Medal size={20} color={player.color} fill={player.color} />
                      </Box>
                    )}
                  </Box>
                </ListItemAvatar>
                <ListItemText
                  primary={player.username}
                  primaryTypographyProps={{ fontWeight: 700 }}
                  secondary={`Rank #${player.rank}`}
                />
                <Chip
                  label={`${player.xp} XP`}
                  size="small"
                  sx={{ fontWeight: 900, bgcolor: 'background.default' }}
                />
              </ListItem>
            ))
          )}
        </List>
      )}
    </Paper>
  );
};

export default LeaderboardTab;
