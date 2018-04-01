import {rejectNotFound} from './rejectNotFound'
import {isSource} from './source'
import {isPath, isTokenPath, withPathToken, branchPaths} from './path'
import {isMethod, branchMethods} from './method'

// Combines branchMethods, branchPaths and withPathToken to make an
// easier to use router that should cover most needs.
// See tests for examples.
export const routes = (routesObject) => {
  if (typeof routesObject !== 'object')
    throw new Error('routes must receive an object')

  const pathSources = {}
  let methodSources
  let tokenSource

  for (const key in routesObject) {
    const route = routesObject[key]

    if (isMethod(key)) {
      if (!methodSources) methodSources = {}

      // Pass in as-is to allow observe shorthand.
      methodSources[key] = route
    } else {
      // Allow nested routes.
      const source = isSource(route) ? route : routes(route)

      if (isTokenPath(key)) {
        if (tokenSource)
          throw new Error(`Only one token route allowed (${key})`)

        tokenSource = withPathToken(key)(source)
      } else if (isPath(key)) {
        pathSources[key] = source
      } else {
        throw new Error(`Unknown route (${key})`)
      }
    }
  }

  // We make sure a root handler is defined (even if rejectNotFound) to prevent
  // root requests going to tokenSource.
  if (pathSources['/']) {
    if (methodSources)
      throw new Error(`Can't define methods and root (/) at the same time.`)
  } else {
    pathSources['/'] = methodSources
      ? branchMethods(methodSources)(rejectNotFound)
      : rejectNotFound
  }

  return branchPaths(pathSources)(tokenSource || rejectNotFound)
}
