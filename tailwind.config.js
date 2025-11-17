const withMT = require("@material-tailwind/react/utils/withMT");

module.exports = withMT({
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        customBlue: '#3DA5F4',
        customRed: {
          100: '#fc563b'
        },
        customBlack: {
          100: '#474747'
        },
        customGray: {
          100: '#9b9b9b',
          200: '#f8f9fa',
          300: '#dee2e6',
          400: '#545a5c',
          500: '#989898',
          blueGray: '#6691cc'
        },
        customGreen: {
          100: '#68BAA8',
          200: '#0acf97'
        },
        customOrange: {
          300: '#FDB775',
          400: '#ee963c'
        },
        customYellow: {
          100: '#FFC107'
        }
      },
    },
  },
  plugins: [],
});
