/**
 * Design System - Whitespace Brand Colors & Styles
 * Strictly follows the design template specifications
 */

export const COLORS = {
  // Primary Colors
  primary: {
    dark: '#043873',      // Main brand color
    light: '#4F9CF9',     // Secondary brand blue
  },
  // Secondary Colors
  secondary: {
    yellow: '#FFE492',    // Accent yellow
    lightBlue: '#A7CEFC', // Accent light blue
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
  primary: 'bg-[#043873] hover:bg-[#4F9CF9] text-white font-semibold py-3 px-6 rounded-lg transition-all shadow-md hover:shadow-lg',
  secondary: 'bg-[#A7CEFC] hover:bg-opacity-90 text-[#043873] font-semibold py-3 px-6 rounded-lg transition-all',
  outlined: 'border-2 border-[#043873] text-[#043873] hover:bg-[#043873] hover:text-white font-semibold py-3 px-6 rounded-lg transition-all',
  yellow: 'bg-[#FFE492] hover:opacity-90 text-[#043873] font-semibold py-3 px-6 rounded-lg transition-all',
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
    primaryDark: 'text-[#043873]',
    primaryLight: 'text-[#4F9CF9]',
    secondaryYellow: 'text-[#FFE492]',
    secondaryLightBlue: 'text-[#A7CEFC]',
    white: 'text-white',
    black: 'text-[#212529]',
    bgPrimaryDark: 'bg-[#043873]',
    bgPrimaryLight: 'bg-[#4F9CF9]',
    bgSecondaryYellow: 'bg-[#FFE492]',
    bgSecondaryLightBlue: 'bg-[#A7CEFC]',
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
    secondaryYellow: { color: COLORS.secondary.yellow },
    secondaryLightBlue: { color: COLORS.secondary.lightBlue },
    white: { color: COLORS.neutral.white },
    black: { color: '#212529' },
    bgPrimaryDark: { backgroundColor: COLORS.primary.dark },
    bgPrimaryLight: { backgroundColor: COLORS.primary.light },
    bgSecondaryYellow: { backgroundColor: COLORS.secondary.yellow },
    bgSecondaryLightBlue: { backgroundColor: COLORS.secondary.lightBlue },
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
