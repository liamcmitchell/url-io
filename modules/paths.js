import {rejectNotFound} from './rejectNotFound'
import {withPathToken} from './withPathToken'
import {currentNextPath} from './currentNextPath'
import omit from 'lodash/omit'
import mapKeys from 'lodash/mapKeys'

const isTokenPath = (path) => path[1] === ':'

// Return source that branches requests based on url.
// Supports one token path (e.g. '/:id'), all others are
// matched exactly.
// Token is added to the request using the given key.
export function paths(paths) {
  // Check paths.
  for (const path in paths) {
    // Require / prefix to make it easier to understand that these are routes.
    if (path.indexOf('/') !== 0 || path.indexOf('/', 1) !== -1) {
      throw new Error(
        `Path key must start with and contain only one / (${path})`
      )
    }
    if (typeof paths[path] !== 'function') {
      throw new Error(`Path source must be a function (${path})`)
    }
  }

  if (Object.keys(paths).filter(isTokenPath).length > 1) {
    throw new Error('Paths can only have one token (/:key)')
  }

  const tokenPath = Object.keys(paths).find(isTokenPath)

  const unknownPathSource = tokenPath
    ? withPathToken(tokenPath)(paths[tokenPath])
    : rejectNotFound

  // Remove token and / prefix.
  const staticPaths = mapKeys(omit(paths, tokenPath), (v, k) => k.slice(1))

  return (request) => {
    const [currentPath, nextPath] = currentNextPath(request.path)

    if (staticPaths.hasOwnProperty(currentPath)) {
      return staticPaths[currentPath].call(
        null,
        Object.assign({}, request, {
          path: nextPath,
        })
      )
    }

    return unknownPathSource(request)
  }
}
