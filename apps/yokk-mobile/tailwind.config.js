/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{rs,html,css}",
    "./dist/**/*.html",
  ],
  safelist: [
    // Critical overlay/drawer classes Tailwind can't extract from Rust format! macros
    'fixed', 'absolute', 'relative', 'sticky',
    'inset-0', 'top-0', 'left-0', 'right-0', 'bottom-0',
    'z-10', 'z-20', 'z-30', 'z-40', 'z-50',
    'z-[100]', 'z-[9999]',
    'translate-x-0', '-translate-x-full',
    'backdrop-blur-sm', 'backdrop-blur-xl',
    'bg-black/60', 'bg-black/5', 'bg-white/5', 'bg-black/10', 'bg-white/10',
    'mt-auto',
    'h-[100dvh]', 'h-[90vh]', 'h-[calc(100vh-5rem)]',
    'rounded-t-3xl',
    'shadow-2xl',
    'animate-pulse',
    'flex-1', 'flex-col', 'flex-row',
    'overflow-hidden', 'overflow-y-auto',
    'min-h-screen', 'min-h-[50vh]', 'min-h-[140px]',
    'max-w-[1920px]',
    'w-64', 'w-72',
    'border-dashed',
    'border-2',
    'resize-none',
    'outline-none',
    // Responsive variants
    'md:flex-row', 'md:w-1/3',
    'sm:px-4', 'sm:px-6', 'sm:p-6', 'sm:p-8',
    'sm:text-sm', 'sm:text-xl',
    'sm:flex-none',
    'lg:hidden', 'lg:sticky', 'lg:h-[calc(100vh-5rem)]', 'lg:w-72', 'lg:translate-x-0', 'lg:pt-8', 'lg:transition-none', 'lg:pb-8',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--bg-background)',
        surface: 'var(--bg-surface)',
        primary: 'var(--text-primary)',
        secondary: 'var(--text-secondary)',
        divider: 'var(--border-divider)',
        terracotta: {
          primary: '#E07856',
          DEFAULT: '#E07856',
        },
        indigo: {
          deep: '#2D3561',
          DEFAULT: '#2D3561',
        },
        savanna: {
          gold: '#F2A541',
          DEFAULT: '#F2A541',
        },
        forest: {
          green: '#1B4D3E',
          DEFAULT: '#1B4D3E',
        },
        sand: {
          neutral: '#E8D7C3',
          DEFAULT: '#E8D7C3',
        },
        charcoal: {
          base: '#1F1F1F',
          DEFAULT: '#1F1F1F',
        },
        clay: {
          white: '#FAF8F5',
          DEFAULT: '#FAF8F5',
        },
        rust: {
          accent: '#B8563E',
          DEFAULT: '#B8563E',
        },
      },
      fontFamily: {
        heading: ['Space Grotesk', 'system-ui', '-apple-system', 'sans-serif'],
        body: ['DM Sans', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        display: ['Syne', 'General Sans', 'Space Grotesk', 'system-ui'],
      },
      fontSize: {
        h1: ['28px', { lineHeight: '120%', letterSpacing: '-1%', fontWeight: '700' }],
        h2: ['20px', { lineHeight: '130%', letterSpacing: '-0.5%', fontWeight: '600' }],
        h3: ['16px', { lineHeight: '140%', letterSpacing: '0%', fontWeight: '600' }],
        body: ['15px', { lineHeight: '150%', letterSpacing: '0%', fontWeight: '400' }],
        caption: ['13px', { lineHeight: '140%', letterSpacing: '0%', fontWeight: '500' }],
        micro: ['11px', { lineHeight: '130%', letterSpacing: '0.5%', fontWeight: '600' }],
      },
      spacing: {
        'xs': '8px',
        'sm': '12px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
        '2xl': '48px',
        '3xl': '64px',
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        'diagonal-cut': '12px 12px 12px 0px',
      },
      boxShadow: {
        'sm': '0 2px 4px rgba(224, 120, 86, 0.08)',
        'md': '0 4px 12px rgba(224, 120, 86, 0.12)',
        'lg': '0 8px 24px rgba(224, 120, 86, 0.16)',
        'glow': '0 0 16px rgba(242, 165, 65, 0.24)',
      },
      backgroundImage: {
        'sunset-gradient': 'radial-gradient(circle, #E07856 0%, #F2A541 100%)',
        'night-growth': 'linear-gradient(135deg, #2D3561 0%, #1B4D3E 100%)',
        'kente-pattern': 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(224, 120, 86, 0.08) 10px, rgba(224, 120, 86, 0.08) 20px)',
      },
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
      },
    },
  },
  plugins: [],
}

