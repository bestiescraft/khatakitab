/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          green: '#1a7a3c',
          greenLight: '#e8f5e9',
          red: '#c62828',
          redLight: '#ffebee',
          blue: '#1976d2',
          blueLight: '#e3f2fd',
        },
      },
      boxShadow: {
        card: '0 2px 8px rgba(0,0,0,0.06)',
        soft: '0 1px 3px rgba(0,0,0,0.08)',
      },
      fontSize: {
        'xs':   ['0.95rem',  { lineHeight: '1.6' }],
        'sm':   ['1.1rem',   { lineHeight: '1.7' }],
        'base': ['1.25rem',  { lineHeight: '1.8' }],
        'lg':   ['1.45rem',  { lineHeight: '1.8' }],
        'xl':   ['1.65rem',  { lineHeight: '1.7' }],
        '2xl':  ['1.9rem',   { lineHeight: '1.5' }],
        '3xl':  ['2.25rem',  { lineHeight: '1.4' }],
        '4xl':  ['2.75rem',  { lineHeight: '1.3' }],
      },
    },
  },
  plugins: [],
};