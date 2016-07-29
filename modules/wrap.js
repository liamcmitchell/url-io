import rejectNotFound from './rejectNotFound'

export default function wrap(...sources) {
  // Accept array of sources as first arg.
  if (typeof sources[0] === 'object') {
    sources = sources[0]
  }

  if (!sources.every(source => typeof source === 'function')) {
    throw new Error('wrap only accepts functions')
  }

  return sources.reduceRight((next, source) =>
    request => source(request, next)
  , (request, next = rejectNotFound) => next(request))
}
