import React from 'react';
import { Box, Stack, Typography, Avatar, Tooltip, Chip } from '@mui/material';
import { User, ShieldCheck, Zap } from 'lucide-react';
import Logo from '../common/Logo';


const Header = ({ userXP, avatarUrl, isTutor, isTrustedTutor }) => {
  const username = localStorage.getItem('username') || '';

  return (
    <Box
      component="header"
      sx={{
        position: 'sticky', top: 0, zIndex: 200,
        bgcolor: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(0,0,0,0.07)',
        px: { xs: 2.5, md: 4 },
        height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}
    >
      {/* Logo */}
      <Logo height={28} />

      {/* Right side */}
      <Stack direction="row" spacing={1.5} alignItems="center">
        {/* XP counter */}
        <Stack
          direction="row" alignItems="center" spacing={0.75}
          sx={{
            bgcolor: '#FEFCE8',
            border: '1px solid rgba(250,202,7,0.35)',
            borderRadius: '99px',
            px: 1.5, py: 0.4,
          }}
        >
          <Zap size={13} color="#C8970A" fill="#FACA07" />
          <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#7A5800', letterSpacing: '0.01em' }}>
            {userXP ?? 0}&nbsp;XP
          </Typography>
        </Stack>

        {/* Trusted Tutor badge */}
        {isTutor && isTrustedTutor && (
          <Tooltip title="Trusted Tutor — Verified certificate" arrow>
            <Box
              sx={{
                width: 32, height: 32,
                borderRadius: '50%',
                bgcolor: 'rgba(138,45,46,0.07)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'default',
              }}
            >
              <ShieldCheck size={16} color="#8A2D2E" />
            </Box>
          </Tooltip>
        )}

        {/* Avatar */}
        <Tooltip title={username || 'Profile'} arrow>
          <Avatar
            src={avatarUrl || undefined}
            sx={{
              width: 34, height: 34,
              bgcolor: '#8A2D2E',
              fontSize: '0.95rem',
              fontWeight: 900,
              color: '#fff',
              border: '2px solid rgba(138,45,46,0.18)',
              cursor: 'pointer',
              transition: 'transform 0.15s',
              '&:hover': { transform: 'scale(1.07)', bgcolor: '#7a2627' },
            }}
          >
            {!avatarUrl && (username ? username[0].toUpperCase() : <User size={16} />)}
          </Avatar>
        </Tooltip>
      </Stack>
    </Box>
  );
};

export default Header;