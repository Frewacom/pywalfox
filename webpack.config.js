const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  mode: process.env.NODE_ENV === 'development' ? 'development' : 'production',
  devtool: process.env.NODE_ENV === 'development' ? 'source-map' : false,
  entry: {
    background: path.resolve(__dirname, 'src/background/index.ts'),
    duckduckgo: path.resolve(__dirname, 'src/inject/duckduckgo.ts'),
    settingsPage: path.resolve(__dirname, 'src/ui/settings/page.ts'),
    updatePage: path.resolve(__dirname, 'src/ui/update/page.ts'),
  },
  output: {
    path: path.resolve(__dirname, 'extension/dist'),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.html$/,
        loaders: [ 'html-loader' ]
      },
      {
        test: /\.css$/,
        loader: 'css-loader',
        options: {
          modules: true
        }
      },
      {
        test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
        loader: 'url-loader',
        options: {
          limit: 10000
        }
      }
    ],
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
  },
  plugins: [
    new CleanWebpackPlugin({ cleanStaleWebpackAssets: false }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/ui/settings/index.html'),
      filename: './settings.html',
      inject: true,
      chunks: [ 'settingsPage' ],
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/ui/update/index.html'),
      filename: './update.html',
      inject: true,
      chunks: [ 'updatePage' ],
    }),
  ]
}
