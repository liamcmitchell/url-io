import babel from 'rollup-plugin-babel'

export default ['cjs', 'es', 'es2015'].map((format) => {
  return {
    input: './modules/index.js',
    output: {
      file: `dist/url-io.${format}.js`,
      format: format === 'cjs' ? 'cjs' : 'es',
    },
    // Treat absolute imports as external.
    external: (id) => /^\w/.test(id),
    plugins: [
      format !== 'es2015' &&
        babel({
          babelrc: false,
          presets: [['es2015', {loose: true, modules: false}]],
          plugins: ['external-helpers'],
        }),
    ].filter(Boolean),
  }
})
