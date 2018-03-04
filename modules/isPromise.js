import isFunction from 'lodash/isFunction'

export function isPromise(o) {
  return o && isFunction(o.then)
}
