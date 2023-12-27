// webpack.config.js
const path = require('path');

module.exports = {
  // ... other config settings ...

  resolve: {
    fallback: {
      "stream": false,
      "zlib": false,
      "crypto": false,
      "https": false,
      "http": false,
      "url": false,
      "buffer": false,
      // You may also need to add "net" and "tls" if they are used by any package
      "net": false, // if not used, or provide a polyfill
      "tls": false, // if not used, or provide a polyfill
    }
  },

  plugins: [
    // ... other plugins ...
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
  ],
};