import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    '../shared/src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // NJOOBA Color System: Sunset Over Dakar
      colors: {
        // Primary Palette
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
        // Supporting Palette
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

      // Typography System
      fontFamily: {
        heading: ['Space Grotesk', 'system-ui', '-apple-system', 'sans-serif'],
        body: ['DM Sans', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        display: ['Syne', 'General Sans', 'Space Grotesk', 'system-ui'],
      },

      // Type Scale
      fontSize: {
        h1: ['28px', { lineHeight: '120%', letterSpacing: '-1%', fontWeight: '700' }],
        h2: ['20px', { lineHeight: '130%', letterSpacing: '-0.5%', fontWeight: '600' }],
        h3: ['16px', { lineHeight: '140%', letterSpacing: '0%', fontWeight: '600' }],
        body: ['15px', { lineHeight: '150%', letterSpacing: '0%', fontWeight: '400' }],
        caption: ['13px', { lineHeight: '140%', letterSpacing: '0%', fontWeight: '500' }],
        micro: ['11px', { lineHeight: '130%', letterSpacing: '0.5%', fontWeight: '600' }],
      },

      // Spacing System (4px base)
      spacing: {
        'xs': '8px',
        'sm': '12px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
        '2xl': '48px',
        '3xl': '64px',
      },

      // Border Radius System
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        // Asymmetric diagonal cut (for featured cards)
        'diagonal-cut': '12px 12px 12px 0px',
      },

      // Shadow System: Warm Depth
      boxShadow: {
        'sm': '0 2px 4px rgba(224, 120, 86, 0.08)',
        'md': '0 4px 12px rgba(224, 120, 86, 0.12)',
        'lg': '0 8px 24px rgba(224, 120, 86, 0.16)',
        'glow': '0 0 16px rgba(242, 165, 65, 0.24)',
      },

      // Animation System
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-subtle': 'bounce 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'gradient-x': 'gradient-x 3s ease infinite',
        'gradient-y': 'gradient-y 3s ease infinite',
        'gradient-xy': 'gradient-xy 3s ease infinite',
      },

      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'gradient-x': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'gradient-y': {
          '0%, 100%': { backgroundPosition: '50% 0%' },
          '50%': { backgroundPosition: '50% 100%' },
        },
        'gradient-xy': {
          '0%, 100%': { backgroundPosition: '0% 0%' },
          '25%': { backgroundPosition: '100% 0%' },
          '50%': { backgroundPosition: '100% 100%' },
          '75%': { backgroundPosition: '0% 100%' },
        },
      },

      backgroundSize: {
        '200': '200% 200%',
      },

      // Custom Gradients
      backgroundImage: {
        'sunset-gradient': 'radial-gradient(circle, #E07856 0%, #F2A541 100%)',
        'night-growth': 'linear-gradient(135deg, #2D3561 0%, #1B4D3E 100%)',
        'kente-pattern': 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(224, 120, 86, 0.08) 10px, rgba(224, 120, 86, 0.08) 20px)',
      },

      // Backdrop Blur
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
      },
    },
  },
  plugins: [],
}

export default config
