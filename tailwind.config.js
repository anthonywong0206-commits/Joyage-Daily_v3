/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Inter', 'Noto Sans TC', 'Segoe UI', 'sans-serif']
      },
      boxShadow: {
        soft: '0 18px 45px rgba(64, 54, 105, 0.12)',
        glow: '0 18px 55px rgba(157, 140, 255, 0.28)'
      }
    }
  },
  plugins: []
}
