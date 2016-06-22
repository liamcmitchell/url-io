import methods from './methods'
import {urlToArray} from './url'
import {BehaviorSubject} from 'rxjs/BehaviorSubject'
import {map} from 'rxjs/operator/map'
import isArray from 'lodash/isArray'
import clone from 'lodash/clone'

// Get nested value.
function get(path, object) {
  return path.reduce((o, key) =>
    o[isArray(o) ? parseInt(key, 10) : key]
  , object)
}

// Set nested value. Returns cloned object.
function set(path, object, value) {
  if (path.length === 0) {
    return value
  }

  const key = isArray(object) ? parseInt(path[0], 10) : path[0]
  const newObject = clone(object)

  newObject[key] = set(path.slice(1), object[key], value)

  return newObject
}

// Store value using BehaviorSubject.
// Allow deep get and set via url.
export default function memory(initialValue) {
  const subject = new BehaviorSubject(initialValue)

  return methods({
    OBSERVE: ({url}) =>
      subject::map(get.bind(null, urlToArray(url))),
    SET: ({url, value}) => {
      subject.next(set(urlToArray(url), subject.getValue(), value))
      return Promise.resolve()
    }
  })
}
