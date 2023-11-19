import babel from '@rollup/plugin-babel'

export default {
  input: './modules/index.js',
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
    babel({
      babelrc: false,
      presets: [
        [
          '@babel/preset-env',
          {
            loose: true,
            targets: 'defaults',
          },
        ],
      ],
      babelHelpers: 'bundled',
    }),
  ],
}
