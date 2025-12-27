
import { Platform } from 'react-native';

export const COLORS = {
  // Base Backgrounds - Royal Imperial Palette 
  primaryBg: '#310055',      // Darkest Purple
  darkBg: '#240046',         // Deepest Shadow (Manual darker shade for contrast)
  surface: '#3c0663',        // Deep Purple Surface
  surfaceLight: '#4a0a77',   // Lighter Surface
  cardBg: 'rgba(60, 6, 99, 0.95)', // Glassy Deep Purple

  // Text Colors
  textPrim: '#ffffff',       // Pure White for max contrast
  textSec: '#d283ff',        // Pale Violet
  textHighlight: '#dc97ff',  // Brightest Neon Violet

  // Accents
  purple: '#8b2fc9',         // Vivid Violet (Primary Brand)
  darkPurple: '#6818a5',     // Secondary Accent
  border: 'rgba(171, 81, 227, 0.3)', // #ab51e3 with opacity

  // UI Elements
  inputBg: 'rgba(255, 255, 255, 0.1)',
  success: '#2ecc71',        // Emerald Green
  error: '#ff4757',          // Bright Red
  
  // Tab Bar
  tabBarBg: '#310055',
  tabBarActive: '#dc97ff',
  tabBarInactive: 'rgba(210, 131, 255, 0.5)',
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
