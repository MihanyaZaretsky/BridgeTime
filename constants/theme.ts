/**
 * BridgeTime Theme - Modern, calm UI with bridge metaphor
 * Dark blue-green background with warm wood accents
 */

import { Platform } from 'react-native';

// River & Bridge - Shared elements
export const SharedColors = {
  river: '#2F80ED',        // Primary blue (river)
  riverDeep: '#1F5FB8',    // Deeper river blue
  riverLight: '#6FB6FF',   // Lighter river highlight
  grass: '#3FA34D',        // Primary green (riverbank)
  grassLight: '#74C57D',   // Lighter green highlight
  bridge: '#8D6E63',       // Wooden bridge
  bridgeLight: '#A98274',  // Highlighted wood
  bridgeShadow: '#5D4037', // Dark wood
  background: '#F7F9F6',   // Light paper background
  card: '#FFFFFF',         // Card surface
  gold: '#C9A227',         // Warm accent
  success: '#3FA34D',      // Correct answer
  neutral: 'rgba(23, 38, 42, 0.55)',
  border: 'rgba(23, 38, 42, 0.10)',
};

// Past (Player 1) - River blue focused
export const PastColors = {
  primary: SharedColors.river,
  secondary: SharedColors.riverLight,
  background: SharedColors.background,
  accent: SharedColors.bridge,
  text: '#17262A',
  textLight: 'rgba(23, 38, 42, 0.70)',
  glow: SharedColors.riverLight,
  border: SharedColors.border,
};

// Present (Player 2) - Grass green focused
export const PresentColors = {
  primary: SharedColors.grass,
  secondary: SharedColors.grassLight,
  background: SharedColors.background,
  accent: SharedColors.bridge,
  text: '#17262A',
  textLight: 'rgba(23, 38, 42, 0.70)',
  glow: SharedColors.grassLight,
  border: SharedColors.border,
};

// Combined theme for app-wide use
export const Colors = {
  light: {
    text: '#17262A',
    background: SharedColors.background,
    tint: SharedColors.river,
    icon: 'rgba(23, 38, 42, 0.55)',
    past: PastColors,
    present: PresentColors,
    shared: SharedColors,
  },
  dark: {
    text: '#ECEDEE',
    background: '#0D1B2A',
    tint: SharedColors.riverLight,
    icon: '#9BA1A6',
    past: {
      ...PastColors,
      background: '#0D1B2A',
      text: '#ECEDEE',
    },
    present: {
      ...PresentColors,
      background: '#0D1B2A',
      text: '#ECEDEE',
    },
    shared: SharedColors,
  },
};

export const FontFamilies = {
  regular: 'Nunito_400Regular',
  semiBold: 'Nunito_600SemiBold',
  bold: 'Nunito_700Bold',
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: FontFamilies.regular,
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: FontFamilies.regular,
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: FontFamilies.regular,
    serif: 'serif',
    rounded: FontFamilies.regular,
    mono: 'monospace',
  },
  web: {
    sans: "Nunito, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "Nunito, 'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
