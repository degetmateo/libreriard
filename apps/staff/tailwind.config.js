/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#00D9FF',
          dark: '#00B4D3',
          light: '#5CE1E6',
          bg: '#0F172A',
          surface: '#1E293B',
          card: '#162032',
          border: '#334155'
        }
      }
    }
  },
  plugins: []
};

