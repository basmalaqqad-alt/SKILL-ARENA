import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  ThemeProvider, 
  createTheme,
  InputAdornment,
  CssBaseline,
  Container,
  Fade,
  CircularProgress
} from '@mui/material';
import { Mail, Lock, Sparkles, Trophy, ArrowRight, Gamepad2 } from 'lucide-react';

/**
 * SkillArena - النسخة العصرية فائقة التطور (Ultra Modern UI/UX)
 * تصميم: عسومه (الذهب والمارون الملكي)
 * التقنيات: MUI + Glassmorphism + Modern Motion
 */

const theme = createTheme({
  palette: {
    primary: {
      main: '#8A2D2E', // المارون الملكي
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#FACA07', // الأصفر الذهبي
    },
    background: {
      default: '#FFF7D1',
    }
  },
  shape: {
    borderRadius: 24,
  },
  typography: {
    fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
    h1: {
      fontWeight: 900,
      letterSpacing: '-0.05em',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 800,
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 12px 20px -10px rgba(138, 45, 46, 0.5)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 1)',
            },
            '&.Mui-focused': {
              backgroundColor: 'rgba(255, 255, 255, 1)',
              boxShadow: '0 0 0 4px rgba(250, 202, 7, 0.2)',
            }
          }
        }
      }
    }
  }
});

function App() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setLoading(true);
    // محاكاة عملية دخول
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      
      <Box 
        sx={{ 
          minHeight: '100vh',
          background: 'radial-gradient(circle at top right, #FFE5B4 0%, #FFF7D1 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          py: 4
        }}
      >
        {/* الدوائر التفاعلية الخلفية (Abstract Shapes) */}
        <Box sx={{ 
          position: 'absolute', top: '-10%', right: '-5%', width: '40vw', height: '40vw', 
          borderRadius: '50%', background: 'linear-gradient(135deg, rgba(250, 202, 7, 0.4) 0%, rgba(250, 202, 7, 0) 70%)', 
          filter: 'blur(100px)', zIndex: 0 
        }} />
        <Box sx={{ 
          position: 'absolute', bottom: '-10%', left: '-5%', width: '50vw', height: '50vw', 
          borderRadius: '50%', background: 'linear-gradient(135deg, rgba(138, 45, 46, 0.2) 0%, rgba(138, 45, 46, 0) 70%)', 
          filter: 'blur(120px)', zIndex: 0 
        }} />

        <Container maxWidth="sm" sx={{ zIndex: 1, position: 'relative' }}>
          <Fade in={true} timeout={1000}>
            <Box>
              {/* القسم العلوي: الهوية البصرية */}
              <Box sx={{mb: 6 }}>
                    <Box 
      component="img"
      src={`/logo.png?v=${new Date().getTime()}`}
      alt="SkillArena Logo"
      sx={{ 
        height: { xs: 100, md: 140 },
        width: 'auto',
        display: 'block', // جعل الصورة كعنصر مستقل
        mx: 'auto', // توسيط الصورة تلقائياً من اليمين واليسار
        mb: 2,
        filter: 'drop-shadow(0px 12px 20px rgba(138, 45, 46, 0.3))',
        transition: 'transform 0.3s ease',
        '&:hover': { transform: 'scale(1.05)' }
      }}
      onError={(e) => {
        console.error("اللوغو مش موجود في مجلد public باسم logo.png");
      }}
    />
                
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
                  <Sparkles size={18} color="#FACA07" />
                  <Typography variant="h6" sx={{ color: '#8A2D2E', fontWeight: 700, letterSpacing: 4, textTransform: 'uppercase', fontSize: '0.8rem' }}>
                    Play • Learn • Earn
                  </Typography>
                  <Sparkles size={18} color="#FACA07" />
                </Box>
              </Box>

              {/* بطاقة تسجيل الدخول (The Modern Card) */}
              <Paper 
                elevation={0}
                sx={{ 
                  p: { xs: 4, md: 6 }, 
                  borderRadius: 10,
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.5)',
                  boxShadow: '0 40px 80px -20px rgba(138, 45, 46, 0.15)',
                }}
              >
                <Box sx={{ display: 'flex', mb: 5, p: 0.5, bgcolor: 'rgba(138, 45, 46, 0.05)', borderRadius: 5 }}>
                  <Button fullWidth variant="contained" sx={{ borderRadius: 4, py: 1.5, fontSize: '1rem' }}>
                    Login
                  </Button>
                  <Button fullWidth variant="text" sx={{ borderRadius: 4, py: 1.5, fontSize: '1rem', color: '#8A2D2E' }}>
                    Register
                  </Button>
                </Box>

                <form onSubmit={handleSubmit}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
                    <TextField 
                      fullWidth
                      label="Email Address"
                      variant="outlined"
                      placeholder="hero@skillarena.com"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Mail size={20} color="#8A2D2E" style={{ opacity: 0.7 }} />
                          </InputAdornment>
                        ),
                        sx: { borderRadius: 4, bgcolor: 'rgba(255,255,255,0.5)' }
                      }}
                    />

                    <TextField 
                      fullWidth
                      label="Password"
                      type="password"
                      placeholder="••••••••"
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock size={20} color="#8A2D2E" style={{ opacity: 0.7 }} />
                          </InputAdornment>
                        ),
                        sx: { borderRadius: 4, bgcolor: 'rgba(255,255,255,0.5)' }
                      }}
                    />

                    <Box sx={{ textAlign: 'right', mt: -1.5 }}>
                      <Typography variant="body2" sx={{ color: '#8A2D2E', fontWeight: 700, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
                        Forgot Password?
                      </Typography>
                    </Box>

                    <Button 
                      disabled={loading}
                      type="submit"
                      variant="contained"
                      size="large"
                      sx={{ 
                        py: 2.2, 
                        fontSize: '1.2rem', 
                        bgcolor: '#8A2D2E',
                        borderRadius: 4,
                        position: 'relative',
                        '&:hover': { bgcolor: '#702425' }
                      }}
                    >
                      {loading ? <CircularProgress size={24} color="inherit" /> : (
                        <>
                          Enter the Arena
                          <ArrowRight style={{ marginLeft: '10px' }} size={20} />
                        </>
                      )}
                    </Button>
                  </Box>
                </form>
              </Paper>

              {/* تذييل الصفحة (The Modern Footer) */}
              <Box sx={{ mt: 6, textAlign: 'center' }}>
                <Box 
                  sx={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: 2, 
                    bgcolor: 'rgba(250, 202, 7, 0.2)', 
                    px: 3, py: 1.5, 
                    borderRadius: 8,
                    border: '1px solid rgba(250, 202, 7, 0.3)'
                  }}
                >
                  <Trophy color="#8A2D2E" size={24} />
                  <Typography variant="body2" sx={{ color: '#8A2D2E', fontWeight: 800 }}>
                    JOIN 12,450+ WARRIORS ONLINE
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Fade>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;