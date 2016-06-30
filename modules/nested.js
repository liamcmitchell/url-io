import isArray from 'lodash/isArray'
import clone from 'lodash/clone'
import {urlToArray} from './url'

export function get(object, path) {
  path = urlToArray(path)

  return path.reduce((o, key) =>
    o[isArray(o) ? parseInt(key, 10) : key]
  , object)
}

export function set(object, path, value) {
  path = urlToArray(path)

  if (path.length === 0) {
    return value
  }

  const key = isArray(object) ? parseInt(path[0], 10) : path[0]
  const newObject = clone(object)

  newObject[key] = set(object[key], path.slice(1), value)

  return newObject
}
