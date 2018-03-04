export default {
  input: './modules/index.js',
  output: [
    {
      file: 'dist/url-io.js',
      format: 'cjs',
    },
    {
      file: 'dist/url-io.es.js',
      format: 'es',
    },
  ],
  // Treat absolute imports as external.
  external: (id) => /^\w/.test(id),
}
