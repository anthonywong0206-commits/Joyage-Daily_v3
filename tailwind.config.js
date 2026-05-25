/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Inter', 'Noto Sans TC', 'Segoe UI', 'sans-serif']
      },
      boxShadow: {
        soft: '0 18px 45px rgba(73, 55, 87, 0.12)'
      }
    }
  },
  plugins: []
}
