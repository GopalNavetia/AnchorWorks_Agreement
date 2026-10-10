/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: { ink: '#11100e', paper: '#f4f0e9', gold: '#c9a96e', mist: '#d9d2c6' },
      fontFamily: { sans: ['DM Sans', 'sans-serif'], display: ['Cormorant Garamond', 'serif'] }
    }
  },
  plugins: []
}
