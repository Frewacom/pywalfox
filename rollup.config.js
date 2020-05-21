import path from 'path';
import copy from 'rollup-plugin-copy';
import clear from 'rollup-plugin-clear';
import postcss from 'rollup-plugin-postcss';
import typescript from 'rollup-plugin-typescript2';

import cssimport from 'postcss-import';
import urlresolve from 'postcss-url';

const production = !process.env.ROLLUP_WATCH;

export default [
  {
    input: 'src/background/index.ts',
    output: {
      file: 'extension/dist/background.js',
      format: 'es',
    },
    plugins: [
      clear({ targets: ['extension/dist', 'artifacts'] }),
      typescript(),
      postcss({
        extract: path.resolve('extension/dist/pages/bundle.min.css'),
        extensions: [ '.css' ],
        plugins: [
          cssimport(),
          urlresolve({ url: 'inline' }),
        ],
        minimize: production,
      }),
    ],
  },
  {
    input: 'src/inject/duckduckgo.ts',
    output: {
      file: 'extension/dist/duckduckgo.js',
      format: 'iife',
    },
    plugins: [ typescript() ],
  },
  {
    input: 'src/ui/settings.ts',
    output: {
      file: 'extension/dist/pages/settings.min.js',
      format: 'iife',
    },
    plugins: [
      typescript(),
      copy({ targets: [ { src: 'src/ui/settings.html', dest: 'extension/dist/pages' } ] }),
    ],
  },
  {
    input: 'src/ui/update.ts',
    output: {
      file: 'extension/dist/pages/update.min.js',
      format: 'iife',
    },
    plugins: [
      typescript(),
      copy({ targets: [ { src: 'src/ui/update.html', dest: 'extension/dist/pages'} ] }),
    ],
  },
];
