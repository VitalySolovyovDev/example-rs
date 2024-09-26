import path from 'node:path';

import {
  HtmlRspackPlugin,
  CopyRspackPlugin,
  type Configuration,
  type SwcLoaderOptions,
} from '@rspack/core';
import ReactRefreshPlugin from '@rspack/plugin-react-refresh';
import sassEmbedded from 'sass-embedded';
import svgo, { type Config as SvgoConfig } from 'svgo';
import sharp, { type PngOptions as SharpPngOptions } from 'sharp';
import * as R from 'remeda';

import {
  isLiveReload,
  isProduction,
} from './scripts/assembly/envConditions';

export const CSS_MODULES_LOCALS_CONVENTION_DASHED = 'camel-case';

const ENTRY_APP = 'app';

const outPath = path.join(__dirname, './build');

const isNonFalse = <T>(data: T): data is Exclude<typeof data, false> => Boolean(data);

const hashAdditive = isProduction ? '.[contenthash]' : '';

const LOAD_PATHS = [path.resolve('src', 'shared', 'view', 'styles')];
export const getSassOptions = () => ({
  includePaths: LOAD_PATHS,
  loadPaths: LOAD_PATHS,
});

const svgoConfig: SvgoConfig = {
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          removeViewBox: false,
        },
      },
    },
  ],
  floatPrecision: 2,
};

const sharpPngOptions: SharpPngOptions = {
  palette: true,
};

const config: Configuration = {
  context: path.join(__dirname, './src'),
  mode: isProduction ? 'production' : 'development',
  entry: {
    [ENTRY_APP]: './index.tsx',
  },
  output: {
    path: outPath,
    publicPath: '/',
    filename: `[name]${hashAdditive}.js`,
    chunkFilename: `chunks/[name]${hashAdditive}.js`,
    cssFilename: `app${hashAdditive}.css`,
    cssChunkFilename: `chunks/[name]${hashAdditive}.css`,
  },
  target: 'web',
  resolve: {
    extensions: ['...', '.ts', '.tsx'],
    tsConfig: path.resolve(__dirname, 'tsconfig.json'),
  },
  experiments: {
    css: true,
  },
  module: {
    parser: {
      'css/auto': { namedExports: false },
    },
    generator: {
      'css/auto': {
        exportsConvention: CSS_MODULES_LOCALS_CONVENTION_DASHED,
        localIdentName: '[name]__[local]--[hash]',
      },
    },
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        type: 'javascript/auto',
        use: {
          loader: 'builtin:swc-loader',
          options: {
            jsc: {
              target: 'es2019',
              parser: {
                syntax: 'typescript',
                decorators: true,
                tsx: true,
              },
              transform: {
                legacyDecorator: true,
                decoratorMetadata: true,
                react: {
                  runtime: 'automatic',
                  development: !isProduction,
                  refresh: isLiveReload,
                },
              },
              experimental: {
                cacheRoot: path.resolve('node_modules', '.cache', '.swc'),
                plugins: [['@swc/plugin-react-remove-properties', {}]],
              },
            },
          } satisfies SwcLoaderOptions,
        },
      },
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'sass-loader',
            options: {
              sassOptions: getSassOptions(),
              api: 'modern-compiler',
              implementation: sassEmbedded,
            },
          },
        ],
        type: 'css/auto',
      },
      {
        test: /\.(png|jpe?g|gif)$/,
        type: 'asset',
        generator: { filename: 'images/[hash][ext][query]' },
        use: [].filter(isNonFalse),
      },
      {
        test: /\.svg$/,
        type: 'asset',
        generator: { filename: 'images/[hash][ext][query]' },
        use: [].filter(isNonFalse),
      },
      {
        test: /\.(eot|ttf|woff|woff2)$/,
        type: 'asset/resource',
        generator: { filename: 'fonts/[hash][ext][query]' },
      },
    ],
  },
  plugins: [
    new HtmlRspackPlugin({
      template: 'core/index.html',
    }),
    new CopyRspackPlugin({
      patterns: [
        {
          from: 'public',
          // @ts-ignore: https://github.com/web-infra-dev/rspack/issues/6895
          transform: (input: string | Buffer, absoluteFilename: string) => {
            if (typeof input === 'string') {
              throw new Error('Unknown behavior during CopyRspackPlugin transform');
            }
            if (absoluteFilename.includes('/affiliate/')) {
              return input;
            }
            switch (path.extname(absoluteFilename)) {
              case '.svg':
                return R.pipe(
                  input.toString('utf-8'),
                  content => svgo.optimize(content, svgoConfig),
                  R.prop('data'),
                );
              case '.png':
                return sharp(input).png(sharpPngOptions).toBuffer();
              default:
                return input;
            }
          },
        },
      ],
    }),
    isLiveReload && new ReactRefreshPlugin(),
  ],
  devServer: {
    port: 3000,
    static: { directory: outPath },
    historyApiFallback: true,
    client: { logging: 'warn' },
  },
  devtool: 'eval-cheap-module-source-map',
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          chunks: chunk => chunk.name === ENTRY_APP,
        },
      },
    },
  },
  ignoreWarnings: [/Conflicting order/],
};

export default config;
