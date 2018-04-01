import isPlainObject from 'lodash/isPlainObject'
import isString from 'lodash/isString'
import {Observable} from 'rxjs/Observable'
import {take} from 'rxjs/operators/take'
import {compose} from './compose'
import {cache} from './cache'
import {createSafeSource} from './source'
import {isObserve} from './isObserve'

// Return consumer friendly API.
export const createIO = (source) => {
  // TODO: Move cache out
  source = compose(cache(), createSafeSource)(source)

  class IoObservable extends Observable {
    constructor(request) {
      super()
      this.request = request
    }

    _subscribe(subscriber) {
      return source(this.request).subscribe(subscriber)
    }

    // Allow use as promise.
    then() {
      const promise = this.pipe(take(1)).toPromise()
      return promise.then.apply(promise, arguments)
    }
  }

  // Accept request object like sources or [path, method, params] which
  // should be easier for consumers to work with.
  return function io(requestOrPath, methodOrParams, params) {
    const request = isPlainObject(requestOrPath)
      ? Object.assign({}, requestOrPath)
      : {path: requestOrPath}

    if (!isString(request.path)) {
      throw new Error("io requires a string path e.g. io('/path')")
    }

    if (request.path[0] !== '/') {
      throw new Error(
        "io requires path starting with a slash (/) e.g. io('/path')"
      )
    }

    // Save original path.
    request.originalPath = request.path

    // Remove starting slash (only required at root).
    request.path = request.path.slice(1)

    if (!request.hasOwnProperty('method')) {
      request.method = isString(methodOrParams) ? methodOrParams : 'OBSERVE'
    }

    if (!isString(request.method)) {
      throw new Error("io requires a string method e.g. io('/path', 'OBSERVE')")
    }

    if (!request.hasOwnProperty('params')) {
      request.params = isPlainObject(methodOrParams)
        ? methodOrParams
        : isPlainObject(params) ? params : {}
    }

    if (!isPlainObject(request.params)) {
      throw new Error(
        "io requires an object of params e.g. io('/path', 'OBSERVE', {count: 1})"
      )
    }

    // Add io to request to allow recursion.
    request.io = io

    if (isObserve(request)) {
      // Observe requests return an observable.
      return new IoObservable(request)
    } else {
      // All other requests send the request immediately and return a promise.
      return source(request)
    }
  }
}
