import React, { useState, useEffect } from 'react';
import axios from 'axios';
// إضافة كل المكونات اللازمة لضمان عدم حدوث Error
import {
  Box,
  Typography,
  TextField,
  Grid,
  Card,
  CardContent,
  Button,
  InputAdornment,
  Chip,
  Paper,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  IconButton,
} from '@mui/material';
import { Search, Video, HelpCircle, Play, ShieldCheck, Star, MessageCircle } from 'lucide-react';

/**
 * CoursesTab: صفحة الكورسات مع البحث والفلترة.
 * تم تصحيح أخطاء الاستيراد وترتيب الكروت.
 */
const CoursesTab = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [courses, setCourses] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [courseDetail, setCourseDetail] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [ratingStars, setRatingStars] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');

        const coursesResponse = await axios.get('http://127.0.0.1:8000/api/learner/courses/', {
          headers: { 'Authorization': `Token ${token}` }
        });
        setCourses(coursesResponse.data || []);

        const quizzesResponse = await axios.get('http://127.0.0.1:8000/api/learner/quizzes/', {
          headers: { 'Authorization': `Token ${token}` }
        });
        setQuizzes(quizzesResponse.data || []);
      } catch (err) {
        console.error('Error fetching content:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  const filteredCourses = courses.filter((course) =>
    course.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openCourseDetail = (course) => {
    setCourseDetail(course);
    setCommentText('');
    setRatingStars(0);
    const token = localStorage.getItem('token');
    if (!token) return;
    axios.get(`http://127.0.0.1:8000/api/learner/courses/${course.id}/`, {
      headers: { Authorization: `Token ${token}` }
    }).then(res => setCourseDetail(res.data)).catch(() => {});
  };

  const handleEnroll = async () => {
    if (!courseDetail?.id) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://127.0.0.1:8000/api/learner/courses/${courseDetail.id}/enroll/`, {}, {
        headers: { Authorization: `Token ${token}` }
      });
      setCourseDetail(prev => prev ? { ...prev, enrolled: true } : null);
    } catch (e) {
      console.error(e);
    }
    setSubmitting(false);
  };

  const handleAddComment = async () => {
    if (!courseDetail?.id || !commentText.trim()) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `http://127.0.0.1:8000/api/learner/courses/${courseDetail.id}/comments/`,
        { text: commentText },
        { headers: { Authorization: `Token ${token}` } }
      );
      setCourseDetail(prev => prev ? { ...prev, comments: [res.data, ...(prev.comments || [])] } : null);
      setCommentText('');
    } catch (e) {
      console.error(e);
    }
    setSubmitting(false);
  };

  const handleRate = async () => {
    if (!courseDetail?.id || ratingStars < 1 || ratingStars > 5) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://127.0.0.1:8000/api/learner/courses/${courseDetail.id}/rate/`,
        { stars: ratingStars },
        { headers: { Authorization: `Token ${token}` } }
      );
      setCourseDetail(prev => prev ? { ...prev, average_rating: ratingStars, rating_count: (prev.rating_count || 0) + 1 } : null);
    } catch (e) {
      console.error(e);
    }
    setSubmitting(false);
  };

  return (
    <Box sx={{ p: 1 }}>
      {/* Tabs للتنقل بين الكورسات والفيديوهات والكويزات */}
      <Paper
        sx={{
          mb: 3,
          borderRadius: 3,
          border: '2px solid rgba(154, 47, 46, 0.1)',
          bgcolor: 'rgba(255, 255, 255, 0.6)',
        }}
      >
        <Tabs
          value={tabValue}
          onChange={(_, v) => setTabValue(v)}
          sx={{
            '& .MuiTab-root': { fontWeight: 700 },
            '& .Mui-selected': { color: '#9A2F2E' },
            '& .MuiTabs-indicator': { bgcolor: '#9A2F2E' },
          }}
        >
          <Tab label={`COURSES (${courses.length})`} />
          <Tab label={`QUIZZES (${quizzes.length})`} />
        </Tabs>
      </Paper>

      {/* الكورسات = الفيديوهات المنشورة من التيوتورز */}
      {tabValue === 0 && (
        <Box>
          <TextField
            fullWidth
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ mb: 3, maxWidth: 400 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={20} />
                </InputAdornment>
              ),
            }}
          />
          <Typography variant="h6" sx={{ fontWeight: 900, mb: 3 }}>
            AVAILABLE COURSES ({filteredCourses.length})
          </Typography>
          {filteredCourses.length === 0 ? (
            <Paper
              sx={{
                p: 4,
                borderRadius: 3,
                border: '2px solid rgba(154, 47, 46, 0.1)',
                bgcolor: 'rgba(255, 255, 255, 0.6)',
                textAlign: 'center',
              }}
            >
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                No courses yet. Tutors publish courses by uploading videos—check back later!
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {filteredCourses.map((course) => (
                <Grid item xs={12} sm={6} md={4} key={course.id}>
                  <Card
                    sx={{
                      borderRadius: 3,
                      border: '2px solid rgba(154, 47, 46, 0.1)',
                      bgcolor: 'rgba(255, 255, 255, 0.6)',
                      transition: '0.3s',
                      '&:hover': { transform: 'translateY(-8px)', boxShadow: 6 },
                    }}
                  >
                    <Box
                      sx={{
                        height: 140,
                        bgcolor: '#9A2F2E',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Video size={48} color="#fff" />
                    </Box>
                    <CardContent>
                      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                        <Chip
                          label={course.is_paid && course.price ? `$${Number(course.price)}` : 'Free'}
                          size="small"
                          sx={{
                            bgcolor: course.is_paid ? 'warning.light' : 'success.light',
                            color: course.is_paid ? 'warning.dark' : 'success.dark',
                            fontWeight: 700,
                          }}
                        />
                        {course.tutor_verified && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }} title="Trusted Tutor">
                            <ShieldCheck size={18} color="#9A2F2E" />
                          </Box>
                        )}
                      </Stack>
                      <Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>
                        {course.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700, mb: 1 }}>
                        Tutor: {course.tutor_username}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }} noWrap>
                        {course.description || 'No description'}
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => openCourseDetail(course)}
                          startIcon={<MessageCircle size={16} />}
                          sx={{ flex: 1, fontWeight: 700 }}
                        >
                          Details
                        </Button>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<Play size={16} />}
                          href={course.video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            flex: 1,
                            fontWeight: 800,
                            bgcolor: '#9A2F2E',
                            '&:hover': { bgcolor: '#7a2627' },
                          }}
                        >
                          Watch
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {/* محتوى التاب Quizzes */}
      {tabValue === 1 && (
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 900, mb: 3 }}>
            AVAILABLE QUIZZES ({quizzes.length})
          </Typography>
          {quizzes.length === 0 ? (
            <Paper
              sx={{
                p: 4,
                borderRadius: 3,
                border: '2px solid rgba(154, 47, 46, 0.1)',
                bgcolor: 'rgba(255, 255, 255, 0.6)',
                textAlign: 'center',
              }}
            >
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                No quizzes available yet. Check back later!
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {quizzes.map((quiz) => (
                <Grid item xs={12} sm={6} md={4} key={quiz.id}>
                  <Card
                    sx={{
                      borderRadius: 3,
                      border: '2px solid rgba(154, 47, 46, 0.1)',
                      bgcolor: 'rgba(255, 255, 255, 0.6)',
                      transition: '0.3s',
                      '&:hover': { transform: 'translateY(-8px)', boxShadow: 6 },
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <HelpCircle size={24} color="#9A2F2E" />
                        <Chip
                          label={`${quiz.questions?.length || 0} Questions`}
                          size="small"
                          sx={{ bgcolor: 'rgba(154, 47, 46, 0.1)', color: '#9A2F2E' }}
                        />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>
                        {quiz.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: 'text.secondary', mb: 2 }}
                      >
                        {quiz.description || 'No description'}
                      </Typography>
                      <Button
                        variant="contained"
                        fullWidth
                        sx={{
                          borderRadius: 2,
                          fontWeight: 800,
                          bgcolor: '#9A2F2E',
                          '&:hover': { bgcolor: '#7a2627' },
                        }}
                      >
                        Start Quiz
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {/* Course detail dialog: comments, rating, enroll */}
      <Dialog open={!!courseDetail} onClose={() => setCourseDetail(null)} maxWidth="sm" fullWidth>
        {courseDetail && (
          <>
            <DialogTitle sx={{ fontWeight: 900, color: '#9A2F2E' }}>
              {courseDetail.title}
              {courseDetail.tutor_verified && (
                <Box component="span" sx={{ ml: 1 }} title="Trusted Tutor">
                  <ShieldCheck size={22} color="#9A2F2E" style={{ verticalAlign: 'middle' }} />
                </Box>
              )}
            </DialogTitle>
            <DialogContent>
              <Typography variant="body2" sx={{ mb: 2 }}>{courseDetail.description || 'No description'}</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, mb: 2 }}>
                Tutor: {courseDetail.tutor_username} · {courseDetail.is_paid && courseDetail.price ? `$${Number(courseDetail.price)}` : 'Free'}
              </Typography>
              {courseDetail.average_rating != null && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Star size={18} color="#fbc02d" fill="#fbc02d" />
                  <Typography variant="body2">{courseDetail.average_rating} ({courseDetail.rating_count} ratings)</Typography>
                </Box>
              )}

              <Typography variant="subtitle2" sx={{ fontWeight: 800, mt: 2, mb: 1 }}>Rate this course (1-5 stars)</Typography>
              <Stack direction="row" spacing={0.5} sx={{ mb: 2 }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <IconButton key={s} size="small" onClick={() => setRatingStars(s)}>
                    <Star size={24} color={ratingStars >= s ? '#fbc02d' : '#ccc'} fill={ratingStars >= s ? '#fbc02d' : 'transparent'} />
                  </IconButton>
                ))}
                <Button size="small" variant="outlined" onClick={handleRate} disabled={submitting || ratingStars < 1}>Submit</Button>
              </Stack>

              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>Comments</Typography>
              <Stack spacing={1} sx={{ mb: 2, maxHeight: 200, overflow: 'auto' }}>
                {(courseDetail.comments || []).map((c) => (
                  <Paper key={c.id} variant="outlined" sx={{ p: 1.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>{c.username}</Typography>
                    <Typography variant="body2">{c.text}</Typography>
                  </Paper>
                ))}
              </Stack>
              <TextField
                fullWidth
                size="small"
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                sx={{ mb: 1 }}
              />
              <Button size="small" onClick={handleAddComment} disabled={submitting || !commentText.trim()}>Post comment</Button>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setCourseDetail(null)}>Close</Button>
              <Button variant="contained" onClick={handleEnroll} disabled={submitting} sx={{ bgcolor: '#9A2F2E', '&:hover': { bgcolor: '#7a2627' } }}>
                Enroll in course
              </Button>
              <Button variant="contained" href={courseDetail.video_url} target="_blank" rel="noopener noreferrer" startIcon={<Play size={18} />} sx={{ bgcolor: '#9A2F2E', '&:hover': { bgcolor: '#7a2627' } }}>
                Watch
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default CoursesTab;
