import reject from './reject'
import currentNextPath from './currentNextPath'

// Returns wrapper source.
export default function withPathToken(path) {
  const key = path.slice(2)

  // Warn early if reserved key used.
  if (['io', 'path', 'originalPath', 'method', 'params'].includes(key)) {
    throw new Error(`Key is reserved: ${key} (${path})`)
  }

  return function withPathToken(request, source) {
    const [current, next] = currentNextPath(request.path)

    if (request.hasOwnProperty(key)) {
      return reject(request, new Error(`withPathToken key ${key} clashes with existing request`))
    }

    return source({
        ...request,
        path: next,
        [key]: current.slice(1)
      })
  }
}
