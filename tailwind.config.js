/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        reef: '#0f766e',
        mango: '#f59e0b',
        hibiscus: '#be185d',
      },
    },
  },
  plugins: [],
};
