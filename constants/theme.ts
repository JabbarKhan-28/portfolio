
import { Platform } from 'react-native';

export const COLORS = {
  // Base Backgrounds - Ocean Blue Palette
  primaryBg: '#03045e',      // Darkest Midnight Blue
  darkBg: '#020344',         // Slightly darker for contrast
  surface: '#023e8a',        // Deep Royal Blue
  surfaceLight: '#0077b6',   // Star Command Blue
  cardBg: 'rgba(2, 62, 138, 0.95)', // Glassy Royal Blue

  // Text Colors
  textPrim: '#caf0f8',       // Lightest Cyan (White-ish)
  textSec: 'rgba(202, 240, 248, 0.7)', // Muted Light Cyan
  textHighlight: '#48cae4',  // Bright Cyan

  // Accents (Mapped from 'purple')
  purple: '#00b4d8',         // Vivid Cerulean
  darkPurple: '#0077b6',     // Secondary Accent
  border: 'rgba(144, 224, 239, 0.2)', // Pale Cyan Border

  // UI Elements
  inputBg: 'rgba(255, 255, 255, 0.1)',
  success: '#2ecc71',        // Emerald Green for success
  error: '#FF6B6B',          // Keeping distinct Red for errors
  
  // Tab Bar
  tabBarBg: '#03045e',
  tabBarActive: '#48cae4',
  tabBarInactive: 'rgba(173, 232, 244, 0.5)',
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
