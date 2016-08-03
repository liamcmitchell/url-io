import isArray from 'lodash/isArray'
import clone from 'lodash/clone'
import pathToArray from './pathToArray'

export default function nestedSet(object, path, value) {
  path = pathToArray(path)

  if (path.length === 0) {
    return value
  }

  const key = isArray(object) ? parseInt(path[0], 10) : path[0]
  const newObject = clone(object)

  newObject[key] = nestedSet(object[key], path.slice(1), value)

  return newObject
}
