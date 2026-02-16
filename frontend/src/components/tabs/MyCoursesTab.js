import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Paper,
  LinearProgress,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import {
  Video,
  Play,
  CheckCircle,
  Clock,
  HelpCircle,
  ShieldCheck,
  Star,
  MessageCircle,
} from 'lucide-react';

const LEARNER_COLORS = {
  cream: '#F8F4DF',
  maroon: '#9A2F2E',
  maroonLight: 'rgba(154, 47, 46, 0.08)',
  gold: '#FACA07',
};

const MyCoursesTab = () => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [ratingStars, setRatingStars] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  const fetchEnrolledCourses = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://127.0.0.1:8000/api/learner/courses/enrolled/', {
        headers: { Authorization: `Token ${token}` }
      });
      setEnrolledCourses(response.data || []);
    } catch (err) {
      console.error('Error fetching enrolled courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteCourse = async (courseId) => {
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`http://127.0.0.1:8000/api/learner/courses/${courseId}/complete/`, {}, {
        headers: { Authorization: `Token ${token}` }
      });
      await fetchEnrolledCourses();
      alert(`Course completed! You earned ${response.data.xp_awarded} XP!`);
    } catch (err) {
      console.error('Error completing course:', err);
      alert(err.response?.data?.error || 'Error completing course');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddComment = async () => {
    if (!selectedCourse?.id || !commentText.trim()) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `http://127.0.0.1:8000/api/learner/courses/${selectedCourse.id}/comments/`,
        { text: commentText },
        { headers: { Authorization: `Token ${token}` } }
      );
      setSelectedCourse(prev => prev ? { ...prev, comments: [res.data, ...(prev.comments || [])] } : null);
      setCommentText('');
    } catch (err) {
      console.error('Error adding comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRate = async () => {
    if (!selectedCourse?.id || ratingStars < 1 || ratingStars > 5) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://127.0.0.1:8000/api/learner/courses/${selectedCourse.id}/rate/`,
        { stars: ratingStars },
        { headers: { Authorization: `Token ${token}` } }
      );
      setSelectedCourse(prev => prev ? { ...prev, average_rating: ratingStars, rating_count: (prev.rating_count || 0) + 1 } : null);
    } catch (err) {
      console.error('Error rating course:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const openCourseDetail = (course) => {
    setSelectedCourse(course);
    setCommentText('');
    setRatingStars(0);
  };

  const completedCourses = enrolledCourses.filter(c => c.enrollment?.completed);
  const inProgressCourses = enrolledCourses.filter(c => !c.enrollment?.completed);

  return (
    <Box sx={{ p: 1 }}>
      <Typography variant="h5" sx={{ fontWeight: 900, mb: 3, color: LEARNER_COLORS.maroon }}>
        My Courses ({enrolledCourses.length})
      </Typography>

      {loading ? (
        <Typography>Loading...</Typography>
      ) : enrolledCourses.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3, bgcolor: 'rgba(255, 255, 255, 0.6)' }}>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2 }}>
            You haven't enrolled in any courses yet.
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Go to the Courses tab to browse and enroll in courses!
          </Typography>
        </Paper>
      ) : (
        <>
          {/* In Progress Courses */}
          {inProgressCourses.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Clock size={20} color="#ed6c02" /> In Progress ({inProgressCourses.length})
              </Typography>
              <Grid container spacing={3}>
                {inProgressCourses.map((course) => (
                  <Grid item xs={12} sm={6} md={4} key={course.id}>
                    <Card
                      sx={{
                        borderRadius: 3,
                        border: `2px solid ${LEARNER_COLORS.maroonLight}`,
                        bgcolor: 'rgba(255, 255, 255, 0.6)',
                        transition: 'all 0.3s',
                        '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 },
                      }}
                    >
                      <Box
                        sx={{
                          height: 140,
                          bgcolor: LEARNER_COLORS.maroon,
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
                            <ShieldCheck size={18} color={LEARNER_COLORS.maroon} />
                          )}
                        </Stack>
                        <Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>
                          {course.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                          Tutor: {course.tutor_username}
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption" sx={{ fontWeight: 700 }}>
                              Progress: {course.enrollment?.progress || 0}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={course.enrollment?.progress || 0}
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                        </Box>
                        <Stack direction="row" spacing={1}>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => openCourseDetail(course)}
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
                              bgcolor: LEARNER_COLORS.maroon,
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
            </Box>
          )}

          {/* Completed Courses */}
          {completedCourses.length > 0 && (
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircle size={20} color="#2e7d32" /> Completed ({completedCourses.length})
              </Typography>
              <Grid container spacing={3}>
                {completedCourses.map((course) => (
                  <Grid item xs={12} sm={6} md={4} key={course.id}>
                    <Card
                      sx={{
                        borderRadius: 3,
                        border: `2px solid #2e7d32`,
                        bgcolor: 'rgba(46, 125, 50, 0.05)',
                        transition: 'all 0.3s',
                        '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 },
                      }}
                    >
                      <Box
                        sx={{
                          height: 140,
                          bgcolor: '#2e7d32',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <CheckCircle size={48} color="#fff" />
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
                            <ShieldCheck size={18} color={LEARNER_COLORS.maroon} />
                          )}
                        </Stack>
                        <Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>
                          {course.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                          Tutor: {course.tutor_username}
                        </Typography>
                        <Stack direction="row" spacing={1}>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => openCourseDetail(course)}
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
                              bgcolor: '#2e7d32',
                              '&:hover': { bgcolor: '#1b5e20' },
                            }}
                          >
                            Review
                          </Button>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </>
      )}

      {/* Course Detail Dialog */}
      <Dialog open={!!selectedCourse} onClose={() => setSelectedCourse(null)} maxWidth="md" fullWidth>
        {selectedCourse && (
          <>
            <DialogTitle sx={{ fontWeight: 900, color: LEARNER_COLORS.maroon }}>
              {selectedCourse.title}
              {selectedCourse.tutor_verified && (
                <Box component="span" sx={{ ml: 1 }} title="Trusted Tutor">
                  <ShieldCheck size={22} color={LEARNER_COLORS.maroon} style={{ verticalAlign: 'middle' }} />
                </Box>
              )}
            </DialogTitle>
            <DialogContent>
              <Typography variant="body2" sx={{ mb: 2 }}>{selectedCourse.description || 'No description'}</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, mb: 2 }}>
                Tutor: {selectedCourse.tutor_username} · {selectedCourse.is_paid && selectedCourse.price ? `$${Number(selectedCourse.price)}` : 'Free'}
              </Typography>
              {selectedCourse.enrollment && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>
                    Progress: {selectedCourse.enrollment.progress}%
                  </Typography>
                  <LinearProgress variant="determinate" value={selectedCourse.enrollment.progress} sx={{ height: 10, borderRadius: 5 }} />
                  {!selectedCourse.enrollment.completed && (
                    <Button
                      variant="contained"
                      fullWidth
                      sx={{ mt: 2, bgcolor: '#2e7d32', '&:hover': { bgcolor: '#1b5e20' } }}
                      onClick={() => handleCompleteCourse(selectedCourse.id)}
                      disabled={submitting}
                    >
                      Mark as Completed (+50 XP)
                    </Button>
                  )}
                </Box>
              )}

              {/* Quizzes */}
              {selectedCourse.quizzes && selectedCourse.quizzes.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                    Quizzes ({selectedCourse.quizzes.length})
                  </Typography>
                  {selectedCourse.quizzes.map((quiz) => (
                    <Paper key={quiz.id} variant="outlined" sx={{ p: 1.5, mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <HelpCircle size={20} color={LEARNER_COLORS.maroon} />
                        <Typography variant="body2" sx={{ fontWeight: 700, flex: 1 }}>
                          {quiz.title}
                        </Typography>
                        <Chip label={`${quiz.questions?.length || 0} Questions`} size="small" />
                      </Box>
                    </Paper>
                  ))}
                </Box>
              )}

              {selectedCourse.average_rating != null && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Star size={18} color="#fbc02d" fill="#fbc02d" />
                  <Typography variant="body2">{selectedCourse.average_rating} ({selectedCourse.rating_count} ratings)</Typography>
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
                {(selectedCourse.comments || []).map((c) => (
                  <Paper key={c.id} variant="outlined" sx={{ p: 1.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>{c.username}</Typography>
                    <Typography variant="body2">{c.text}</Typography>
                  </Paper>
                ))}
              </Stack>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '0.875rem',
                  }}
                />
                <Button size="small" onClick={handleAddComment} disabled={submitting || !commentText.trim()}>Post</Button>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedCourse(null)}>Close</Button>
              <Button variant="contained" href={selectedCourse.video_url} target="_blank" rel="noopener noreferrer" startIcon={<Play size={18} />} sx={{ bgcolor: LEARNER_COLORS.maroon, '&:hover': { bgcolor: '#7a2627' } }}>
                Watch
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default MyCoursesTab;
