import React, { useState } from 'react';
// إضافة كل المكونات اللازمة لضمان عدم حدوث Error
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Button,
  InputAdornment,
  Chip,
  Stack,
  Paper, // تم الإضافة بنجاح هنا
} from '@mui/material';
import { Search, ShieldCheck, Star } from 'lucide-react';

/**
 * CoursesTab: صفحة الكورسات مع البحث والفلترة.
 * تم تصحيح أخطاء الاستيراد وترتيب الكروت.
 */
const CoursesTab = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [priceFilter, setPriceFilter] = useState('all');
  const [tutorFilter, setTutorFilter] = useState('all');

  // بيانات تجريبية (Data)
  const allCourses = [
    {
      id: 1,
      title: 'React Mastery',
      tutor: 'Aysha',
      price: 'Free',
      trusted: true,
      image:
        'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500&q=80',
    },
    {
      id: 2,
      title: 'Advanced Django',
      tutor: 'Saif',
      price: 'Paid',
      trusted: false,
      image:
        'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&q=80',
    },
    {
      id: 3,
      title: 'UI/UX Design',
      tutor: 'Layan',
      price: 'Free',
      trusted: true,
      image:
        'https://images.unsplash.com/photo-1586717791821-3f44a563dc4c?w=500&q=80',
    },
    {
      id: 4,
      title: 'SQL Database',
      tutor: 'Omar',
      price: 'Paid',
      trusted: true,
      image:
        'https://images.unsplash.com/photo-1544383023-53f0c674783a?w=500&q=80',
    },
  ];

  // منطق الفلترة
  const filteredCourses = allCourses.filter((course) => {
    const matchesSearch = course.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesPrice =
      priceFilter === 'all' || course.price.toLowerCase() === priceFilter;
    const matchesTutor =
      tutorFilter === 'all' || (tutorFilter === 'trusted' && course.trusted);
    return matchesSearch && matchesPrice && matchesTutor;
  });

  return (
    <Box sx={{ p: 1 }}>
      {/* شريط البحث والفلترة */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          border: '2px solid rgba(138, 45, 46, 0.1)',
          mb: 4,
          bgcolor: 'rgba(255, 255, 255, 0.5)',
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search for a quest (course)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={20} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Price</InputLabel>
              <Select
                value={priceFilter}
                label="Price"
                onChange={(e) => setPriceFilter(e.target.value)}
              >
                <MenuItem value="all">All Prices</MenuItem>
                <MenuItem value="free">Free</MenuItem>
                <MenuItem value="paid">Paid</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Tutor</InputLabel>
              <Select
                value={tutorFilter}
                label="Tutor"
                onChange={(e) => setTutorFilter(e.target.value)}
              >
                <MenuItem value="all">All Tutors</MenuItem>
                <MenuItem value="trusted">Trusted Only</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* عرض النتائج */}
      <Typography variant="h6" sx={{ fontWeight: 900, mb: 3 }}>
        AVAILABLE QUESTS ({filteredCourses.length})
      </Typography>

      <Grid container spacing={3}>
        {filteredCourses.map((course) => (
          <Grid item xs={12} sm={6} lg={4} key={course.id}>
            <Card
              sx={{
                borderRadius: 4,
                transition: '0.3s',
                '&:hover': { transform: 'translateY(-8px)', boxShadow: 6 },
              }}
            >
              <CardMedia
                component="img"
                height="140"
                image={course.image}
                alt={course.title}
              />
              <CardContent>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 1 }}
                >
                  <Chip
                    label={course.price}
                    size="small"
                    sx={{
                      bgcolor:
                        course.price === 'Free'
                          ? 'success.light'
                          : 'warning.light',
                      color:
                        course.price === 'Free'
                          ? 'success.dark'
                          : 'warning.dark',
                      fontWeight: 800,
                    }}
                  />
                  {course.trusted && <ShieldCheck size={20} color="#8A2D2E" />}
                </Stack>

                <Typography
                  variant="h6"
                  sx={{ fontWeight: 900, mb: 1, fontSize: '1.1rem' }}
                >
                  {course.title}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{ color: 'text.secondary', fontWeight: 700, mb: 2 }}
                >
                  Tutor: {course.tutor}
                </Typography>

                <Button
                  variant="contained"
                  fullWidth
                  sx={{
                    borderRadius: 2,
                    fontWeight: 800,
                    textTransform: 'none',
                  }}
                >
                  Start Quest
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default CoursesTab;
