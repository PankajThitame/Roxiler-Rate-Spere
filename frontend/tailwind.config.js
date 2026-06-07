/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'bg-slate-900',
    'bg-slate-800',
    'bg-slate-700',
    'text-slate-100',
    'selection:bg-brand-500',
    'selection:text-white',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f7ff',
          100: '#ebf0ff',
          200: '#d6e0ff',
          300: '#b3c7ff',
          400: '#85a3ff',
          500: '#5476ff',
          600: '#3350eb',
          700: '#253bc7',
          800: '#2232a1',
          900: '#202c80',
          950: '#13194d',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
