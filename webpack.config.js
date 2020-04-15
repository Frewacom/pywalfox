const path = require('path');
const webpack = require('webpack');

module.exports = {
  devtool: "source-map",
  mode: process.env.NODE_ENV === 'development' ? 'development' : 'production',
  entry: {
    background: path.resolve(__dirname, 'src/background/index.ts'),
    inject: path.resolve(__dirname, 'src/inject/index.ts')
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
  }
}
