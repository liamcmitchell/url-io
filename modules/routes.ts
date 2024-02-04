import {isPath, paths} from './path'
import {methods} from './method'
import {isObject} from './util'
import {Source} from './source'

interface Routes {
  [path: string]: Source | Routes
}

const makeRoutes = (sourceOrRoutes: Source | Routes): Source =>
  isObject(sourceOrRoutes) ? routes(sourceOrRoutes as Routes) : sourceOrRoutes

// Combines methods & paths to make an easier to use router that should
// cover most needs. See tests for examples.
export const routes = (routesObject: Routes) => {
  if (!isObject(routesObject)) throw new Error('routes must receive an object')

  const keys = Object.keys(routesObject)

  if (!keys.some(isPath)) return methods(routesObject as Record<string, Source>)

  if (!keys.every(isPath))
    throw new Error(`Can't define methods and paths on the same level.`)

  return paths(
    Object.fromEntries(
      Object.entries(routesObject).map(([key, value]) => [
        key,
        makeRoutes(value),
      ])
    )
  )
}
