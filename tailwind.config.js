/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#06B6D4',   // cyan-500 — bright pop
          light:   '#E0F9FD',
          dark:    '#0891B2',
        },
        indigo: {
          brand: '#6366F1',
        },
        surface: {
          dark:    '#0F1117',
          darker:  '#080B10',
        },
        /* Semantic tokens resolved by CSS vars */
        bg:       'rgb(var(--color-bg) / <alpha-value>)',
        fg:       'rgb(var(--color-fg) / <alpha-value>)',
        'fg-muted':'rgb(var(--color-fg-muted) / <alpha-value>)',
        card:     'rgb(var(--color-card) / <alpha-value>)',
        border:   'rgb(var(--color-border) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['monospace'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'card-light': '0 1px 4px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 24px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.06)',
        'glass':      '0 8px 32px rgba(0,0,0,0.16)',
        'neon':       '0 0 20px rgba(6,182,212,0.4)',
        'neon-sm':    '0 0 10px rgba(6,182,212,0.25)',
      },
      backgroundImage: {
        'gradient-hero-light': 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(6,182,212,0.12) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 80% 20%, rgba(99,102,241,0.08) 0%, transparent 60%)',
        'gradient-hero-dark':  'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(6,182,212,0.18) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 80% 20%, rgba(99,102,241,0.12) 0%, transparent 60%)',
        'gradient-accent':     'linear-gradient(135deg, #06B6D4 0%, #6366F1 100%)',
      },
      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(28px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%':   { opacity: '0', transform: 'scale(0.94)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.5' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        'fade-up':    'fade-up 0.6s cubic-bezier(0.16,1,0.3,1) forwards',
        'fade-in':    'fade-in 0.4s ease forwards',
        'scale-in':   'scale-in 0.4s cubic-bezier(0.16,1,0.3,1) forwards',
        'pulse-soft': 'pulse-soft 2.4s ease-in-out infinite',
        'shimmer':    'shimmer 2.5s linear infinite',
        'float':      'float 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
