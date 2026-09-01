/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        antarctic: {
          dark: '#0B132B',
          card: '#1C2541',
          border: '#2A365C',
          cyan: '#00F5D4',
          blue: '#3A86FF',
          ice: '#E0FBFC'
        },
        status: {
          green: '#10B981',
          yellow: '#F59E0B',
          red: '#EF4444',
          blue: '#3B82F6'
        }
      },
      fontFamily: {
        heading: ['"Rajdhani"', 'sans-serif'],
        sans: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      }
    },
  },
  plugins: [],
}
