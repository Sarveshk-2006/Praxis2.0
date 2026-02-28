/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: '#0F0E0C',
        surface: '#161513',
        border: 'rgba(255,255,255,0.07)',
        gold: '#2DD4BF',
        mint: '#818CF8',
        danger: '#F87171',
        muted: '#8A8480',
        offwhite: '#F0EDE8'
      },
      fontFamily: {
        mono: ['DM Mono', 'monospace'],
        display: ['Playfair Display', 'serif'],
        sans: ['DM Sans', 'sans-serif']
      }
    },
  },
  plugins: [],
}
