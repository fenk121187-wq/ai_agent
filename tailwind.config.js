/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        rajdhani: ['Rajdhani', 'sans-serif'],
        mono: ['"Share Tech Mono"', 'monospace'],
      },
      colors: {
        helldiver: {
          orange: '#FF5E00',
          gold: '#FFC107',
          blue: '#2196F3',
          dark: '#111111',
          cyan: '#00F0FF'
        }
      },
      backgroundImage: {
        'grid-pattern': "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgwek0zOSAzaC0zdjM2aDItMnYtMzZoMnYtMnoiIGZpbGw9IiMzMzMiIGZpbGwtb3BhY2l0eT0iLjE1IiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz48L3N2Zz4=')"
      }
    },
  },
  plugins: [],
}
