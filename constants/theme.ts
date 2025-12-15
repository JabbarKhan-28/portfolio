
import { Platform } from 'react-native';

export const COLORS = {
  // Base Backgrounds
  primaryBg: '#1b1a2e',      // Main deep background
  darkBg: '#131124',         // Darker alternative for contrast
  cardBg: 'rgba(255, 255, 255, 0.05)', // Glassmorphism effect
  
  // Text Colors
  textPrim: '#FFFFFF',
  textSec: '#d1d5db',        // Light gray for subtitles/body
  textHighlight: '#cd5ff8',  // Bright Purple/Pink for emphasis
  
  // Accents
  purple: '#c770f0',         // Primary Portfolio Purple
  darkPurple: '#623686',     // Darker purple for buttons/borders
  border: 'rgba(199, 112, 240, 0.3)', // Subtle purple border

  // UI Elements
  inputBg: 'rgba(255, 255, 255, 0.1)',
  success: '#4ade80',
  error: '#f87171',
  
  // Tab Bar
  tabBarBg: '#1b1a2ea9',
  tabBarActive: '#c770f0',
  tabBarInactive: '#fff',
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
