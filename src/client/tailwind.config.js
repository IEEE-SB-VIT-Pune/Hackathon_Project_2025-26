/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
    },
    extend: {
      colors: {
        // Primary Colors
        primary: {
          dark: '#0E2872',
          light: '#1076C9',
        },
        // Secondary Colors
        secondary: {
          cyan: '#4FF3F5',
          orange: '#FBB03C',
        },
        // Neutral Colors
        neutral: {
          white: '#FFFFFF',
          black: '#1C1C1C',
        },
      },
      spacing: {
        'gutter': '1rem',
        'gutter-lg': '2rem',
      },
    },
  },
  plugins: [],
}