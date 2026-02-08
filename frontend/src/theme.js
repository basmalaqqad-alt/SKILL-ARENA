/**
 * SKILLARENA Theme Configuration
 * This file centralizes all brand colors and style constants.
 */

export const theme = {
  colors: {
    primary: '#8A2D2E', // Royal Maroon (Buttons, Headlines)
    secondary: '#FACA07', // Golden Yellow (Badges, Highlights, XP)
    background: '#FFF7D1', // Soft Beige (Main Page Background)
    surface: '#FFFFFF', // Pure White (Cards, Forms)
    textMain: '#1A1A1A', // Dark Gray/Black for readability
    textLight: '#6B7280', // Muted Gray for descriptions
  },
  borderRadius: {
    medium: '1rem', // Equivalent to rounded-2xl (Modern look)
    small: '0.5rem', // Equivalent to rounded-lg
  },
  shadows: {
    glass: '0 8px 32px 0 rgba(31, 38, 135, 0.07)', // Soft glassmorphism shadow
    card: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
};

export default theme;
export const arenaTheme = {
  colors: {
    maroon: '#8A2D2E',
    gold: '#FACA07',
    beige: '#FFF7D1',
  },
  radius: '12px',
};
