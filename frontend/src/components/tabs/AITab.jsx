import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Stack,
  Chip,
  Avatar,
} from '@mui/material';
import { Sparkles, BrainCircuit, Rocket, Target } from 'lucide-react';

const AITab = ({ userName = 'Hero' }) => {
  // بيانات تجريبية لما قد يقترحه الـ AI
  const recommendations = [
    {
      id: 1,
      title: 'Next.js for Beginners',
      reason: 'Based on your React progress',
      difficulty: 'Intermediate',
    },
    {
      id: 2,
      title: 'Advanced SQL Patterns',
      reason: 'Matches your Database interest',
      difficulty: 'Expert',
    },
  ];

  return (
    <Box sx={{ p: 1 }}>
      {/* رأس صفحة الـ AI */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 4,
          background: 'linear-gradient(135deg, #9A2F2E 0%, #4A1516 100%)',
          color: 'white',
          mb: 4,
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 60, height: 60 }}
          >
            <Sparkles size={32} color="#fbc02d" />
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 900 }}>
              AI Personal Insights
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Welcome back, {userName}. I've analyzed your journey and found new
              paths for you.
            </Typography>
          </Box>
        </Stack>
      </Paper>

      <Grid container spacing={3}>
        {/* قسم التوصيات الذكية */}
        <Grid item xs={12} md={7}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 900,
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <BrainCircuit size={20} color="#9A2F2E" /> RECOMMENDED FOR YOU
          </Typography>
          <Stack spacing={2}>
            {recommendations.map((item) => (
              <Paper
                key={item.id}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: '2px solid rgba(154, 47, 46, 0.1)',
                  bgcolor: 'rgba(255, 255, 255, 0.6)',
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  {item.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  {item.reason}
                </Typography>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Chip
                    label={item.difficulty}
                    size="small"
                    variant="outlined"
                  />
                  <Button variant="text" sx={{ fontWeight: 800 }}>
                    Explore Quest
                  </Button>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </Grid>

        {/* قسم الـ Daily Goal */}
        <Grid item xs={12} md={5}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: 'rgba(255, 255, 255, 0.6)',
              border: '2px solid rgba(138, 45, 46, 0.1)',
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 900,
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Target size={20} /> AI DAILY CHALLENGE
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, fontWeight: 700 }}>
              Complete 2 React lessons today to boost your "Frontend Architect"
              rank by 15%!
            </Typography>
            <Button
              variant="contained"
              fullWidth
              sx={{ borderRadius: 2, fontWeight: 900 }}
            >
              ACCEPT CHALLENGE
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AITab;
