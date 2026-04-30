import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Paper, List, ListItem, ListItemAvatar, Avatar,
  ListItemText, Typography, Chip, Stack, Box,
  CircularProgress, Tabs, Tab,
} from '@mui/material';
import { Trophy, Medal, User, GraduationCap, BookOpen } from 'lucide-react';

const MAROON = '#9A2F2E';

const LeaderboardList = ({ players }) => (
  <List sx={{ p: 0 }}>
    {players.length === 0 ? (
      <ListItem>
        <Typography variant="body2" color="text.secondary">No rankings yet.</Typography>
      </ListItem>
    ) : (
      players.map((player) => (
        <ListItem key={player.id} divider
          sx={{ py: 2, bgcolor: player.rank === 1 ? 'rgba(250,202,7,0.05)' : 'transparent' }}>
          <ListItemAvatar>
            <Box sx={{ position: 'relative' }}>
              <Avatar src={player.avatar_url || undefined}
                sx={{ bgcolor: 'grey.300', fontWeight: 800 }}>
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
          <Chip label={`${player.xp} XP`} size="small"
            sx={{ fontWeight: 900, bgcolor: 'background.default' }} />
        </ListItem>
      ))
    )}
  </List>
);

const LeaderboardTab = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState(0); // 0=Learners, 1=Tutors

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }
    axios.get('http://127.0.0.1:8000/api/accounts/leaderboard/', {
      headers: { Authorization: `Token ${token}` }
    })
      .then(res => setPlayers(res.data || []))
      .catch(() => setPlayers([]))
      .finally(() => setLoading(false));
  }, []);

  const learners = players.filter(p => p.role === 'learner' || !p.role);
  const tutors   = players.filter(p => p.role === 'tutor');

  // Re-rank each group
  const rerank = (list) => list.map((p, i) => ({ ...p, rank: i + 1,
    color: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : null }));

  return (
    <Paper sx={{ borderRadius: 3, overflow: 'hidden', border: '2px solid rgba(154,47,46,0.1)' }}>
      {/* Header */}
      <Box sx={{ p: 3, bgcolor: 'primary.main', color: 'white' }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Trophy color="#FACA07" size={32} />
          <Typography variant="h6" sx={{ fontWeight: 900 }}>Arena Champions</Typography>
        </Stack>
      </Box>

      {/* Tabs */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)}
        sx={{
          borderBottom: '1px solid rgba(0,0,0,0.08)',
          '& .Mui-selected': { color: MAROON, fontWeight: 700 },
          '& .MuiTabs-indicator': { bgcolor: MAROON },
        }}>
        <Tab icon={<BookOpen size={16} />} iconPosition="start" label={`Learners (${learners.length})`}
          sx={{ fontWeight: 600, fontSize: '0.85rem' }} />
        <Tab icon={<GraduationCap size={16} />} iconPosition="start" label={`Instructors (${tutors.length})`}
          sx={{ fontWeight: 600, fontSize: '0.85rem' }} />
      </Tabs>

      {loading ? (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress sx={{ color: MAROON }} />
        </Box>
      ) : (
        <>
          {tab === 0 && <LeaderboardList players={rerank(learners)} />}
          {tab === 1 && <LeaderboardList players={rerank(tutors)} />}
        </>
      )}
    </Paper>
  );
};

export default LeaderboardTab;