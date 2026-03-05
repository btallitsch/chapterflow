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
        // amber stays the same in both modes
        amber: {
          DEFAULT: '#d4a853',
          dark:    '#b8892e',
          light:   '#e6c77a',
        },
        // All theme-sensitive colors use CSS variables so dark/light toggle
        // works automatically without touching any component files.
        // Defined as RGB channels so opacity modifiers work:
        // e.g. bg-slate-900/80 → rgb(var(--slate-900) / 0.8)
        slate: {
          950: 'rgb(var(--slate-950) / <alpha-value>)',
          900: 'rgb(var(--slate-900) / <alpha-value>)',
          800: 'rgb(var(--slate-800) / <alpha-value>)',
          700: 'rgb(var(--slate-700) / <alpha-value>)',
          600: 'rgb(var(--slate-600) / <alpha-value>)',
          500: 'rgb(var(--slate-500) / <alpha-value>)',
          400: 'rgb(var(--slate-400) / <alpha-value>)',
        },
        cream:     'rgb(var(--cream) / <alpha-value>)',
        parchment: 'rgb(var(--parchment) / <alpha-value>)',
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
        fadeIn:    { from: { opacity: 0 },                                    to: { opacity: 1 } },
        slideUp:   { from: { opacity: 0, transform: 'translateY(12px)' },     to: { opacity: 1, transform: 'translateY(0)' } },
        slideLeft: { from: { opacity: 0, transform: 'translateX(12px)' },     to: { opacity: 1, transform: 'translateX(0)' } },
      },
    },
  },
  plugins: [],
}
