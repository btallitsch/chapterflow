/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"Crimson Text"', 'Georgia', 'serif'],
        mono: ['"Courier Prime"', 'Courier', 'monospace'],
      },
      colors: {
        ink: {
          50:  '#f5f0e8',
          100: '#ede4d0',
          200: '#d9c9a8',
          300: '#c5ad80',
          400: '#b19258',
          500: '#9d7830',
          600: '#7d5f25',
          700: '#5e471a',
          800: '#3e2f10',
          900: '#1f1808',
        },
        amber: {
          DEFAULT: '#d4a853',
          dark:    '#b8892e',
          light:   '#e6c77a',
        },
        slate: {
          950: '#0a0d14',
          900: '#0f1117',
          800: '#161923',
          700: '#1e2330',
          600: '#252d3d',
          500: '#2e384d',
          400: '#3d4d6a',
        },
        cream: '#f5f0e8',
        parchment: '#ede4d0',
      },
      backgroundImage: {
        'paper-texture': "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
      },
      animation: {
        'fade-in':    'fadeIn 0.3s ease-out',
        'slide-up':   'slideUp 0.3s ease-out',
        'slide-left': 'slideLeft 0.25s ease-out',
      },
      keyframes: {
        fadeIn:    { from: { opacity: 0 },                   to: { opacity: 1 } },
        slideUp:   { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        slideLeft: { from: { opacity: 0, transform: 'translateX(12px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
      },
    },
  },
  plugins: [],
}
