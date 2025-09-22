/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        reabilis: {
          gray: '#262626',
          dark: '#1A1A1A',

          // Roxo
          purple: '#9F67FF',
          'purple-hover': '#8B55E6',

          // Azul claro
          blue: '#6CA7FF',
          'blue-hover': '#5C95E6',

          // Verde
          green: '#50AC68',
          'green-hover': '#439659',

          // Laranja
          orange: '#EA7B40',
          'orange-hover': '#D66A33',

          // Vermelho
          red: '#E74C3C',
          'red-hover': '#CC3E2E',

          // Inputs
          input: '#2C2C2C',
          'input-border': '#3A3A3A',
        },
      },
    },
  },
  plugins: [],
}