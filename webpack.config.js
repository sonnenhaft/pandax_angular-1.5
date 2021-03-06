const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  devtool: 'sourcemap',
  entry: {},
  module: {
    loaders: [
      { test: /\.js$/, exclude: [/app\/lib/, /node_modules/], loader: 'ng-annotate!babel' },
      { test: /\.html$/, loader: 'raw' },
      { test: /\.scss$/, loader: 'style!css!sass?sourceMap' },
      { test: /\.css$/, loader: 'style!css' },
      { test: /\.(eot|woff|woff2|ttf|svg)$/i, loader: 'url-loader?limit=30000&name=assets/fonts/[name]-[hash].[ext]' },
      { test: /\.(jpg|png)$/, loader: 'file-loader?limit=30000&name=assets/images/[name]-[hash].[ext]' },
      {
        test: /\.svg$/,
        exclude: [/assets\/fonts/],
        loader: 'file-loader?limit=30000&name=assets/images/icons/[name].[ext]'
      },
      { test: /\.json$/, loader: 'json-loader' }
    ]
  },
  plugins: [
    // Injects bundles in your index.html instead of wiring all manually.
    // It also adds hash to all injected assets so we don't have problems
    // with cache purging during deployment.
    new HtmlWebpackPlugin({
      template: 'client/index.html',
      inject: 'body',
      hash: true
    }),

    // Automatically move all modules defined outside of application directory to vendor bundle.
    // If you are using more complicated project structure, consider to specify common chunks manually.
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks (module, count) {
        return module.resource && module.resource.indexOf(path.resolve(__dirname, 'client')) === -1;
      }
    }),

    new webpack.IgnorePlugin(/^mock-firmata$/),
    new webpack.ContextReplacementPlugin(/bindings$/, /^$/)
  ],

  node: {
    fs: 'empty',
    tls: 'empty'
  },

  externals: ['bindings']
};
