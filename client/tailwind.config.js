/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#0F0D0B',
          900: '#171310',
          800: '#221C17',
          700: '#332A22',
        },
        paper: '#F5EFE4',
        saffron: {
          400: '#F5B841',
          500: '#F0A202',
          600: '#C97F00',
        },
        teal: {
          500: '#0F5257',
          600: '#0B3F43',
        },
        chili: {
          500: '#C1272D',
          600: '#9E1F24',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        ticket: '4px',
      },
    },
  },
  plugins: [],
};
