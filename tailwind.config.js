/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        remax: {
          blue: '#002B49',
          red: '#DC1C2D',
          dark: '#0B131F',
          card: '#131F2E',
          accent: '#0088FF',
          gold: '#E5A93C',
          light: '#F8FAFC'
        }
      }
    },
  },
  plugins: [],
}
