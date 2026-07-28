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
        lightBg: '#EDF6E5',
        lightCard: '#F6FCF0',
        lightSurface: '#E2F1D5',
        lightBorder: '#C4E2A8',

        // Brand colors (Custom Light Palette: #499A13, #BBDC12, #8ECA3C, #276F27)
        brandPrimary: '#499A13',
        brandSecondary: '#8ECA3C',
        brandAccent: '#BBDC12',
        brandDark: '#276F27',

        // Compatibility colors mapped to the green palette
        primary: {
          50: '#f4f9ee',
          100: '#e5f3d7',
          200: '#cde7b5',
          300: '#abd989',
          400: '#8ECA3C',
          500: '#68b51d',
          600: '#499A13',
          700: '#397c11',
          800: '#276F27',
          900: '#1e561e',
        },
        secondary: {
          50: '#f9fde6',
          100: '#f1fbc2',
          200: '#e4f790',
          300: '#d1f057',
          400: '#BBDC12',
          500: '#8ECA3C',
          600: '#7f9a07',
          700: '#499A13',
          800: '#276F27',
          900: '#1a4a1a',
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

