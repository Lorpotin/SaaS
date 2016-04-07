module.exports = {
  entry: './client/App.jsx',
  output: {
    filename: './client/dist/bundle.js'
  },
  module: {
    loaders: [
      // jsx
      { test: /\.jsx$/, loader: 'babel-loader' },

      // css
      { test: /\.css$/, loader: "style-loader!css-loader" }
    ]
  }
};

