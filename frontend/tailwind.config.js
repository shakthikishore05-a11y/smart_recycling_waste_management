/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        eco: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D', // Primary
          800: '#166534',
          900: '#14532D', // Deep green
          950: '#052E16',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          soft: '#F7FAF7',
          card: '#FFFFFF',
          border: '#E3EAE4',
          hover: '#EFF5F0',
        },
        textPrimary: '#17231C',
        textSecondary: '#66756B',
        emeraldAccent: '#10B981',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'eco-sm': '0 1px 3px 0 rgba(20, 83, 45, 0.05), 0 1px 2px -1px rgba(20, 83, 45, 0.05)',
        'eco-md': '0 4px 6px -1px rgba(20, 83, 45, 0.08), 0 2px 4px -2px rgba(20, 83, 45, 0.06)',
        'eco-lg': '0 10px 15px -3px rgba(20, 83, 45, 0.08), 0 4px 6px -4px rgba(20, 83, 45, 0.04)',
        'eco-glow': '0 0 20px rgba(16, 185, 129, 0.25)',
      }
    },
  },
  plugins: [],
}
