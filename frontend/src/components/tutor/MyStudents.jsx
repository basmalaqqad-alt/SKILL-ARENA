import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Chip,
  Stack,
  CircularProgress,
  Collapse,
  IconButton,
  LinearProgress,
} from '@mui/material';
import { ChevronDown, ChevronUp } from 'lucide-react';

const TUTOR_COLORS = {
  cream: '#F8F4DF',
  maroon: '#9A2F2E',
  maroonLight: 'rgba(154, 47, 46, 0.08)',
};

const MyStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://127.0.0.1:8000/api/accounts/tutor/my-students/', {
          headers: { Authorization: `Token ${token}` },
        });
        setStudents(response.data || []);
      } catch (err) {
        console.error('Failed to fetch students:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress sx={{ color: TUTOR_COLORS.maroon }} />
      </Box>
    );
  }

  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: 3,
        border: `2px solid ${TUTOR_COLORS.maroonLight}`,
        bgcolor: 'rgba(255, 255, 255, 0.6)',
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 800, color: TUTOR_COLORS.maroon, mb: 2 }}>
        My Students ({students.length})
      </Typography>

      {students.length === 0 ? (
        <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic', p: 2 }}>
          No students enrolled in your courses yet.
        </Typography>
      ) : (
        <List disablePadding>
          {students.map((s) => (
            <Box key={s.id}>
              <ListItem
                divider
                sx={{
                  py: 2,
                  '&:last-child': { borderBottom: 'none' },
                  cursor: 'pointer',
                  borderRadius: 2,
                  '&:hover': { bgcolor: TUTOR_COLORS.maroonLight },
                }}
                onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
              >
                <Avatar
                  src={s.avatar_url || undefined}
                  sx={{ mr: 2, bgcolor: TUTOR_COLORS.maroon, fontWeight: 700 }}
                >
                  {s.username.charAt(0).toUpperCase()}
                </Avatar>
                <ListItemText
                  primary={s.name !== s.username ? `${s.name} (${s.username})` : s.username}
                  primaryTypographyProps={{ fontWeight: 700, color: TUTOR_COLORS.maroon }}
                  secondary={`${s.courses.length} course${s.courses.length !== 1 ? 's' : ''} enrolled`}
                  secondaryTypographyProps={{ color: 'text.secondary' }}
                />
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip
                    label={s.courses.filter(c => c.completed).length + '/' + s.courses.length + ' done'}
                    size="small"
                    sx={{ bgcolor: TUTOR_COLORS.maroonLight, color: TUTOR_COLORS.maroon, fontWeight: 700 }}
                  />
                  <IconButton size="small" sx={{ color: TUTOR_COLORS.maroon }}>
                    {expandedId === s.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </IconButton>
                </Stack>
              </ListItem>

              {/* تفاصيل الكورسات عند الضغط */}
              <Collapse in={expandedId === s.id}>
                <Box sx={{ pl: 8, pr: 2, pb: 2, pt: 1, bgcolor: 'rgba(154, 47, 46, 0.03)', borderRadius: 2 }}>
                  {s.courses.map((c) => (
                    <Box key={c.course_id} sx={{ mb: 1.5 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {c.course_title}
                        </Typography>
                        <Chip
                          label={c.completed ? 'Completed ✓' : `${c.progress}%`}
                          size="small"
                          sx={{
                            bgcolor: c.completed ? 'rgba(46,125,50,0.1)' : TUTOR_COLORS.maroonLight,
                            color: c.completed ? '#2e7d32' : TUTOR_COLORS.maroon,
                            fontWeight: 700,
                          }}
                        />
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={c.completed ? 100 : c.progress}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          bgcolor: 'rgba(0,0,0,0.05)',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: c.completed ? '#2e7d32' : TUTOR_COLORS.maroon,
                          },
                        }}
                      />
                    </Box>
                  ))}
                </Box>
              </Collapse>
            </Box>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default MyStudents;
