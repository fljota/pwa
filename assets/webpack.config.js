const path = require('path');
const glob = require('glob');
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
//PWA 
const WebpackPwaManifest = require('webpack-pwa-manifest');
//SW Workbox - wird hier nicht benötigt durch phx digest
const WorkboxPlugin = require('workbox-webpack-plugin');


module.exports = (env, options) => {
  const devMode = options.mode !== 'production';

  return {
    optimization: {
      minimizer: [
        new TerserPlugin({ cache: true, parallel: true, sourceMap: devMode }),
        new OptimizeCSSAssetsPlugin({})
      ]
    },
    entry: {
      'app': glob.sync('./vendor/**/*.js').concat(['./js/app.js'])
    },
    output: {
      filename: '[name].js',
      path: path.resolve(__dirname, '../priv/static/js'),
      publicPath: '/js/'
    },
    devtool: devMode ? 'eval-cheap-module-source-map' : undefined,
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          }
        },
        {
          test: /\.[s]?css$/,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            'sass-loader',
          ],
        }
      ]
    },
    plugins: [
      new MiniCssExtractPlugin({ filename: '../css/app.css' }),
      new CopyWebpackPlugin([{ from: 'static/', to: '../' }]),
      new WebpackPwaManifest({
        name: 'fljota.network',
        short_name: 'fljota',
        description: 'floating item network pwa for a better universe',
        display: "standalone",
        background_color: '#ffffff',
        crossorigin: 'anonymous', //can be null, use-credentials or anonymous
        inject: false,
        fingerprints: false,
        icons: [
          {
            src: path.resolve('static/images/fljota_offline.svg'),
            sizes: [512], // multiple sizes
            purpose: "any"
          }
        ]
      }),
      new WorkboxPlugin.GenerateSW({
        // Do not precache images
        exclude: [/\.(?:png|jpg|jpeg|svg)$/],
  
        // Define runtime caching rules.
        runtimeCaching: [{
          // Match any request that ends with .png, .jpg, .jpeg or .svg.
          urlPattern: /\.(?:png|jpg|jpeg|svg)$/,
  
          // Apply a cache-first strategy.
          handler: 'CacheFirst',
  
          options: {
            // Use a custom cache name.
            cacheName: 'images',
  
            // Only cache 10 images.
            expiration: {
              maxEntries: 10,
            },
          },
          
        }],
        navigateFallback: '/offline.html',
      })
      // ,
      // new InjectManifest({
      //   swSrc: path.resolve('js/service-worker.js')
      // })
    ]
    .concat(devMode ? [new HardSourceWebpackPlugin()] : [])
  }
};
