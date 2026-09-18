/** @type {import('tailwindcss').Config} */
// Triggering rebuild
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        'xl': '1280px',
      },
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'ui-sans-serif', 'system-ui'],
        mono: ['var(--font-geist-mono)', 'ui-monospace'],
      },
      keyframes: {
        navSlideDown: {
          '0%':   { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        menuSlideIn: {
          '0%':   { opacity: '0', transform: 'translateY(-100%)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'nav-slide-down': 'navSlideDown 0.4s ease-out both',
        'menu-slide-in':  'menuSlideIn 0.35s cubic-bezier(0.16,1,0.3,1) both',
        'fade-in':        'fadeIn 0.3s ease-out both',
      },
    },
  },

  plugins: [],
}

