import isFunction from 'lodash/isFunction'

export default function isObservable(o) {
  return o && isFunction(o.subscribe)
}
