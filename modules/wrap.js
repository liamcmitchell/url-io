export default function wrap(...sources) {
  // Accept array of sources as first arg.
  if (typeof sources[0] === 'object') {
    sources = sources[0]
  }

  // Allow calling with dot notation.
  if (typeof this === 'function') {
    sources.unshift(this)
  }

  if (sources.length < 2) {
    throw new Error('wrap requires at least two sources')
  }

  if (!sources.every(source => typeof source === 'function')) {
    throw new Error('wrap only accepts functions')
  }

  return sources.slice(1).reduce((source, wrapper) =>
    request => wrapper(request, source)
  , sources[0])
}
