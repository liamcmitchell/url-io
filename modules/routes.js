import {isPath, paths} from './path'
import {methods} from './method'
import {isObject} from './util'

const makeRoutes = (sourceOrRoutes) =>
  isObject(sourceOrRoutes) ? routes(sourceOrRoutes) : sourceOrRoutes

// Combines methods & paths to make an easier to use router that should
// cover most needs. See tests for examples.
export const routes = (routesObject) => {
  if (!isObject(routesObject)) throw new Error('routes must receive an object')

  const keys = Object.keys(routesObject)

  if (!keys.some(isPath)) return methods(routesObject)

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
