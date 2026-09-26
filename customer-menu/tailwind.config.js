/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './utils/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'Cormorant Garamond', 'Georgia', 'serif'],
        h: ['var(--font-h)', 'Cinzel', 'serif'],
        sans: ['var(--font-sans)', 'Josefin Sans', 'sans-serif'],
        body: ['var(--font-body)', 'Poppins', 'sans-serif'],
      },
      colors: {
        gold: {
          DEFAULT: '#d4b15d',
          lt: '#f5d98f',
          dk: '#9a7428',
        },
        navy: {
          dark: '#06090d',
          mid: '#0d1219',
          card: '#111821',
          soft: '#1a2029',
        },
        cream: '#f6f2eb',
      },
    },
  },
  plugins: [],
};
