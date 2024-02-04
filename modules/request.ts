import {IO} from './createIO'
import {isObject, isString} from './util'

export const reservedRequestKeys = [
  'io',
  'path',
  'originalPath',
  'method',
  'params',
]

export const ensureRequestKey = (key: string) => {
  if (!isString(key) || !/^[a-z]/.test(key))
    throw new Error(`Request key must be a string matching /^[a-z]/ (${key})`)

  if (reservedRequestKeys.includes(key))
    throw new Error(`Request key is reserved (${key})`)
}

export type Params = Record<string, unknown>

export interface Request extends Record<string, unknown> {
  io: IO
  originalPath: string
  path: string
  method: string
  params: Params
}

export const isObserveRequest = (request: Request) =>
  request.method === 'OBSERVE'

export const cacheKey = ({path, params}: Request) =>
  path + JSON.stringify(params)

export const toRequest = (
  requestOrPath: Request | string,
  methodOrParams?: string | Params,
  params?: Params
): Request => {
  const request = isString(requestOrPath)
    ? ({
        path: requestOrPath,
        method: isString(methodOrParams) ? methodOrParams : undefined,
        params: isString(methodOrParams) ? params : methodOrParams,
      } as Request)
    : {...requestOrPath}

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

  request.method ??= 'OBSERVE'

  if (!isString(request.method)) {
    throw new Error("io requires a string method e.g. io('/path', 'OBSERVE')")
  }

  request.params ??= {}

  if (!isObject(request.params)) {
    throw new Error(
      "io requires an object of params e.g. io('/path', 'OBSERVE', {count: 1})"
    )
  }

  return request
}
