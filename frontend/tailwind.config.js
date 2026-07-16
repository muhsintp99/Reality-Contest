const plugin = require('tailwindcss/plugin');

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
        lightBg: '#F7F8FA',
        lightCard: '#FFFFFF',
        lightSurface: '#FFFFFF',
        lightBorder: '#E5E7EB',

        // Brand colors
        brandPrimary: '#0F766E',
        brandSecondary: '#10B981',
        brandAccent: '#22C55E',

        // Compatibility colors
        primary: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0F766E',
          800: '#115e59',
          900: '#134e4a',
        },
        secondary: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        bgDark: '#0B1120',
        surfaceDark: '#111827',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [
    plugin(function({ addVariant }) {
      addVariant('light', '.light &')
    })
  ],
}

