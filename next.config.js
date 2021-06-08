module.exports = {
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Note: we provide webpack above so you should not `require` it
    // Perform customizations to webpack config
    // config.plugins.push(new webpack.IgnorePlugin(/\/__tests__\//))

    // IMPORTANT: we need to disable minimization for now because image-blob-reduce
    // has problems with terser minimization:
    // https://github.com/nodeca/image-blob-reduce
    config.optimization.minimize = false
    // Important: return the modified config
    return config
  },
}
