/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // or 'media' for system preference
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter var', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'gradient': 'gradient 8s linear infinite',
      },
      keyframes: {
        gradient: {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center',
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center',
          },
        },
      },
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        background: {
          light: '#f8f7f4', // off-white
          dark: '#1c1917',  // dark stone/gray
        }
      },
      backgroundColor: {
        primary: 'var(--color-background)',
        accent: 'var(--color-accent)',
        'accent-hover': 'var(--color-accent-hover)',
        secondary: 'var(--color-button-secondary)',
        'secondary-hover': 'var(--color-button-secondary-hover)',
      },
      textColor: {
        primary: 'var(--color-text-primary)',
        secondary: 'var(--color-text-secondary)',
        accent: 'var(--color-accent)',
      },
    },
  },
  plugins: [],
};