import isArray from 'lodash/isArray'
import filter from 'lodash/filter'

export default function pathToArray(path) {
  return isArray(path) ? path : filter(path.split('/'))
}
