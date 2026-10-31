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
        sans: ['var(--font-sans)', 'Aclonica', 'Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['var(--font-display)', 'Aclonica', 'Plus Jakarta Sans', 'sans-serif'],
        h: ['var(--font-h)', 'Aclonica', 'Plus Jakarta Sans', 'sans-serif'],
        body: ['var(--font-body)', 'Aclonica', 'Plus Jakarta Sans', 'sans-serif'],
        serif: ['var(--font-sans)', 'Aclonica', 'Plus Jakarta Sans', 'sans-serif'],
        aclonica: ['Aclonica', 'sans-serif'],
        ancizar: ['var(--font-ancizar)', "'UNAL Ancizar Serif'", "'Ancizar Serif'", 'Georgia', 'serif'],
        jakarta: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      colors: {
        brand: {
          DEFAULT: '#FFB800',
          hover: '#E5A500',
          light: '#FFF8E1',
          tint: '#FEF3C7',
          dark: '#8B4513',
        },
        coffee: {
          DEFAULT: '#8B4513',
          dark: '#582914',
          light: '#FAF0E6',
        },
        ink: {
          DEFAULT: '#101B35',
          secondary: '#718096',
          muted: '#718096',
          light: '#94A3B8',
        },
        canvas: '#FFFCF7',
        surface: '#FFFFFF',
      },
    },
  },
  plugins: [],
};
