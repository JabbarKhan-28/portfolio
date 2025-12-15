
import { Platform } from 'react-native';

export const COLORS = {
  // Base Backgrounds - Blue Palette
  primaryBg: '#03045e',      // Main deep background (Midnight Blue)
  darkBg: '#023e8a',         // Darker alternative (Dark Blue)
  cardBg: 'rgba(72, 202, 228, 0.05)', // Glassmorphism effect (Cyan tint)
  
  // Text Colors
  textPrim: '#caf0f8',       // Lightest Cyan (almost white) for primary text
  textSec: '#90e0ef',        // Light Cyan for subtitles
  textHighlight: '#48cae4',  // Bright Cyan for emphasis
  
  // Accents
  purple: '#0096c7',         // Darker Cyan for better contrast
  darkPurple: '#0077b6',     // Star Command Blue (darker accent)
  border: 'rgba(72, 202, 228, 0.3)', // Subtle cyan border

  // UI Elements
  inputBg: 'rgba(255, 255, 255, 0.1)',
  success: '#4ade80',
  error: '#f87171',
  
  // Tab Bar
  tabBarBg: '#03045ec0',     // Semi-transparent Midnight Blue
  tabBarActive: '#0096c7',   // Darker Cyan match
  tabBarInactive: '#90e0ef', // Light Cyan
};

export const FONTS = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'sans-serif',
    serif: 'serif',
    mono: 'monospace',
  },
});
