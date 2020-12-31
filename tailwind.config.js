module.exports = {
  purge: ['./components/**/*.{js,ts,jsx,tsx}', './pages/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'accent-1': '#333',
      },
    },
    fontFamily: {
//      sans: ['catnip', 'sans-serif'],
      logo: ['westsac', 'sans-serif'],
      mono: ['fira-mono', 'monospace']
    },
  },
  variants: {},
  plugins: [
    require('@tailwindcss/forms')
  ],
}
