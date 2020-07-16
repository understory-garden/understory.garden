module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    ...(process.env.NODE_ENV === 'production'
      ? {
        '@fullhuman/postcss-purgecss': {
          content: [
            './components/**/*',
            './pages/**/*',
            './spaces/**/*',
            './flows/**/*',
            './hooks/**/*',
            './lib/**/*',
            './modules/**/*'
          ],
          defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || []
        }
      }
      : {})
  }
};
