/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      borderRadius: {
        'squircle-xs': '8px',
        'squircle-sm': '12px',
        'squircle': '16px',
        'squircle-md': '18px',
        'squircle-lg': '22px',
        'squircle-xl': '26px',
        'squircle-2xl': '32px',
        'squircle-3xl': '38px',
        '3xl': '24px',
        '4xl': '32px',
        'pill': '9999px',
      },
      boxShadow: {
        'tactile': '0 8px 24px -6px rgba(41, 37, 36, 0.04), 0 2px 6px -1px rgba(41, 37, 36, 0.02)',
        'tactile-md': '0 12px 32px -8px rgba(41, 37, 36, 0.07), 0 4px 12px -2px rgba(41, 37, 36, 0.04)',
        'tactile-lg': '0 20px 48px -12px rgba(41, 37, 36, 0.09), 0 6px 18px -3px rgba(41, 37, 36, 0.05)',
        'tactile-hover': '0 22px 50px -10px rgba(41, 37, 36, 0.11), 0 8px 20px -4px rgba(41, 37, 36, 0.06)',
        'glow-lime': '0 0 16px -2px rgba(132, 204, 22, 0.35)',
        'glow-emerald': '0 0 16px -2px rgba(16, 185, 129, 0.35)',
      },
      colors: {
        warm: {
          50: '#FAF8F5',
          100: '#F5F2EB', // Soft, warm neutral background
          200: '#EAE5DB', // Borders & dividers
          300: '#DDD6C8', // Hover borders
          400: '#C2B8A3',
          500: '#9A8E77',
          600: '#756A54',
          700: '#574E3C',
          800: '#3A3326',
          900: '#242017',
        },
        charcoal: {
          950: '#11100F',
          900: '#1C1917', // Main text & dark accents
          850: '#23201D',
          800: '#292524', // Subtle dark card
          700: '#44403C', // Body secondary
          600: '#57534E',
          500: '#78716C', // Muted subtitles
          400: '#A8A29E',
          300: '#D6D3D1',
          200: '#E7E5E4',
          100: '#F5F5F4',
        },
        earth: {
          terracotta: '#C25E3E',
          'terracotta-bg': '#FDF2EE',
          olive: '#5F6F52',
          'olive-bg': '#F3F6F1',
          sand: '#D6CEBE',
          clay: '#A77959',
          amber: '#D97706',
          'amber-bg': '#FEF3C7',
        },
        neon: {
          lime: '#84CC16',
          'lime-accent': '#A3E635',
          'lime-dark': '#4D7C0F',
          'lime-glow': '#BEF264',
          'lime-bg': '#F7FEE7',
          emerald: '#10B981',
          'emerald-bg': '#ECFDF5',
        },
        darkwarm: {
          bg: '#141312',
          surface: '#1C1A18',
          card: '#23201D',
          'card-hover': '#2C2925',
          border: '#35302B',
          'border-subtle': '#2A2622',
          text: '#F5F2EB',
          'text-muted': '#9E978E',
        },
        industrial: {
          950: '#070A10',
          900: '#0B0F19',
          850: '#111827',
          800: '#1E293B',
          750: '#283548',
          700: '#334155',
          600: '#475569',
          500: '#64748B',
          400: '#94A3B8',
          300: '#CBD5E1',
          200: '#E2E8F0',
          100: '#F1F5F9',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      }
    },
  },
  plugins: [],
}
