module.exports = {
  purge: [
    "./pages/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      inset: {
        '-1': '-0.25rem',
        '-2': '-0.5rem',
        '-4': '-1rem',
        '-8': '-2rem',
        '-16': '-4rem',

      },
      margin: {
        '-84': '-21rem',

      },
      spacing: {
        '3/4': "75%",
        '2/3': "66.66%",
        '1/2': "50%",
        '1/3': "33.33%",
        '1/4': "25%",
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
      },
      fontSize: {
        'micro': '0.50rem',
        'tiny': '0.625rem'
      },
      animation: {
        "slide-module-in": 'slideModuleIn .25s ease-in-out',
        "slide-flow-in": 'slideFlowIn .25s ease-in-out',
        "slide-nav-in": 'slideNavIn .25s ease-in-out'
      },
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
    width: ['responsive', 'hover'],
    height: ['responsive', 'hover'],
    inset: ['responsive', 'hover'],
    animation: ['responsive', 'motion-safe', 'motion-reduce']
  },
  plugins: [
    require('tailwindcss-gradients'),
    require('@tailwindcss/typography'),
  ],
}
