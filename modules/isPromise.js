import isFunction from 'lodash/isFunction'

export default function isPromise(o) {
  return o && isFunction(o.then)
}
