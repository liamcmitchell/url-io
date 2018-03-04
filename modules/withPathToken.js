import currentNextPath from './currentNextPath'
import mapRequest from './mapRequest'

// Returns wrapper source.
export default function withPathToken(path) {
  if (path.slice(0, 2) !== '/:') {
    throw new Error('Token must start with "/:"')
  }

  const key = path.slice(2)

  // Warn early if reserved key used.
  if (['io', 'path', 'originalPath', 'method', 'params'].includes(key)) {
    throw new Error(`Key is reserved: ${key} (${path})`)
  }

  return mapRequest((request) => {
    const [current, next] = currentNextPath(request.path)

    return {
      ...request,
      path: next,
      [key]: current,
    }
  })
}
