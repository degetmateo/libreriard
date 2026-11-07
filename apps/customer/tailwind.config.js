/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#00D9FF',
          dark: '#009BB6',
          light: '#67E8F9',
          navy: '#0F172A',
          card: '#FFFFFF',
          border: '#E2E8F0'
        }
      }
    }
  },
  plugins: []
};

