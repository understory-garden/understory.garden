module.exports = {
  purge: ['./components/**/*.{js,ts,jsx,tsx}', './pages/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        passionflower: '#944c7d',
        lagoon: '#0e90a3',
        echeveria: '#9fae6f',
        chanterelle: '#edb156',
        coral: '#f6895a',
        ember: '#d44d51',

        ocean: '#2d6da6',
        aloe: '#579f89',
        kelp: '#c6b063',
        apricot: '#f29d58',
        salmon: '#e56b56',

        amethyst: '#e0c3d7',
        aquamarine: '#9ed3db',
        jade: '#dce1c9',
        citrine: '#f7deb7',
        topaz: '#fbcbb7',
        morganite: '#f0bfc2',

        snow: '#ffffff',
        mist: '#f4f3f3',
        fog: '#b2aeb1',
        storm: '#665e63',
        night: '#190d15',
      },
    },
    fontFamily: {
      sans: ['Montserrat', 'sans-serif'],
      logo: ['Marisa', 'sans-serif'],
      mono: ['fira-mono', 'monospace']
    },
  },
  variants: {},
  plugins: [
    require('@tailwindcss/forms')
  ],
}
