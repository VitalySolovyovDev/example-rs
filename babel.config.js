// eslint-disable-next-line @typescript-eslint/no-var-requires,ban/ban
const { isLiveReload } = require('./scripts/assembly/envConditions');

module.exports = {
  presets: [
    // Preset ordering is reversed (last to first).
    '@babel/preset-typescript',
    [
      '@babel/preset-env',
      {
        bugfixes: true, // will be enabled by default in Babel 8
        modules: false,
      },
    ],
    ['@babel/preset-react', { runtime: 'automatic' }],
  ],
  plugins: [
    ['@babel/plugin-proposal-decorators', { version: 'legacy' }],
    '@babel/plugin-transform-runtime',
    isLiveReload && require.resolve('react-refresh/babel'),
  ].filter(Boolean),
};
