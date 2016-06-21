import isPromise from './isPromise'
import isObservable from './isObservable'

export default function wrapNesting(source) {
  return function nesting(request) {
    const {url, method} = request

    // Return nested observables & promises immediately.
    return isPromise(url) || (method === 'OBSERVE' && isObservable(url)) ?
      url :
      source(request)
  }
}
