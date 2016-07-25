import isString from 'lodash/isString'
import isArray from 'lodash/isArray'
import filter from 'lodash/filter'

// Returns standard io request object with defaults.
// Errors if API is misused.
export function ioRequest(requestOrPath, methodOrParams, params) {
  const request = typeof requestOrPath === 'object' ?
    {...requestOrPath} :
    {path: requestOrPath}

  if (!request.hasOwnProperty('method')) {
    request.method = typeof methodOrParams === 'string' ?
      methodOrParams :
      'OBSERVE'
  }

  if (!request.hasOwnProperty('params')) {
    request.params = typeof methodOrParams === 'object' ?
      methodOrParams :
      typeof params === 'object' ?
          params :
          {}
  }

  if (typeof request.path !== 'string') {
    throw new Error("io requires a string path e.g. io(\'/path\')")
  }

  if (typeof request.method !== 'string') {
    throw new Error("io requires a string method e.g. io('/path', 'OBSERVE')")
  }

  if (typeof request.params !== 'object') {
    throw new Error("io requires an object of params e.g. io('/path', 'OBSERVE', {count: 1})")
  }

  return request
}

export function arrayToPath(path) {
  return isString(path) ?
    path :
    '/' + path.join('/')
}

export function pathToArray(path) {
  return isArray(path) ?
    path :
    filter(path.split('/'))
}
