const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const path = require('path');
const glob = require('glob');
const AutopreFixer = require('autoprefixer');

const projectRoot = process.cwd();

/* 多页面打包 */
const setMPA = () => {
  const entry = {};
  const htmlWebpackPlugins = [];
  const entryFiles = glob.sync(path.join(projectRoot, './src/*/index.js'));
  Object.keys(entryFiles).forEach((index) => {
    const entryFile = entryFiles[index];
    const match = entryFile.match(/src\/(.*)\/index\.js/);
    const pageName = match && match[1];
    entry[pageName] = entryFile;
    htmlWebpackPlugins.push(new HtmlWebpackPlugin({
      template: path.join(projectRoot, `src/${pageName}/index.html`),
      filename: `${pageName}.html`,
      chunks: [pageName],
      inject: true,
      minify: {
        html5: true,
        collapseWhitespace: true,
        preserveLineBreaks: false,
        minifyCSS: true,
        minifyJS: true,
        removeComments: false,
      },
      /* cdnConfig: externalPages.includes(pageName) ? externalConfig : [], // cdn配置
       onlyCss: false //dev下只加载css */
    }));
  });
  return {
    entry,
    htmlWebpackPlugins,
  };
};
const { entry, htmlWebpackPlugins } = setMPA();
console.log(entry);

/* 导出基础配置 */
module.exports = {
  entry,
  module: {
    rules: [
      {
        test: /.js$/,
        use: ['babel-loader'],
      },
      {
        test: /.css$/,
        use: [
          // 'style-loader',
          MiniCssExtractPlugin.loader,
          'css-loader',
        ],
      },
      {
        test: /.less$/,
        use: [
          // 'style-loader', ->插入到style 提取css 文件
          MiniCssExtractPlugin.loader,
          'css-loader',
          'less-loader',
          {
            loader: 'postcss-loader',
            options: {
              // plugins: () => [require('autoprefixer')()],
              plugins: () => [AutopreFixer()],
            },
          },
          {
            loader: 'px2rem-loader',
            options: {
              remUnit: 75,
              remPrecision: 8,
            },
          },
        ],
      },
      {
        test: /.(png|jpg|gif|jpeg)$/,
        use: [{
          loader: 'file-loader', // url-loader
          options: {
            name: 'img/[name]_[hash:8].[ext]',
          },
        }],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name]_[contenthash:8].css',
    }),
    new FriendlyErrorsWebpackPlugin(),
    function errorPlugin() {
      this.hooks.done.tap('done', (stats) => {
        if (stats.compilation.errors && stats.compilation.errors.length && process.argv.indexOf('--watch') === -1) {
          console.log('build error'); // eslint-disable-line
          process.exit(1);
        }
      });
    },
    ...htmlWebpackPlugins,
  ],
  stats: 'errors-only',
};
