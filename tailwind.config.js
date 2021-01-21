module.exports = {
  purge: ['./components/**/*.{js,ts,jsx,tsx}', './pages/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'accent-1': '#333',
      },
    },
    fontFamily: {
      sans: ['basic-sans', 'sans-serif'],
      logo: ['chaloops', 'sans-serif'],
      mono: ['fira-mono', 'monospace']
    },
  },
  variants: {},
  plugins: [
    require('@tailwindcss/forms')
  ],
}
