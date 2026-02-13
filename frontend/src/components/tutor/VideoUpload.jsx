import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Alert,
  CircularProgress,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { Upload, Video, Trash2 } from 'lucide-react';
import axios from 'axios';

const TUTOR_COLORS = {
  cream: '#F8F4DF',
  maroon: '#9A2F2E',
  maroonLight: 'rgba(154, 47, 46, 0.08)',
};

const VideoUpload = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const [price, setPrice] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith('video/')) {
        setSelectedFile(file);
        setFileName(file.name);
        setError('');
      } else {
        setError('Please select a video file (the video is your course content)');
        setSelectedFile(null);
        setFileName('');
      }
    }
  };

  const handleUpload = async () => {
    if (!title.trim() || !selectedFile) {
      setError('Please fill in the course title and select the course video.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('video_file', selectedFile);
      formData.append('is_paid', isPaid);
      formData.append('price', isPaid && price ? parseFloat(price) : 0);

      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://127.0.0.1:8000/api/tutor/courses/',
        formData,
        {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.status === 201) {
        setSuccess('Course published successfully!');
        setTitle('');
        setDescription('');
        setSelectedFile(null);
        setFileName('');
        setIsPaid(false);
        setPrice('');
        fetchCourses();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to publish course. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://127.0.0.1:8000/api/tutor/courses/list/', {
        headers: { 'Authorization': `Token ${token}` }
      });
      setCourses(response.data || []);
      setSuccess('');
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    }
  };

  React.useEffect(() => {
    fetchCourses();
  }, []);

  const handleDelete = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://127.0.0.1:8000/api/tutor/courses/${courseId}/`, {
        headers: { 'Authorization': `Token ${token}` }
      });
      fetchCourses();
      setSuccess('Course deleted successfully!');
    } catch (err) {
      setError('Failed to delete course');
    }
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Upload Form */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              border: `2px solid ${TUTOR_COLORS.maroonLight}`,
              bgcolor: 'rgba(255, 255, 255, 0.6)',
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, color: TUTOR_COLORS.maroon, mb: 2 }}>
              Publish New Course
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
              The course is your video. Add a title, description, and upload the video file.
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="Course Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <TextField
                fullWidth
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                multiline
                rows={3}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={isPaid}
                    onChange={(e) => setIsPaid(e.target.checked)}
                    sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: TUTOR_COLORS.maroon } }}
                  />
                }
                label="Paid course"
              />
              {isPaid && (
                <TextField
                  fullWidth
                  label="Price"
                  type="number"
                  inputProps={{ min: 0, step: 0.01 }}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                />
              )}

              <Button
                variant="outlined"
                component="label"
                fullWidth
                startIcon={<Upload size={20} />}
                sx={{
                  borderStyle: 'dashed',
                  py: 1.5,
                  fontWeight: 700,
                  color: fileName ? 'success.main' : TUTOR_COLORS.maroon,
                  borderColor: fileName ? 'success.main' : TUTOR_COLORS.maroon,
                }}
              >
                {fileName ? `VIDEO: ${fileName.substring(0, 20)}...` : 'SELECT COURSE VIDEO'}
                <input
                  type="file"
                  hidden
                  onChange={handleFileChange}
                  accept="video/*"
                />
              </Button>

              <Button
                variant="contained"
                fullWidth
                onClick={handleUpload}
                disabled={loading || !title.trim() || !selectedFile}
                sx={{
                  bgcolor: TUTOR_COLORS.maroon,
                  '&:hover': { bgcolor: '#7a2627' },
                  fontWeight: 700,
                  py: 1.5,
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'PUBLISH COURSE'}
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Videos List */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              border: `2px solid ${TUTOR_COLORS.maroonLight}`,
              bgcolor: 'rgba(255, 255, 255, 0.6)',
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, color: TUTOR_COLORS.maroon, mb: 2 }}>
              My Courses ({courses.length})
            </Typography>

            {courses.length === 0 ? (
              <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                No courses yet. Publish your first course by uploading a video.
              </Typography>
            ) : (
              <List>
                {courses.map((course) => (
                  <ListItem
                    key={course.id}
                    sx={{
                      border: `1px solid ${TUTOR_COLORS.maroonLight}`,
                      borderRadius: 2,
                      mb: 1,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1 }}>
                      <Video size={24} color={TUTOR_COLORS.maroon} />
                      <ListItemText
                        primary={course.title}
                        secondary={course.description || 'No description'}
                        primaryTypographyProps={{ fontWeight: 700 }}
                      />
                    </Box>
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => handleDelete(course.id)}
                        sx={{ color: TUTOR_COLORS.maroon }}
                      >
                        <Trash2 size={20} />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default VideoUpload;
