// Return source that delegates requests based on url.
// Supports one wildcard route (e.g. '/:id'), all others are
// matched exactly.
// Wildcard is added to the request using the given key.
export default function routes(routes) {
  routes = Object.assign({}, routes)

  // Check routes.
  Object.keys(routes).forEach(route => {
    if (route.indexOf('/') !== 0 || route.indexOf('/', 1) !== -1) {
      throw new Error('Route must start with and contain only one /')
    }
    if (typeof routes[route] !== 'function') {
      throw new Error('Route source must be a function')
    }
  })

  // Build wildcard.
  const wildcardRoutes = Object.keys(routes).filter(k => k[1] === ':')
  if (wildcardRoutes.length > 1) {
    throw new Error('Routes can only have one wildcard (/:key)')
  }
  const wildcardRoute = wildcardRoutes[0]
  const wildcardKey = wildcardRoute && wildcardRoute.slice(2)
  // Prevent overriding known keys.
  if (['io', 'url', 'method'].includes(wildcardKey)) {
    throw new Error(`Wildcard clashes with reserved key ${wildcardKey} (${wildcardRoute})`)
  }
  const wildcardHandler = wildcardRoute && routes[wildcardRoute]
  // Remove from routes so it can't be hit like a static route.
  if (wildcardHandler) {
    delete routes[wildcardRoute]
  }

  return function(request) {
    // Always start with a slash.
    const url = request.url || '/'
    const nextIndex = url.indexOf('/', 1)
    const route = nextIndex === -1 ?
      url :
      url.slice(0, nextIndex)

    // First try static routes.
    if (routes.hasOwnProperty(route)) {
      return routes[route](Object.assign({}, request, {
        url: nextIndex === -1 ? '' : url.slice(nextIndex)
      }))
    }
    // Then try wildcard.
    else if (wildcardHandler) {
      return wildcardHandler(Object.assign({}, request, {
        url: nextIndex === -1 ? '' : url.slice(nextIndex),
        [wildcardKey]: route.slice(1)
      }))
    }
    else {
      // TODO: Better error message, what is the full url at this point?
      throw new Error('No source found for route ' + route)
    }
  }
}
