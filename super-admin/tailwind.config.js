/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdfc',
          100: '#ccfbf7',
          200: '#99f6ef',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#00d2c4',
          600: '#00b3a6',
          700: '#009087',
          800: '#007069',
          900: '#00544f',
        },
        orange: {
          50: '#f0fdfc',
          100: '#ccfbf7',
          200: '#99f6ef',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#00d2c4',
          600: '#00b3a6',
          700: '#009087',
          800: '#007069',
          900: '#00544f',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
