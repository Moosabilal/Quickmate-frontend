/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable dark mode with class strategy
  theme: {
    extend: {
      colors: {
        primary: '#1D4ED8', // Custom blue for light mode
        secondary: '#15803D', // Custom green for light mode
      },
    },
  },
  plugins: [],
}