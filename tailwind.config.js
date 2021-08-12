module.exports = {
  purge: ['./components/**/*.{js,ts,jsx,tsx}', './pages/**/*.{js,ts,jsx,tsx}'],
  theme: {
    minWidth: {
      '0': '0',
      '1/5': '20%',
      '1/4': '25%',
      '2/5': '40%',
      '1/2': '50%',
      '3/5': '60%',
      '3/4': '75%',
      '4/5': '80%',
      'full': '100%',
    },
    minHeight: {
      '0': '0',
      '1/5': '20%',
      '1/4': '25%',
      '2/5': '40%',
      '1/2': '50%',
      '3/5': '60%',
      '3/4': '75%',
      '4/5': '80%',
      'full': '100%',
    },
    maxWidth: {
      '0': '0',
      '1/5': '20%',
      '1/4': '25%',
      '2/5': '40%',
      '1/2': '50%',
      '3/5': '60%',
      '3/4': '75%',
      '4/5': '80%',
      'full': '100%',
    },
    maxHeight: {
      '0': '0',
      '1/5': '20%',
      '1/4': '25%',
      '2/5': '40%',
      '1/2': '50%',
      '3/5': '60%',
      '3/4': '75%',
      '4/5': '80%',
      'full': '100%',
    },
    extend: {
      colors: {
        passionflower: {
          light: '#e0c3d7',
          DEFAULT: '#944c7d',
          dark: '#633353',
        },

        lagoon: {
          light: '#9ed3db',
          DEFAULT: '#0e90a3',
          dark: '#09606d',
        },

        echeveria: {
          light: '#dce1c9',
          DEFAULT: '#9fae6f',
          dark: '#6a744a',
        },

        chanterelle: {
          light: '#f7deb7',
          DEFAULT: '#edb156',
          dark: '#9e7639',
        },

        coral: {
          light:  '#fbcbb7',
          DEFAULT: '#f6895a',
          dark: '#a45b3c',
        },

        ember: {
          light: '#f0bfc2',
          DEFAULT: '#d44d51',
          dark: '#8d3336',
        },

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
      logo: ['Bellota', 'cursive', 'sans-serif'],
      mono: ['fira-mono', 'monospace']
    },
  },
  variants: {},
  plugins: [
    require('@tailwindcss/forms')
  ],
}
