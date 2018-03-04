import isFunction from 'lodash/isFunction'

export function isObservable(o) {
  return o && isFunction(o.subscribe)
}
