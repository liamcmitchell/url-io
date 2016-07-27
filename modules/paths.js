import reject from './reject'
import wrap from './wrap'
import withPathToken from './withPathToken'
import currentNextPath from './currentNextPath'
import omitBy from 'lodash/omitBy'

function routeRequest(paths, request, source) {
  const [current, next] = currentNextPath(request.path)

  if (paths.hasOwnProperty(current)) {
    return paths[current]({
      ...request,
      path: next
    })
  }
  else if (source) {
    return source(request)
  }
  else {
    return reject(request, new Error(`No source found for path ${current} at ${request.originalPath}`))
  }
}

function isTokenPath(path) {
  return path[1] === ':'
}

// Return wrappable source that delegates requests based on url.
// Supports one token path (e.g. '/:id'), all others are
// matched exactly.
// Token is added to the request using the given key.
export default function paths(paths) {
  // Check paths.
  for (const path in paths) {
    if (path.indexOf('/') !== 0 || path.indexOf('/', 1) !== -1) {
      throw new Error(`Path key must start with and contain only one / (${path})`)
    }
    if (typeof paths[path] !== 'function') {
      throw new Error(`Path source must be a function (${path})`)
    }
  }

  const tokenPath = Object.keys(paths).find(isTokenPath)

  const staticPathSource = routeRequest.bind(null,
    omitBy(paths, (v, k) => isTokenPath(k))
  )

  // Return static source if there are is no token to handle.
  if (!tokenPath) {
    return staticPathSource
  }

  if (Object.keys(paths).filter(isTokenPath).length > 1) {
    throw new Error('Paths can only have one token (/:key)')
  }

  return wrap(
    paths[tokenPath],
    withPathToken(tokenPath),
    // Static paths wrapped last because they are checked first.
    staticPathSource
  )
}
