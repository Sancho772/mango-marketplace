/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#006948',
          hover: '#00855d',
          fixed: '#85f8c4',
          container: '#00855d',
          'on-container': '#f5fff7',
        },
        secondary: {
          DEFAULT: '#fea619',
          container: '#fea619',
          amber: '#f59e0b',
        },
        surface: {
          DEFAULT: '#faf8ff',
          lowest: '#ffffff',
          low: '#f2f3ff',
          container: '#eaedff',
          high: '#e2e7ff',
        },
        'on-surface': '#131b2e',
        'on-surface-variant': '#3d4a42',
        outline: '#6d7a72',
        'outline-variant': '#bccac0',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
