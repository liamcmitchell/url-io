// Return source that delegates requests based on url.
export default function routes(routes) {
  // Check routes.
  Object.keys(routes).forEach(route => {
    if (route.indexOf('/') !== 0 || route.indexOf('/', 1) !== -1) {
      throw new Error('Route must start with and contain only one /')
    }
    if (typeof routes[route] !== 'function') {
      throw new Error('Route source must be a function')
    }
  })

  return function(request) {
    const url = request.url || '/'
    const nextIndex = url.indexOf('/', 1)
    const route = nextIndex === -1 ?
      url :
      url.slice(0, nextIndex)

    if (routes.hasOwnProperty(route)) {
      return routes[route](Object.assign({}, request, {
        url: nextIndex === -1 ? '' : url.slice(nextIndex)
      }))
    }
    else {
      // TODO: Better error message, what is the full url at this point?
      throw new Error('No source found for route ' + route)
    }
  }
}
