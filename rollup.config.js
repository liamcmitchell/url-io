import babel from '@rollup/plugin-babel'

export default ['cjs', 'es', 'es2015'].map((format) => {
  return {
    input: './modules/index.js',
    output: {
      file: `dist/url-io.${format}.js`,
      format: format === 'cjs' ? 'cjs' : 'es',
    },
    // Treat absolute imports as external.
    external: (id) => /^(\w|@)/.test(id),
    plugins: [
      format !== 'es2015' &&
        babel({
          babelrc: false,
          presets: [
            [
              '@babel/preset-env',
              {
                loose: true,
                modules: false,
                targets: '> 0.25%, not dead',
              },
            ],
          ],
          plugins: ['@babel/plugin-transform-runtime'],
          babelHelpers: 'runtime',
        }),
    ].filter(Boolean),
  }
})
