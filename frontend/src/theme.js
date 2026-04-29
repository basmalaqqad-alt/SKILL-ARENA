import { createTheme } from '@mui/material';

// ── Design tokens ─────────────────────────────────────────────────
// Brand colours used sparingly as accents only
const BRAND_RED  = '#8A2D2E';
const BRAND_GOLD = '#FACA07';

// Neutrals that do the heavy lifting
const SURFACE    = '#FFFFFF';
const BG         = '#F4F2EF';   // warm off-white — never pure white
const BORDER     = 'rgba(0,0,0,0.08)';

const theme = createTheme({
  palette: {
    primary:    { main: BRAND_RED,  contrastText: '#fff' },
    secondary:  { main: BRAND_GOLD, contrastText: '#1A0A00' },
    background: { default: BG, paper: SURFACE },
    text:       { primary: '#1A1614', secondary: '#6B6560' },
    divider:    BORDER,
  },

  shape: { borderRadius: 12 },

  typography: {
    // Distinctive pairing: Syne (display) + DM Sans (body)
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    h1: { fontFamily: "'Syne', sans-serif", fontWeight: 800, letterSpacing: '-0.04em' },
    h2: { fontFamily: "'Syne', sans-serif", fontWeight: 800, letterSpacing: '-0.03em' },
    h3: { fontFamily: "'Syne', sans-serif", fontWeight: 700, letterSpacing: '-0.025em' },
    h4: { fontFamily: "'Syne', sans-serif", fontWeight: 700, letterSpacing: '-0.02em', color: '#1A1614' },
    h5: { fontFamily: "'Syne', sans-serif", fontWeight: 700, letterSpacing: '-0.015em', color: '#1A1614' },
    h6: { fontWeight: 600, color: '#1A1614', letterSpacing: '-0.01em' },
    body1: { lineHeight: 1.7 },
    body2: { lineHeight: 1.65, fontSize: '0.875rem' },
    caption: { fontSize: '0.75rem', color: '#6B6560' },
    button: { textTransform: 'none', fontWeight: 600, letterSpacing: '0.01em' },
    overline: { textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600, fontSize: '0.7rem' },
  },

  components: {
    // Global elevation override — keep shadows light
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid ' + BORDER,
          boxShadow: 'none',
        },
        elevation1: { boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
        elevation2: { boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
        elevation3: { boxShadow: '0 4px 20px rgba(0,0,0,0.09)' },
        elevation8: { boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)' },
      },
    },

    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '9px 22px',
          fontWeight: 600,
          transition: 'all 0.18s ease',
        },
        containedPrimary: {
          background: BRAND_RED,
          '&:hover': { background: '#721F20', transform: 'translateY(-1px)', boxShadow: '0 4px 12px rgba(138,45,46,0.28)' },
          '&:active': { transform: 'translateY(0)' },
        },
        containedSecondary: {
          background: BRAND_GOLD,
          color: '#1A0A00',
          '&:hover': { background: '#E5B600', transform: 'translateY(-1px)', boxShadow: '0 4px 12px rgba(250,202,7,0.35)' },
        },
        outlined: {
          borderColor: BORDER,
          color: '#1A1614',
          '&:hover': { borderColor: BRAND_RED, color: BRAND_RED, background: 'rgba(138,45,46,0.04)' },
        },
        text: {
          '&:hover': { background: 'rgba(0,0,0,0.04)' },
        },
      },
    },

    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            backgroundColor: '#FAFAF9',
            transition: 'all 0.15s ease',
            '& fieldset': { borderColor: BORDER, transition: 'border-color 0.15s' },
            '&:hover fieldset': { borderColor: 'rgba(0,0,0,0.18)' },
            '&.Mui-focused': { backgroundColor: '#fff' },
            '&.Mui-focused fieldset': { borderColor: BRAND_RED, borderWidth: '1.5px' },
          },
          '& .MuiInputLabel-root.Mui-focused': { color: BRAND_RED },
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 8, fontWeight: 600, fontSize: '0.78rem' },
        colorPrimary: { backgroundColor: 'rgba(138,45,46,0.08)', color: BRAND_RED },
        colorSecondary: { backgroundColor: 'rgba(250,202,7,0.15)', color: '#8A6000' },
      },
    },

    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          transition: 'all 0.15s ease',
          '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' },
          '&.Mui-selected': {
            backgroundColor: 'rgba(138,45,46,0.08)',
            color: BRAND_RED,
            '&:hover': { backgroundColor: 'rgba(138,45,46,0.12)' },
          },
        },
      },
    },

    MuiTabs: {
      styleOverrides: {
        indicator: { height: 2.5, borderRadius: 2, backgroundColor: BRAND_RED },
      },
    },

    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '0.875rem',
          minWidth: 'auto',
          padding: '10px 16px',
          color: '#6B6560',
          transition: 'color 0.15s',
          '&.Mui-selected': { fontWeight: 700, color: BRAND_RED },
        },
      },
    },

    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 10, fontSize: '0.875rem' },
      },
    },

    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: 18, border: 'none', boxShadow: '0 24px 64px rgba(0,0,0,0.15)' },
      },
    },

    MuiAvatar: {
      styleOverrides: {
        root: { fontWeight: 700 },
        colorDefault: { backgroundColor: 'rgba(138,45,46,0.1)', color: BRAND_RED },
      },
    },

    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 6, height: 6, backgroundColor: 'rgba(0,0,0,0.07)' },
        bar: { borderRadius: 6 },
      },
    },

    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          '&.Mui-checked': { color: BRAND_RED },
          '&.Mui-checked + .MuiSwitch-track': { backgroundColor: BRAND_RED },
        },
      },
    },

    MuiDivider: {
      styleOverrides: { root: { borderColor: BORDER } },
    },

    MuiTooltip: {
      styleOverrides: {
        tooltip: { borderRadius: 8, fontSize: '0.78rem', backgroundColor: '#1A1614' },
      },
    },
  },
});

export default theme;
