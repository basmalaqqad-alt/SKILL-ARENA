import React from 'react';
import { Box, Container, Stack, Typography, Chip, Avatar, Tooltip } from '@mui/material';
import { User, ShieldCheck } from 'lucide-react';

const Header = ({ userXP, avatarUrl, isTutor, isTrustedTutor }) => {
  const cream = '#F8F4DF';
  return (
    <Box
      sx={{
        bgcolor: cream,
        p: 1.5,
        borderBottom: '1px solid rgba(154, 47, 46, 0.2)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      <Container maxWidth="md">
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" sx={{ fontWeight: 900, color: '#9A2F2E' }}>
            SKILLARENA
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Chip label={`${userXP} XP`} color="secondary" size="small" sx={{ fontWeight: 800 }} />
            {isTutor && isTrustedTutor && (
              <Tooltip title="Trusted Tutor – Verified certificate">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ShieldCheck size={22} color="#9A2F2E" />
                </Box>
              </Tooltip>
            )}
            <Avatar
              src={avatarUrl || undefined}
              sx={{ bgcolor: '#9A2F2E', width: 36, height: 36 }}
            >
              {!avatarUrl && <User size={20} />}
            </Avatar>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};

export default Header;
