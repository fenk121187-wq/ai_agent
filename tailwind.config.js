/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        helldiver: {
          orange: '#FF5E00',
          gold: '#FFC107',
          blue: '#2196F3',
          dark: '#111111'
        }
      }
    },
  },
  plugins: [],
}
