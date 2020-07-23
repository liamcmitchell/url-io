import {rejectNotFound} from './rejectNotFound'
import {ensureRequestKey} from './request'
import isString from 'lodash/isString'
import {markSafeSource, createSafeSource} from './source'

// Require / prefix to make it easier to understand that these are routes.
export const isPath = (path) =>
  isString(path) && path[0] === '/' && path.indexOf('/', 1) === -1

const ensurePath = (path) => {
  if (!isPath(path))
    throw new Error(
      `Path must start with and contain only one slash "/" (${path})`
    )
}

const pathPiece = (path) => path.slice(1)

export const currentPath = (path) => {
  const index = path.indexOf('/')
  return index === -1 ? path : path.slice(0, index)
}

export const nextPath = (path) => {
  const index = path.indexOf('/')
  return index === -1 ? '' : path.slice(index + 1)
}

// Deprecated.
export const currentNextPath = (path) => [currentPath(path), nextPath(path)]

export const isTokenPath = (path) => isPath(path) && path[1] === ':'

const ensureTokenPath = (path) => {
  ensurePath(path)
  if (!isTokenPath(path))
    throw new Error(`Token path must start with "/:" (${path})`)
}

const tokenPathKey = (path) => path.slice(2)

export const pathToArray = (path) =>
  Array.isArray(path) ? path : path.split('/').filter(Boolean)

export const pathToString = (path) => (isString(path) ? path : path.join('/'))

export const withPathToken = (path) => (source) => {
  source = createSafeSource(source)

  ensureTokenPath(path)

  const key = tokenPathKey(path)

  ensureRequestKey(key)

  return markSafeSource((request) => {
    const {path} = request

    return source(
      Object.assign({}, request, {
        path: nextPath(path),
        [key]: currentPath(path),
      })
    )
  })
}

export const branchPaths = (paths) => (source) => {
  source = createSafeSource(source)

  const sources = {}

  for (const path in paths) {
    ensurePath(path)
    sources[pathPiece(path)] = createSafeSource(paths[path], path)
  }

  return markSafeSource((request) => {
    const {path} = request
    const thisPath = currentPath(path)

    if (Object.prototype.hasOwnProperty.call(sources, thisPath)) {
      const source = sources[thisPath]
      return source(
        Object.assign({}, request, {
          path: nextPath(path),
        })
      )
    }

    return source(request)
  })
}

// Return source that branches requests based on url.
// Supports one token path (e.g. '/:id'), all others are
// matched exactly.
// Token is added to the request using the given key.
export const paths = (paths) => {
  let tokenSource
  const staticPaths = {}

  for (const path in paths) {
    if (isTokenPath(path)) {
      if (tokenSource)
        throw new Error(`Paths can only have one token (${path})`)

      tokenSource = withPathToken(path)(paths[path])
    } else {
      staticPaths[path] = paths[path]
    }
  }

  return branchPaths(staticPaths)(tokenSource || rejectNotFound)
}
