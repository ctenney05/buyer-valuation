/** @type {import('tailwindcss').Config} */
// Tailwind is used for LAYOUT ONLY (flex/grid/spacing/position). All color is via
// CSS custom properties in src/index.css — keep `content` pointed at this folder so
// the layout classes the copied components use actually get generated.
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Newsreader', 'Iowan Old Style', 'Georgia', 'serif'],
        sans:  ['Hanken Grotesk', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono:  ['Spline Sans Mono', 'ui-monospace', 'SF Mono', 'Menlo', 'monospace'],
      },
      colors: {
        cream: { 50: '#FAF9F5', 100: '#F5F3EC', 200: '#F0EDE3', 300: '#E8E4D7', 400: '#DED9C7' },
        ink:   { 300: '#C2BDB0', 400: '#9C978C', 500: '#76726A', 600: '#54514A', 700: '#34322E', 800: '#1F1E1C', 900: '#141413' },
        clay:  { 100: '#F8EBE4', 200: '#F2D8CD', 400: '#E2917A', 500: '#D97757', 600: '#BD5D3A', 700: '#A8492A' },
        ocean: { 200: '#CDE0E6', 500: '#3E7488', 600: '#2F5D6E' },
        kraft: { 200: '#EAE0CE', 500: '#B8966A' },
      },
    },
  },
  plugins: [],
};
