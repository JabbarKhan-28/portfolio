
import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Guideline sizes are based on standard mobile device (e.g. iPhone X/Android Pixel)
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

/**
 * Scales a dimension based on the screen width.
 * Useful for margins, paddings, and widths.
 */
export const scale = (size: number) => (SCREEN_WIDTH / guidelineBaseWidth) * size;

/**
 * Scales a dimension based on the screen height.
 * Useful for heights.
 */
export const verticalScale = (size: number) => (SCREEN_HEIGHT / guidelineBaseHeight) * size;

/**
 * Moderate scaling for fonts and icons. 
 * The factor (default 0.5) controls how aggressively the size increases with screen width.
 */
export const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

export const LAYOUT = {
  window: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  isSmallDevice: SCREEN_WIDTH < 375,
  isTablet: SCREEN_WIDTH >= 768 && SCREEN_WIDTH < 1024,
  isDesktop: SCREEN_WIDTH >= 1024,
  
  // Standard paddings
  padding: {
    xs: 8,
    sm: 12,
    md: 20,
    lg: 32,
    xl: 48
  },
  
  // Standard BorderRadius
  borderRadius: {
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32
  }
};
