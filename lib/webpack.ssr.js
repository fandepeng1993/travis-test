const merge = require('webpack-merge');
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin');
const HtmlWebpackExternalsPlugin = require('html-webpack-externals-plugin');
const cssnano = require('cssnano');
const baseConfig = require('./webpack.base');

const ssrConfig = {
  mode: 'production',
  module: {
    rules: [
      {
        test: /.css$/,
        use: [
          'ignore-loader',
        ],
      },
      {
        test: /.less$/,
        use: [
          'ignore-loader',
        ],
      },
    ],
  },
  plugins: [
    new OptimizeCssAssetsWebpackPlugin({
      assetNameRegExp: /\.css$/g,
      cssProcessor: cssnano,
    }),
    new HtmlWebpackExternalsPlugin({
      externals: [
        {
          module: 'react',
          entry: 'https://unpkg.com/react@16/umd/react.production.min.js', // 可以是本地 也可以是cdn
          global: 'React',
        },
        {
          module: 'react-dom',
          entry: 'https://unpkg.com/react-dom@16/umd/react-dom.production.min.js',
          global: 'ReactDOM',
        },
      ],
    }),
  ],
  optimization: {
    splitChunks: {
      minSize: 0,
      cacheGroups: {
        /* vendors: {
           test: /(react|react-dom|React|ReactDOM)/,
           name: 'vendors',
           chunks: 'all',
           minChunks: 2
         } */
        vendor: {
          name: 'vendor',
          test: /[\\/]node_modules[\\/]/,
          chunks: 'all',
          priority: 10, // 优先级
        },
        commons: {
          name: 'commons',
          test: /[\\/]src[\\/]/,
          minSize: 1024,
          chunks: 'all',
          priority: 5,
          minChunks: 2,
        },
      },
    },
  },
};
module.exports = merge(baseConfig, ssrConfig);
