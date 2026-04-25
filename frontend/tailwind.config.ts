import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Map to CSS custom properties for full token system
        canvas:  'var(--bg-canvas)',
        base:    'var(--bg-base)',
        elevated:'var(--bg-elevated)',
        overlay: 'var(--bg-overlay)',
        subtle:  'var(--bg-subtle)',

        primary: {
          DEFAULT: 'var(--accent)',
          hover:   'var(--accent-hover)',
          subtle:  'var(--accent-subtle)',
        },
        secondary: {
          DEFAULT: 'var(--success)',
          subtle:  'var(--success-subtle)',
        },
        accent: {
          DEFAULT: 'var(--danger)',
          subtle:  'var(--danger-subtle)',
        },
        warning: {
          DEFAULT: 'var(--warning)',
          subtle:  'var(--warning-subtle)',
        },
        background: {
          DEFAULT: '#F4F6F9',
          dark:    '#0C0E12',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          dark:    'var(--bg-base)',
        },
      },
      fontFamily: {
        sans:    ['Inter', 'var(--font-inter)', '-apple-system', 'sans-serif'],
        display: ['Satoshi', 'Inter', 'var(--font-inter)', 'system-ui'],
        mono:    ['var(--font-mono)', 'JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        'xs':  ['0.70rem',  { lineHeight: '1.4', letterSpacing: '0.01em' }],
        'sm':  ['0.813rem', { lineHeight: '1.5', letterSpacing: '0.008em' }],
        'base':['0.938rem', { lineHeight: '1.6', letterSpacing: '0em' }],
        'md':  ['1.063rem', { lineHeight: '1.55', letterSpacing: '-0.005em' }],
        'lg':  ['1.25rem',  { lineHeight: '1.45', letterSpacing: '-0.01em' }],
        'xl':  ['1.5rem',   { lineHeight: '1.35', letterSpacing: '-0.015em' }],
        '2xl': ['1.875rem', { lineHeight: '1.25', letterSpacing: '-0.02em' }],
        '3xl': ['2.25rem',  { lineHeight: '1.15', letterSpacing: '-0.025em' }],
        '4xl': ['2.875rem', { lineHeight: '1.1',  letterSpacing: '-0.03em' }],
        '5xl': ['3.75rem',  { lineHeight: '1.05', letterSpacing: '-0.035em' }],
      },
      spacing: {
        '1':  '4px',
        '2':  '8px',
        '3':  '12px',
        '4':  '16px',
        '5':  '20px',
        '6':  '24px',
        '8':  '32px',
        '10': '40px',
        '12': '48px',
        '16': '64px',
        '20': '80px',
        '4.5': '18px',
        '18':  '72px',
      },
      borderRadius: {
        sm:   '4px',
        md:   '8px',
        lg:   '12px',
        xl:   '16px',
        '2xl':'24px',
        full: '9999px',
        xs:   '4px',
      },
      boxShadow: {
        sm:           'var(--shadow-sm)',
        md:           'var(--shadow-md)',
        lg:           'var(--shadow-lg)',
        glow:         'var(--shadow-glow)',
        'glow-primary': '0 0 24px rgba(124,92,255,0.25)',
        'glow-secondary':'0 0 24px rgba(16,201,143,0.2)',
        'card':         '0 2px 8px rgba(0,0,0,0.25)',
      },
      animation: {
        'shimmer':       'shimmer 1.8s infinite',
        'gradient-shift':'gradientShift 8s ease infinite',
        'pulse-glow':    'pulseGlow 2.5s ease-in-out infinite',
        'float':         'float 6s ease-in-out infinite',
        'spin-slow':     'spin 8s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%':      { backgroundPosition: '100% 50%' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(124,92,255,0.2)' },
          '50%':      { boxShadow: '0 0 40px rgba(124,92,255,0.5)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
      },
      backgroundImage: {
        'gradient-radial':  'radial-gradient(var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(135deg, #7C5CFF, #A78BFA)',
        'gradient-success': 'linear-gradient(135deg, #10C98F, #06B6D4)',
      },
      transitionTimingFunction: {
        'out-expo':  'cubic-bezier(0.16,1,0.3,1)',
        'spring':    'cubic-bezier(0.34,1.56,0.64,1)',
        'in-out':    'cubic-bezier(0.45,0,0.55,1)',
      },
    },
  },
  plugins: [],
}

export default config
