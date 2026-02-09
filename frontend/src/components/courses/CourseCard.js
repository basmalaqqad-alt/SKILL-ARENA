import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Stack,
  Chip,
} from '@mui/material';
import { ShieldCheck, Star } from 'lucide-react';

/**
 * Clean & Performance-optimized CourseCard.
 * No complex logic inside to prevent infinite re-renders.
 */
const CourseCard = ({ course }) => {
  // Safety check: if course is missing, don't render anything
  if (!course) return null;

  return (
    <Card
      sx={{
        borderRadius: 4,
        border: '2px solid #E5E5E5',
        boxShadow: '0 4px 0 #E5E5E5',
        mb: 2,
      }}
    >
      <CardContent>
        <Stack spacing={2}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              {course.title}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="subtitle2" color="text.secondary">
                Instructor: {course.instructor?.name}
              </Typography>
              {course.instructor?.isTrusted && (
                <ShieldCheck size={16} color="#8A2D2E" />
              )}
            </Stack>
          </Box>

          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Chip
              icon={<Star size={14} fill="#FACA07" color="#FACA07" />}
              label={`${course.xpReward} XP`}
              size="small"
              sx={{ fontWeight: 900, bgcolor: 'rgba(250, 202, 7, 0.1)' }}
            />
            <Button
              variant="contained"
              size="small"
              sx={{ borderRadius: 2, fontWeight: 800 }}
            >
              START
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default CourseCard;
