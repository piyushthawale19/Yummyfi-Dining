/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          maroon: '#7A0C0C',
          burgundy: '#8B1A1A',
          cream: '#FFF8F3',
          yellow: '#F4B400',
          mustard: '#DFA200',
          white: '#FFFFFF',
          offWhite: '#F5F5F5',
          darkRed: '#4E0A0A',
          goldGlow: 'rgba(244,180,0,0.4)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'], 
      }
    },
  },
  plugins: [],
};
