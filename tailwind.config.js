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
    },
  },
  plugins: [],
};
