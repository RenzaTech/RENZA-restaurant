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
        display: ['var(--font-display)', 'serif'],
        sans: ['var(--font-sans)', 'sans-serif'],
        inter: ['var(--font-sans)', 'sans-serif'],
      },
      colors: {
        renza: {
          ink: '#0B0B0F',
          charcoal: '#16161C',
          cream: '#FAF7F2',
          gold: '#C9A227',
          ember: '#00d2c4',
          sage: '#4F7A5B',
        },
      },
      boxShadow: {
        glow: '0 0 40px rgba(201, 162, 39, 0.16)',
        card: '0 8px 24px rgba(11, 11, 15, 0.08), 0 2px 6px rgba(11, 11, 15, 0.05)',
      },
      borderRadius: {
        xl2: '1.75rem',
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite linear',
        'fade-up': 'fade-up 0.6s ease-out both',
        'scale-in': 'scale-in 0.4s ease-out both',
        'float-slow': 'float-slow 6s ease-in-out infinite',
        'sheet-up': 'sheet-up 0.4s cubic-bezier(0.32, 0.72, 0, 1) both',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'sheet-up': {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
