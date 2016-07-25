import {_throw} from 'rxjs/observable/throw'

// Return source that delegates requests based on url.
// Supports one wildcard path (e.g. '/:id'), all others are
// matched exactly.
// Wildcard is added to the request using the given key.
// TODO: Move wildcard out.
export default function paths(paths) {
  paths = Object.assign({}, paths)

  // Check paths.
  Object.keys(paths).forEach(path => {
    if (path.indexOf('/') !== 0 || path.indexOf('/', 1) !== -1) {
      throw new Error('Route must start with and contain only one /')
    }
    if (typeof paths[path] !== 'function') {
      throw new Error('Route source must be a function')
    }
  })

  // Build wildcard.
  const wildcardRoutes = Object.keys(paths).filter(k => k[1] === ':')
  if (wildcardRoutes.length > 1) {
    throw new Error('Routes can only have one wildcard (/:key)')
  }
  const wildcardRoute = wildcardRoutes[0]
  const wildcardKey = wildcardRoute && wildcardRoute.slice(2)
  // Prevent overriding known keys.
  if (['io', 'path', 'originalPath', 'method', 'params'].includes(wildcardKey)) {
    throw new Error(`Wildcard clashes with reserved key ${wildcardKey} (${wildcardRoute})`)
  }
  const wildcardHandler = wildcardRoute && paths[wildcardRoute]
  // Remove from paths so it can't be hit like a static path.
  if (wildcardHandler) {
    delete paths[wildcardRoute]
  }

  return function(request) {
    // Always start with a slash.
    const path = request.path || '/'
    const nextIndex = path.indexOf('/', 1)
    const currentPath = nextIndex === -1 ?
      path :
      path.slice(0, nextIndex)

    // First try static paths.
    if (paths.hasOwnProperty(currentPath)) {
      return paths[currentPath]({
        ...request,
        path: nextIndex === -1 ? '' : path.slice(nextIndex)
      })
    }
    // Then try wildcard.
    else if (wildcardHandler) {
      return wildcardHandler({
        ...request,
        path: nextIndex === -1 ? '' : path.slice(nextIndex),
        [wildcardKey]: currentPath.slice(1)
      })
    }
    else {
      _throw(new Error(`No source found for path ${currentPath} at ${request.originalPath}`))
    }
  }
}
