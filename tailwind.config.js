module.exports = {
  purge: [],
  theme: {
    extend: {
      spacing: {
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
      }
    },
    gradientColors: {
      background: ['#d57eeb', '#fccb90']
    },
    linearGradientColors: theme => theme('gradientColors'),
    radialGradientColors: theme => theme('gradientColors'),
    conicGradientColors: theme => theme('gradientColors'),
  },
  variants: {
    visibility: ['responsive', 'hover'],
  },
  plugins: [
    require('tailwindcss-gradients'),
  ],
}
