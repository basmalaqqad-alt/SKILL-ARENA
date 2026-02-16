import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Stack,
  Paper,
  Typography,
  Grid,
  Box,
  Card,
  CardContent,
  Divider,
  Chip,
} from '@mui/material';
import {
  Award,
  Zap,
  TrendingUp,
  Video,
  HelpCircle,
  Coins,
  Trophy,
  Star,
  Clock,
  GraduationCap,
} from 'lucide-react';

const LEARNER_COLORS = {
  cream: '#F8F4DF',
  maroon: '#9A2F2E',
  maroonLight: 'rgba(154, 47, 46, 0.08)',
  gold: '#FACA07',
};

const AboutTab = () => {
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const response = await axios.get('http://127.0.0.1:8000/api/accounts/profile/', {
          headers: { Authorization: `Token ${token}` }
        });
        setProfileData(response.data);
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    };
    fetchProfile();
  }, []);

  const xpSources = [
    {
      icon: <Star size={24} color={LEARNER_COLORS.gold} fill={LEARNER_COLORS.gold} />,
      title: 'Welcome Bonus',
      description: 'Get 100 XP when you register for the first time',
      xp: '+100 XP',
      color: '#2e7d32',
    },
    {
      icon: <Clock size={24} color={LEARNER_COLORS.maroon} />,
      title: 'Daily Engagement',
      description: 'Log in daily to earn 10 XP (once per day)',
      xp: '+10 XP',
      color: '#ed6c02',
    },
    {
      icon: <Video size={24} color={LEARNER_COLORS.maroon} />,
      title: 'Course Completion',
      description: 'Complete watching an entire educational video to earn 50 XP',
      xp: '+50 XP',
      color: '#2563eb',
    },
    {
      icon: <HelpCircle size={24} color={LEARNER_COLORS.maroon} />,
      title: 'Quizzes',
      description: 'Earn 300 XP for perfect score, 150 XP for 50%+, and 0 XP for less than 50%',
      xp: '300/150/0 XP',
      color: '#9c27b0',
    },
    {
      icon: <GraduationCap size={24} color={LEARNER_COLORS.maroon} />,
      title: 'P2P Contribution',
      description: 'Tutors: 500 XP per course uploaded | Students: 50 XP per comment/answer',
      xp: '+500/+50 XP',
      color: '#d32f2f',
    },
  ];

  const ranks = [
    { name: 'Novice', minXP: 0, maxXP: 999, color: '#757575', icon: '🌱' },
    { name: 'Warrior', minXP: 1000, maxXP: 4999, color: '#1976d2', icon: '⚔️' },
    { name: 'Knight', minXP: 5000, maxXP: 14999, color: '#7b1fa2', icon: '🛡️' },
    { name: 'Master', minXP: 15000, maxXP: 49999, color: '#f57c00', icon: '👑' },
    { name: 'Legend', minXP: 50000, maxXP: Infinity, color: '#d32f2f', icon: '🌟' },
  ];

  const milestoneBadges = [
    { name: 'The Starter', courses: 5, icon: '🎯' },
    { name: 'The Explorer', courses: 10, icon: '🗺️' },
    { name: 'The Scholar', courses: 25, icon: '📚' },
    { name: 'The Mentor', courses: 50, icon: '🎓' },
    { name: 'The Professor', courses: 100, icon: '🏆' },
  ];

  const currentXP = profileData?.experience || 0;
  const currentRank = profileData?.rank_name || 'Novice';
  const currentBadges = profileData?.badges || [];
  const arenaCoins = profileData?.arena_coins || 0;
  const completedCourses = profileData?.completed_courses?.length || 0;

  return (
    <Stack spacing={4}>
      {/* Hero Section - Your Current Stats */}
      <Paper
        sx={{
          p: 4,
          borderRadius: 4,
          background: `linear-gradient(135deg, #9A2F2E 0%, #C62828 50%, #B71C1C 100%)`,
          color: 'white',
          boxShadow: '0 8px 24px rgba(154, 47, 46, 0.3)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 20% 50%, rgba(250, 202, 7, 0.15) 0%, transparent 50%)',
            pointerEvents: 'none',
          },
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 900, 
              mb: 2, 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1.5,
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            }}
          >
            <Zap size={36} color={LEARNER_COLORS.gold} fill={LEARNER_COLORS.gold} />
            Points & Badges System
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, opacity: 0.95, fontSize: '1.05rem', lineHeight: 1.7 }}>
            Earn Experience Points (XP) through your learning activities, level up in ranks, unlock badges, and accumulate Arena Coins!
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Box 
                sx={{ 
                  textAlign: 'center', 
                  p: 2.5, 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  borderRadius: 3,
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  transition: 'all 0.3s',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.25)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <Typography variant="h4" sx={{ fontWeight: 900, color: LEARNER_COLORS.gold, mb: 0.5 }}>
                  {currentXP.toLocaleString()}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, opacity: 0.9 }}>Current XP</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box 
                sx={{ 
                  textAlign: 'center', 
                  p: 2.5, 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  borderRadius: 3,
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  transition: 'all 0.3s',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.25)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <Typography variant="h4" sx={{ fontWeight: 900, color: LEARNER_COLORS.gold, mb: 0.5 }}>
                  {currentRank}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, opacity: 0.9 }}>Current Rank</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box 
                sx={{ 
                  textAlign: 'center', 
                  p: 2.5, 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  borderRadius: 3,
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  transition: 'all 0.3s',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.25)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <Typography variant="h4" sx={{ fontWeight: 900, color: LEARNER_COLORS.gold, mb: 0.5 }}>
                  {currentBadges.length}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, opacity: 0.9 }}>Badges Earned</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box 
                sx={{ 
                  textAlign: 'center', 
                  p: 2.5, 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  borderRadius: 3,
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  transition: 'all 0.3s',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.25)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <Typography variant="h4" sx={{ fontWeight: 900, color: LEARNER_COLORS.gold, mb: 0.5 }}>
                  {arenaCoins}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, opacity: 0.9 }}>Arena Coins</Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* XP Sources */}
      <Paper sx={{ p: 4, borderRadius: 3, border: `2px solid ${LEARNER_COLORS.maroonLight}`, bgcolor: 'rgba(255, 255, 255, 0.95)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <Typography variant="h5" sx={{ fontWeight: 900, mb: 1, color: LEARNER_COLORS.maroon, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <TrendingUp size={28} color={LEARNER_COLORS.maroon} />
          XP Sources
        </Typography>
        <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary', fontSize: '0.95rem' }}>
          Earn Experience Points through the following activities:
        </Typography>
        <Grid container spacing={2.5}>
          {xpSources.map((source, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  borderRadius: 3,
                  border: `2px solid ${LEARNER_COLORS.maroonLight}`,
                  bgcolor: 'white',
                  transition: 'all 0.3s',
                  '&:hover': { 
                    transform: 'translateY(-6px)', 
                    boxShadow: '0 8px 16px rgba(154, 47, 46, 0.15)',
                    borderColor: source.color,
                  },
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
                    <Box sx={{ mt: 0.5 }}>{source.icon}</Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5, fontSize: '1rem' }}>
                        {source.title}
                      </Typography>
                      <Chip
                        label={source.xp}
                        size="small"
                        sx={{
                          bgcolor: source.color,
                          color: 'white',
                          fontWeight: 800,
                          fontSize: '0.7rem',
                          height: 22,
                        }}
                      />
                    </Box>
                  </Box>
                  <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7, fontSize: '0.9rem' }}>
                    {source.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Ranks & Levels */}
      <Paper sx={{ p: 4, borderRadius: 3, border: `2px solid ${LEARNER_COLORS.maroonLight}`, bgcolor: 'rgba(255, 255, 255, 0.95)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <Typography variant="h5" sx={{ fontWeight: 900, mb: 1, color: LEARNER_COLORS.maroon, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Trophy size={28} color={LEARNER_COLORS.maroon} />
          Ranks & Levels
        </Typography>
        <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary', fontSize: '0.95rem' }}>
          As you accumulate XP, you level up in ranks and appear on the leaderboard:
        </Typography>
        <Grid container spacing={2.5}>
          {ranks.map((rank, index) => {
            const isCurrentRank = rank.name === currentRank;
            const progress = currentXP >= rank.minXP && currentXP < rank.maxXP
              ? Math.min(100, ((currentXP - rank.minXP) / (rank.maxXP - rank.minXP)) * 100)
              : currentXP >= rank.maxXP ? 100 : 0;
            
            return (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    borderRadius: 3,
                    border: isCurrentRank ? `3px solid ${rank.color}` : `2px solid ${LEARNER_COLORS.maroonLight}`,
                    bgcolor: isCurrentRank ? `${rank.color}12` : 'white',
                    transition: 'all 0.3s',
                    '&:hover': { 
                      transform: 'translateY(-6px)', 
                      boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
                      <Typography variant="h3" sx={{ lineHeight: 1 }}>{rank.icon}</Typography>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
                          <Typography variant="h6" sx={{ fontWeight: 800, color: rank.color }}>
                            {rank.name}
                          </Typography>
                          {isCurrentRank && (
                            <Chip 
                              label="Current" 
                              size="small" 
                              sx={{ 
                                bgcolor: rank.color, 
                                color: 'white', 
                                fontSize: '0.65rem',
                                height: 20,
                                fontWeight: 700,
                              }} 
                            />
                          )}
                        </Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
                          {rank.minXP.toLocaleString()} - {rank.maxXP === Infinity ? '∞' : rank.maxXP.toLocaleString()} XP
                        </Typography>
                      </Box>
                    </Box>
                    {isCurrentRank && progress > 0 && progress < 100 && (
                      <Box sx={{ mt: 2 }}>
                        <Box
                          sx={{
                            width: '100%',
                            height: 10,
                            bgcolor: LEARNER_COLORS.maroonLight,
                            borderRadius: 5,
                            overflow: 'hidden',
                          }}
                        >
                          <Box
                            sx={{
                              width: `${progress}%`,
                              height: '100%',
                              bgcolor: rank.color,
                              transition: 'width 0.5s ease',
                              borderRadius: 5,
                            }}
                          />
                        </Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block', fontSize: '0.75rem' }}>
                          {progress.toFixed(0)}% progress to next rank
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Paper>

      {/* Badges */}
      <Paper sx={{ p: 4, borderRadius: 3, border: `2px solid ${LEARNER_COLORS.maroonLight}`, bgcolor: 'rgba(255, 255, 255, 0.95)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <Typography variant="h5" sx={{ fontWeight: 900, mb: 1, color: LEARNER_COLORS.maroon, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Award size={28} color={LEARNER_COLORS.maroon} />
          Badges
        </Typography>
        <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary', fontSize: '0.95rem' }}>
          Unlock badges based on your achievements:
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2, color: LEARNER_COLORS.maroon }}>
            Milestone Badges
          </Typography>
          <Grid container spacing={2}>
            {milestoneBadges.map((badge, index) => {
              const isEarned = completedCourses >= badge.courses;
              return (
                <Grid item xs={6} sm={4} md={2.4} key={index}>
                  <Card
                    sx={{
                      textAlign: 'center',
                      p: 2,
                      borderRadius: 3,
                      border: isEarned ? `2px solid ${LEARNER_COLORS.gold}` : `2px solid ${LEARNER_COLORS.maroonLight}`,
                      bgcolor: isEarned ? `${LEARNER_COLORS.gold}20` : 'white',
                      opacity: isEarned ? 1 : 0.65,
                      transition: 'all 0.3s',
                      '&:hover': {
                        transform: 'scale(1.05)',
                        boxShadow: isEarned ? '0 4px 12px rgba(250, 202, 7, 0.3)' : '0 4px 8px rgba(0,0,0,0.1)',
                      },
                    }}
                  >
                    <Typography variant="h3" sx={{ mb: 1 }}>{badge.icon}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, mb: 0.5, fontSize: '0.85rem' }}>
                      {badge.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                      {badge.courses}+ courses
                    </Typography>
                    {isEarned && (
                      <Chip 
                        label="Earned" 
                        size="small" 
                        sx={{ 
                          mt: 1, 
                          bgcolor: LEARNER_COLORS.gold, 
                          color: '#000', 
                          fontSize: '0.65rem', 
                          fontWeight: 800,
                          height: 20,
                        }} 
                      />
                    )}
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2, color: LEARNER_COLORS.maroon }}>
            Trust Badges
          </Typography>
          <Card
            sx={{
              p: 2.5,
              borderRadius: 3,
              border: profileData?.is_trusted_tutor ? `2px solid ${LEARNER_COLORS.gold}` : `2px solid ${LEARNER_COLORS.maroonLight}`,
              bgcolor: profileData?.is_trusted_tutor ? `${LEARNER_COLORS.gold}20` : 'white',
              transition: 'all 0.3s',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h3">🛡️</Typography>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
                  Trusted Tutor
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
                  For verified tutors who have uploaded their certificates
                </Typography>
              </Box>
              {profileData?.is_trusted_tutor ? (
                <Chip 
                  label="Earned" 
                  sx={{ 
                    bgcolor: LEARNER_COLORS.gold, 
                    color: '#000', 
                    fontWeight: 800,
                    fontSize: '0.85rem',
                  }} 
                />
              ) : (
                <Chip 
                  label="Not Available" 
                  sx={{ 
                    bgcolor: LEARNER_COLORS.maroonLight, 
                    color: 'text.secondary',
                    fontSize: '0.85rem',
                  }} 
                />
              )}
            </Box>
          </Card>
        </Box>
      </Paper>

      {/* Arena Coins */}
      <Paper sx={{ p: 4, borderRadius: 3, border: `2px solid ${LEARNER_COLORS.maroonLight}`, bgcolor: 'rgba(255, 255, 255, 0.95)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <Coins size={36} color={LEARNER_COLORS.gold} fill={LEARNER_COLORS.gold} />
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <Typography variant="h5" sx={{ fontWeight: 900, color: LEARNER_COLORS.maroon, mb: 0.5 }}>
              Arena Coins
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.95rem' }}>
              Monetization Bridge: Convert XP into real currency!
            </Typography>
          </Box>
          <Box 
            sx={{ 
              textAlign: 'center', 
              p: 2.5, 
              bgcolor: `${LEARNER_COLORS.gold}25`, 
              borderRadius: 3, 
              minWidth: 140,
              border: `2px solid ${LEARNER_COLORS.gold}40`,
            }}
          >
            <Typography variant="h3" sx={{ fontWeight: 900, color: LEARNER_COLORS.maroon, mb: 0.5 }}>
              {arenaCoins}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>Available Coins</Typography>
          </Box>
        </Box>
        <Divider sx={{ my: 2.5 }} />
        <Grid container spacing={2.5}>
          <Grid item xs={12} md={6}>
            <Box 
              sx={{ 
                p: 2.5, 
                bgcolor: `${LEARNER_COLORS.maroon}08`, 
                borderRadius: 3,
                border: `1px solid ${LEARNER_COLORS.maroonLight}`,
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: LEARNER_COLORS.maroon, display: 'flex', alignItems: 'center', gap: 1 }}>
                💰 Conversion Rate
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.95rem', lineHeight: 1.7 }}>
                Every <strong style={{ color: LEARNER_COLORS.maroon }}>1,000 XP = 1 Arena Coin</strong>
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box 
              sx={{ 
                p: 2.5, 
                bgcolor: `${LEARNER_COLORS.maroon}08`, 
                borderRadius: 3,
                border: `1px solid ${LEARNER_COLORS.maroonLight}`,
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: LEARNER_COLORS.maroon, display: 'flex', alignItems: 'center', gap: 1 }}>
                🎁 Usage
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.95rem', lineHeight: 1.7 }}>
                Use Arena Coins to purchase paid courses or unlock VIP profile features
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Stack>
  );
};

export default AboutTab;
