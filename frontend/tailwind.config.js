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
        'squircle-2xl': '30px',
      },
      colors: {
        industrial: {
          950: '#070A10', // Deepest background
          900: '#0B0F19', // Main panel background
          850: '#111827', // Card surface
          800: '#1E293B', // Border / subtle card
          750: '#283548', // Hover surfaces
          700: '#334155', // Borders
          600: '#475569', // Secondary text / icons
          500: '#64748B', // Neutral
          400: '#94A3B8', // Regular text
          300: '#CBD5E1', // High contrast text
          200: '#E2E8F0', // Bright text
          100: '#F1F5F9', // Pure white text
        },
        accent: {
          cyan: '#06B6D4',
          emerald: '#10B981',
          amber: '#F59E0B',
          crimson: '#EF4444',
          indigo: '#6366F1',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      }
    },
  },
  plugins: [],
}
