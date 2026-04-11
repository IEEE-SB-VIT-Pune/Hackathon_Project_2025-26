/**
 * Design System - Whitespace Brand Colors & Styles
 * Strictly follows the design template specifications
 */

export const COLORS = {
  // Primary Colors
  primary: {
    dark: '#0E2872',      // Main brand color
    light: '#1076C9',     // Secondary brand blue
  },
  // Secondary Colors
  secondary: {
    cyan: '#4FF3F5',      // Accent cyan
    orange: '#FBB03C',    // Accent orange
  },
  // Neutral Colors
  neutral: {
    white: '#FFFFFF',
    black: '#1C1C1C',
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },
  },
};

// Tailwind class helpers
export const BUTTON_STYLES = {
  primary: 'bg-primary-dark hover:bg-primary-light text-white font-semibold py-3 px-6 rounded-lg transition-all shadow-md hover:shadow-lg',
  secondary: 'bg-secondary-cyan hover:bg-opacity-90 text-primary-dark font-semibold py-3 px-6 rounded-lg transition-all',
  outlined: 'border-2 border-primary-dark text-primary-dark hover:bg-primary-dark hover:text-white font-semibold py-3 px-6 rounded-lg transition-all',
  orange: 'bg-secondary-orange hover:opacity-90 text-primary-dark font-semibold py-3 px-6 rounded-lg transition-all',
  small: 'py-2 px-4 text-sm',
};

export const CARD_STYLES = {
  default: 'bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6',
  dark: 'bg-primary-dark text-white rounded-xl shadow-md p-6',
  outlined: 'bg-white border-2 border-primary-dark rounded-xl p-6',
};

export const TEXT_STYLES = {
  h1: 'text-4xl font-bold text-primary-dark',
  h2: 'text-3xl font-bold text-primary-dark',
  h3: 'text-2xl font-semibold text-primary-dark',
  h4: 'text-xl font-semibold text-primary-dark',
  subtitle: 'text-lg text-gray-600',
  body: 'text-base text-gray-700',
  small: 'text-sm text-gray-600',
};

export const SPACING = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
  '3xl': '4rem',
};

/**
 * Convert emoji to icon and determine styling
 * Usage: getIconForEmoji('🚀')
 */
export const getIconName = (emoji) => {
  const emojiMap = {
    '🚀': 'rocket',
    '🏆': 'trophy',
    '✅': 'check',
    '❌': 'error',
    '💡': 'lightbulb',
    '❤️': 'heart',
    '📝': 'file',
    '👥': 'users',
    '📅': 'calendar',
    '⚙️': 'settings',
    '🔍': 'search',
    '➕': 'plus',
    '🎯': 'target',
    '⚡': 'zap',
    '🔧': 'settings',
  };
  return emojiMap[emoji] || 'circle';
};

/**
 * Get Tailwind class for brand colors
 */
export const getBrandColorClass = (colorKey) => {
  const classMap = {
    primaryDark: 'text-[#0E2872]',
    primaryLight: 'text-[#1076C9]',
    secondaryCyan: 'text-[#4FF3F5]',
    secondaryOrange: 'text-[#FBB03C]',
    white: 'text-white',
    black: 'text-[#1C1C1C]',
    bgPrimaryDark: 'bg-[#0E2872]',
    bgPrimaryLight: 'bg-[#1076C9]',
    bgSecondaryCyan: 'bg-[#4FF3F5]',
    bgSecondaryOrange: 'bg-[#FBB03C]',
  };
  return classMap[colorKey] || '';
};

/**
 * Get inline style object for brand colors
 */
export const getBrandColorStyle = (colorKey) => {
  const styleMap = {
    primaryDark: { color: COLORS.primary.dark },
    primaryLight: { color: COLORS.primary.light },
    secondaryCyan: { color: COLORS.secondary.cyan },
    secondaryOrange: { color: COLORS.secondary.orange },
    white: { color: COLORS.neutral.white },
    black: { color: COLORS.neutral.black },
    bgPrimaryDark: { backgroundColor: COLORS.primary.dark },
    bgPrimaryLight: { backgroundColor: COLORS.primary.light },
    bgSecondaryCyan: { backgroundColor: COLORS.secondary.cyan },
    bgSecondaryOrange: { backgroundColor: COLORS.secondary.orange },
  };
  return styleMap[colorKey] || {};
};

export default {
  COLORS,
  BUTTON_STYLES,
  CARD_STYLES,
  TEXT_STYLES,
  SPACING,
  getIconName,
  getBrandColorClass,
  getBrandColorStyle,
};
