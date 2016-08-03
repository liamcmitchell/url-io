import isArray from 'lodash/isArray'
import pathToArray from './pathToArray'

export default function nestedGet(object, path) {
  path = pathToArray(path)

  return path.reduce((o, key) =>
    o[isArray(o) ? parseInt(key, 10) : key]
  , object)
}
