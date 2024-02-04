import babel from '@rollup/plugin-babel'
import {dts} from 'rollup-plugin-dts'
import resolve from '@rollup/plugin-node-resolve'

export default [
  {
    input: './modules/index.ts',
    output: [
      {
        file: `dist/url-io.mjs`,
        format: 'es',
      },
      {
        file: `dist/url-io.cjs`,
        format: 'cjs',
      },
    ],
    // Treat absolute imports as external.
    external: (id) => /^(\w|@)/.test(id),
    plugins: [
      resolve({
        extensions: ['.js', '.ts'],
      }),
      babel({
        extensions: ['.js', '.ts'],
        babelHelpers: 'bundled',
      }),
    ],
  },
  {
    input: './modules/index.ts',
    output: [
      {
        file: `dist/url-io.d.ts`,
        format: 'es',
      },
    ],
    plugins: [dts()],
  },
]
