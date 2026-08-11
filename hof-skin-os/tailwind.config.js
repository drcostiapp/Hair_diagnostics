/** @type {import('tailwindcss').Config} */
// Brand tokens are CLINICAL_SPEC S15. Do not add colours here without a spec change.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          gold: '#D3B57C',
          linen: '#DBCCBB',
          taupe: '#B7A188',
          bronze: '#84735F',
          navy: '#0E2A37',
        },
      },
      fontFamily: {
        // Headlines. Optima ships on Apple devices (the iPad target); the rest is fallback.
        display: ['Optima', 'Segoe UI', 'Palatino Linotype', 'Georgia', 'serif'],
        // Body. Raleway is self-hostable later; system stack until then.
        body: ['Raleway', 'Segoe UI', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      screens: {
        // iPad landscape is the design target; 1024x768 is the floor.
        ipad: '1024px',
        ipadair: '1194px',
      },
    },
  },
  plugins: [],
}
