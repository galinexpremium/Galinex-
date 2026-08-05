/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Playfair Display"', 'Cormorant Garamond', 'serif'],
        serif: ['Cormorant Garamond', 'serif'],
      },
      colors: {
        // Primary Background
        ivory: '#F8F5F0',
        // Secondary
        cream: '#F2ECE3',
        // Dark Brown
        walnut: {
          50: '#F7F5F2',
          100: '#E8E0D5',
          200: '#D1C5B3',
          300: '#B8A88E',
          400: '#9A8669',
          500: '#7D6B4F',
          600: '#6B5A42',
          700: '#524535',
          800: '#3B2A20',
          900: '#2A1E16',
          950: '#1A120C',
        },
        // Luxury Gold
        gold: {
          50: '#FBF8F0',
          100: '#F5EDD8',
          200: '#EBDDB5',
          300: '#D8C19A',
          400: '#CBAE5E',
          500: '#B08D57',
          600: '#9A7A4A',
          700: '#7B6635',
          800: '#5E4E29',
          900: '#4A3D20',
        },
        // Soft Gold (alias)
        softgold: '#D8C19A',
        champagne: {
          50: '#FBF8F0',
          100: '#F5EDD8',
          200: '#EBDDB5',
          300: '#D8C19A',
          400: '#CBAE5E',
          500: '#B08D57',
          600: '#9A7A4A',
          700: '#7B6635',
          800: '#5E4E29',
          900: '#4A3D20',
        },
        beige: {
          50: '#FAF8F5',
          100: '#F2EEE7',
          200: '#E5DDD0',
          300: '#D4C9B6',
          400: '#BFB29C',
          500: '#A89B83',
          600: '#8C8166',
          700: '#6B6249',
          800: '#4D4633',
          900: '#332E20',
        },
      },
      letterSpacing: {
        luxury: '0.15em',
        wider2: '0.25em',
        wider3: '0.3em',
      },
      borderRadius: {
        'hero': '28px',
        'card': '22px',
        'gallery': '22px',
        'btn': '16px',
        'input': '14px',
        'cart': '20px',
        'checkout': '20px',
      },
      animation: {
        'fade-in': 'fadeIn 1s ease-out',
        'fade-in-up': 'fadeInUp 0.8s ease-out',
        'slide-up': 'slideUp 0.8s ease-out',
        'slide-in-right': 'slideInRight 0.4s ease-out',
        'shimmer': 'shimmer 3s ease-in-out infinite',
        'scale-in': 'scaleIn 0.6s ease-out',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        fadeInUp: {
          'from': { opacity: '0', transform: 'translateY(40px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          'from': { opacity: '0', transform: 'translateY(30px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          'from': { transform: 'translateX(100%)' },
          'to': { transform: 'translateX(0)' },
        },
        shimmer: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        scaleIn: {
          'from': { opacity: '0', transform: 'scale(0.95)' },
          'to': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
      },
    },
  },
  plugins: [],
};
