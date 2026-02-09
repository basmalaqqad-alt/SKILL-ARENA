import { createTheme } from '@mui/material';

/**
 * SKILLARENA Official MUI Theme
 * This configuration integrates brand colors directly into the MUI system.
 */
const theme = createTheme({
  palette: {
    primary: {
      main: '#8A2D2E', // Royal Maroon
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#FACA07', // Golden Yellow
      contrastText: '#8A2D2E',
    },
    background: {
      default: '#FFF7D1', // Soft Beige
      paper: '#FFFFFF', // White surfaces for cards
    },
    text: {
      primary: '#1A1A1A', // Dark gray for better readability
      secondary: '#6B7280', // Muted gray
    },
  },
  shape: {
    borderRadius: 12, // Modern rounded corners (12px)
  },
  typography: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    h4: { fontWeight: 900, color: '#8A2D2E' },
    h5: { fontWeight: 900, color: '#8A2D2E' },
    h6: { fontWeight: 800, color: '#8A2D2E' },
    subtitle2: { fontWeight: 900, letterSpacing: 2 },
    button: { textTransform: 'none', fontWeight: 700 }, // Professional look without ALL CAPS
  },
  components: {
    // Customizing MUI components globally
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Specific button radius
          padding: '10px 20px',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', // Subtle shadow from your first code
        },
      },
    },
  },
});

export default theme;
