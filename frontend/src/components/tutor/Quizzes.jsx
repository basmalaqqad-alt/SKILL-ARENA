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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
} from '@mui/material';
import { Plus, FileText, Trash2, Edit, CheckCircle } from 'lucide-react';
import axios from 'axios';

const TUTOR_COLORS = {
  cream: '#F8F4DF',
  maroon: '#9A2F2E',
  maroonLight: 'rgba(154, 47, 46, 0.08)',
};

const Quizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState([{ question: '', options: ['', '', '', ''], correctAnswer: 0 }]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  React.useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://127.0.0.1:8000/api/tutor/quizzes/list/', {
        headers: { 'Authorization': `Token ${token}` }
      });
      setQuizzes(response.data || []);
    } catch (err) {
      console.error('Failed to fetch quizzes:', err);
    }
  };

  const handleOpenDialog = (quiz = null) => {
    if (quiz) {
      setEditingQuiz(quiz);
      setTitle(quiz.title);
      setDescription(quiz.description);
      setQuestions(quiz.questions || [{ question: '', options: ['', '', '', ''], correctAnswer: 0 }]);
    } else {
      setEditingQuiz(null);
      setTitle('');
      setDescription('');
      setQuestions([{ question: '', options: ['', '', '', ''], correctAnswer: 0 }]);
    }
    setOpenDialog(true);
    setError('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingQuiz(null);
    setTitle('');
    setDescription('');
    setQuestions([{ question: '', options: ['', '', '', ''], correctAnswer: 0 }]);
    setError('');
  };

  const addQuestion = () => {
    setQuestions([...questions, { question: '', options: ['', '', '', ''], correctAnswer: 0 }]);
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const updateOption = (questionIndex, optionIndex, value) => {
    const updated = [...questions];
    updated[questionIndex].options[optionIndex] = value;
    setQuestions(updated);
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Please enter a quiz title');
      return;
    }

    if (questions.length === 0) {
      setError('Please add at least one question');
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        setError(`Question ${i + 1} is empty`);
        return;
      }
      if (q.options.some(opt => !opt.trim())) {
        setError(`Question ${i + 1} has empty options`);
        return;
      }
    }

    setError('');

    try {
      const token = localStorage.getItem('token');
      const data = {
        title,
        description,
        questions,
      };

      let response;
      if (editingQuiz) {
        response = await axios.put(
          `http://127.0.0.1:8000/api/tutor/quizzes/${editingQuiz.id}/`,
          data,
          { headers: { 'Authorization': `Token ${token}`, 'Content-Type': 'application/json' } }
        );
      } else {
        response = await axios.post(
          'http://127.0.0.1:8000/api/tutor/quizzes/',
          data,
          { headers: { 'Authorization': `Token ${token}`, 'Content-Type': 'application/json' } }
        );
      }

      if (response.status === 201 || response.status === 200) {
        setSuccess(editingQuiz ? 'Quiz updated successfully!' : 'Quiz created successfully!');
        handleCloseDialog();
        fetchQuizzes();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save quiz');
    }
  };

  const handleDelete = async (quizId) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://127.0.0.1:8000/api/tutor/quizzes/${quizId}/delete/`, {
        headers: { 'Authorization': `Token ${token}` }
      });
      fetchQuizzes();
      setSuccess('Quiz deleted successfully!');
    } catch (err) {
      setError('Failed to delete quiz');
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
        <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: TUTOR_COLORS.maroon }}>
          Manage Quizzes
        </Typography>
        <Button
          variant="contained"
          startIcon={<Plus size={20} />}
          onClick={() => handleOpenDialog()}
          sx={{
            bgcolor: TUTOR_COLORS.maroon,
            '&:hover': { bgcolor: '#7a2627' },
            fontWeight: 700,
          }}
        >
          CREATE QUIZ
        </Button>
      </Box>

      {quizzes.length === 0 ? (
        <Paper
          sx={{
            p: 4,
            borderRadius: 3,
            border: `2px solid ${TUTOR_COLORS.maroonLight}`,
            bgcolor: 'rgba(255, 255, 255, 0.6)',
            textAlign: 'center',
          }}
        >
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2 }}>
            No quizzes created yet. Create your first quiz for your students!
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {quizzes.map((quiz) => (
            <Grid item xs={12} md={6} key={quiz.id}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: `2px solid ${TUTOR_COLORS.maroonLight}`,
                  bgcolor: 'rgba(255, 255, 255, 0.6)',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: TUTOR_COLORS.maroon, mb: 1 }}>
                      {quiz.title}
                    </Typography>
                    {quiz.description && (
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                        {quiz.description}
                      </Typography>
                    )}
                    <Chip
                      label={`${quiz.questions?.length || 0} Questions`}
                      size="small"
                      sx={{ bgcolor: TUTOR_COLORS.maroonLight, color: TUTOR_COLORS.maroon }}
                    />
                  </Box>
                  <Box>
                    <IconButton
                      onClick={() => handleOpenDialog(quiz)}
                      sx={{ color: TUTOR_COLORS.maroon }}
                    >
                      <Edit size={20} />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(quiz.id)}
                      sx={{ color: TUTOR_COLORS.maroon }}
                    >
                      <Trash2 size={20} />
                    </IconButton>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create/Edit Quiz Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: TUTOR_COLORS.maroon }}>
          {editingQuiz ? 'Edit Quiz' : 'Create New Quiz'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              fullWidth
              label="Quiz Title"
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
              rows={2}
            />

            <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 2 }}>
              Questions
            </Typography>

            {questions.map((q, qIndex) => (
              <Paper key={qIndex} sx={{ p: 2, border: `1px solid ${TUTOR_COLORS.maroonLight}`, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    Question {qIndex + 1}
                  </Typography>
                  {questions.length > 1 && (
                    <Button
                      size="small"
                      onClick={() => removeQuestion(qIndex)}
                      sx={{ color: 'error.main' }}
                    >
                      Remove
                    </Button>
                  )}
                </Box>

                <TextField
                  fullWidth
                  label="Question"
                  value={q.question}
                  onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                  sx={{ mb: 2 }}
                />

                {q.options.map((option, optIndex) => (
                  <TextField
                    key={optIndex}
                    fullWidth
                    label={`Option ${optIndex + 1}`}
                    value={option}
                    onChange={(e) => updateOption(qIndex, optIndex, e.target.value)}
                    sx={{ mb: 1 }}
                    InputProps={{
                      endAdornment: q.correctAnswer === optIndex && (
                        <CheckCircle size={20} color="success" />
                      ),
                    }}
                  />
                ))}

                <FormControl fullWidth sx={{ mt: 1 }}>
                  <InputLabel>Correct Answer</InputLabel>
                  <Select
                    value={q.correctAnswer}
                    label="Correct Answer"
                    onChange={(e) => updateQuestion(qIndex, 'correctAnswer', e.target.value)}
                  >
                    {q.options.map((_, optIndex) => (
                      <MenuItem key={optIndex} value={optIndex}>
                        Option {optIndex + 1}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Paper>
            ))}

            <Button
              variant="outlined"
              startIcon={<Plus size={20} />}
              onClick={addQuestion}
              sx={{ mt: 1 }}
            >
              Add Question
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            sx={{
              bgcolor: TUTOR_COLORS.maroon,
              '&:hover': { bgcolor: '#7a2627' },
            }}
          >
            {editingQuiz ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Quizzes;
