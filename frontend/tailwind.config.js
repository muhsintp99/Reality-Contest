module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Dark theme tokens
        darkBg: '#0B1120',
        darkCard: '#111827',
        darkSurface: '#1F2937',
        darkBorder: '#334155',

        // Light theme tokens
        lightBg: '#F8FAFC',
        lightCard: '#FFFFFF',
        lightSurface: '#F1F5F9',
        lightBorder: '#E2E8F0',

        // Brand colors
        brandPrimary: '#7C3AED',
        brandSecondary: '#06B6D4',
        brandAccent: '#F59E0B',

        // Compatibility colors
        primary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        secondary: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
        bgDark: '#0B1120',
        surfaceDark: '#111827',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
