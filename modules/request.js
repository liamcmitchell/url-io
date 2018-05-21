import isString from 'lodash/isString'
import isObjectLike from 'lodash/isObjectLike'

export const reservedRequestKeys = [
  'io',
  'path',
  'originalPath',
  'method',
  'params',
]

export const ensureRequestKey = (key) => {
  if (!isString(key) || !/^[a-z]/.test(key))
    throw new Error(`Request key must be a string matching /^[a-z]/ (${key})`)

  if (reservedRequestKeys.includes(key))
    throw new Error(`Request key is reserved (${key})`)
}

export const isObserveRequest = (request) => request.method === 'OBSERVE'

export const cacheKey = ({path, params}) => path + JSON.stringify(params)

export const toRequest = (requestOrPath, methodOrParams, params) => {
  const request = isObjectLike(requestOrPath)
    ? Object.assign({}, requestOrPath)
    : {path: requestOrPath}

  if (!isString(request.path)) {
    throw new Error("io requires a string path e.g. io('/path')")
  }

  if (request.path[0] !== '/') {
    throw new Error(
      "io requires path starting with a slash (/) e.g. io('/path')"
    )
  }

  // Save original path.
  request.originalPath = request.path

  // Remove starting slash (only required at root).
  request.path = request.path.slice(1)

  if (!request.hasOwnProperty('method')) {
    request.method = isString(methodOrParams) ? methodOrParams : 'OBSERVE'
  }

  if (!isString(request.method)) {
    throw new Error("io requires a string method e.g. io('/path', 'OBSERVE')")
  }

  if (!request.hasOwnProperty('params')) {
    request.params = isObjectLike(methodOrParams)
      ? methodOrParams
      : isObjectLike(params) ? params : {}
  }

  if (!isObjectLike(request.params)) {
    throw new Error(
      "io requires an object of params e.g. io('/path', 'OBSERVE', {count: 1})"
    )
  }

  return request
}
