import React from 'react';
import { Box, Container, Stack, Typography, Chip, Avatar } from '@mui/material';
import { User } from 'lucide-react';

const Header = ({ userXP }) => {
  return (
    <Box
      sx={{
        bgcolor: '#fff',
        p: 1.5,
        borderBottom: '1px solid #FACA07',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      <Container maxWidth="md">
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h6" sx={{ fontWeight: 900, color: '#8A2D2E' }}>
            SKILLARENA
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            {/* Display user experience points */}
            <Chip
              label={`${userXP} XP`}
              color="secondary"
              size="small"
              sx={{ fontWeight: 800 }}
            />
            <Avatar sx={{ bgcolor: '#8A2D2E', width: 32, height: 32 }}>
              <User size={18} />
            </Avatar>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};

export default Header;
