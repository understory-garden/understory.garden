module.exports = {
  purge: [],
  theme: {
    extend: {
      inset: {
        '-2': '-0.5rem',
        '-4': '-1rem',
        '-8': '-2rem',
        '-16': '-4rem',

      },
      spacing: {
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
      },
      fontSize: {
        'micro': '0.50rem',
        'tiny': '0.625rem'
      }
    },
    gradientColors: {
      background: ['#d57eeb', '#fccb90']
    },
    linearGradientColors: theme => theme('gradientColors'),
    radialGradientColors: theme => theme('gradientColors'),
    conicGradientColors: theme => theme('gradientColors'),
    fontFamily: {
      sans: ['basic-sans', 'sans-serif'],
    },
  },
  variants: {
    visibility: ['responsive', 'hover'],
  },
  plugins: [
    require('tailwindcss-gradients'),
  ],
}
