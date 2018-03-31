import isString from 'lodash/isString'

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
