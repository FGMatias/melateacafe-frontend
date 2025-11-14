/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        cafe: {
          primary: '#6f4e37',
          brown: '#8b4513',
          dark: '3e2723',
        },
        beige: {
          light: '#f5e6d3',
          cream: '#fff8e7',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
    },
  },
  plugins: [],
}

