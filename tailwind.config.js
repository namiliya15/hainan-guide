/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'ui-serif', 'serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        // Основная дизайн-система «лагуна» — см. hainan-guide-design.html
        lagoon: { DEFAULT: '#0E6B64', 600: '#0A524D' },
        aqua: '#1FADA2',
        coral: { DEFAULT: '#FF7A59', 600: '#E5613F' },
        sand: { DEFAULT: '#FBF6EC', 200: '#F1E7D3', 300: '#E4D6B8' },
        ink: '#0B2422',
        night: { DEFAULT: '#071E1C', surface: '#0F332E', surface2: '#123B35' },
        mist: '#9FC7C1',
        // старые имена оставлены как алиасы, чтобы не ловить ошибки, если где-то остались ссылки
        reef: '#0E6B64',
        mango: '#f59e0b',
        hibiscus: '#FF7A59',
      },
    },
  },
  plugins: [],
};
