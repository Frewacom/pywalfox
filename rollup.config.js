import path from 'path';
import clear from 'rollup-plugin-clear';
import postcss from 'rollup-plugin-postcss';
import analyze from 'rollup-plugin-analyzer';
import { terser } from 'rollup-plugin-terser';
import typescript from 'rollup-plugin-typescript2';
import { typescriptPaths } from 'rollup-plugin-typescript-paths';

import cssimport from 'postcss-import';
import urlresolve from 'postcss-url';

const production = !process.env.ROLLUP_WATCH;
const defaultPlugins = [
  typescript(),
  typescriptPaths(),
  production && terser(),
  production && analyze({ summaryOnly: true }),
];

export default [
  {
    input: 'src/background/index.ts',
    output: {
      file: 'extension/dist/background.js',
      format: 'es',
    },
    plugins: [
      clear({ targets: ['extension/dist', 'artifacts'] }),
      postcss({
        extract: path.resolve('extension/dist/styles.bundle.css'),
        extensions: [ '.css' ],
        plugins: [
          cssimport(),
          urlresolve({ url: 'inline' }),
        ],
        minimize: production,
      }),
      ...defaultPlugins,
    ],
  },
  {
    input: 'src/inject/duckduckgo.ts',
    output: {
      file: 'extension/dist/duckduckgo.js',
      format: 'iife',
    },
    plugins: defaultPlugins,
  },
  {
    input: 'src/ui/settings.ts',
    output: {
      file: 'extension/dist/settings.bundle.js',
      format: 'iife',
    },
    plugins: defaultPlugins,
  },
  {
    input: 'src/ui/update.ts',
    output: {
      file: 'extension/dist/update.bundle.js',
      format: 'iife',
    },
    plugins: defaultPlugins,
  },
  {
    input: 'src/ui/native_error.ts',
    output: {
      file: 'extension/dist/native_error.bundle.js',
      format: 'iife',
    },
    plugins: defaultPlugins,
  },
];
