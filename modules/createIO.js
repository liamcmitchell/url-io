import $$observable from 'symbol-observable'
import {Observable} from 'rxjs/Observable'
import {toPromise} from 'rxjs/operator/toPromise'
import {take} from 'rxjs/operator/take'
import {_throw} from 'rxjs/observable/throw'
import isObservable from './isObservable'
import isPromise from './isPromise'
import {ioRequest} from './url'

// Return consumer friendly API.
export default function createIO(source) {
  if (typeof source !== 'function') {
    throw new Error('Source must be a function')
  }

  const safeSource = request => {
    const {method, path} = request
    try {
      const result = source(request)
      if (method === 'OBSERVE' && !isObservable(result)) {
        return _throw(new Error(`Source for ${path} didn't return Observable`))
      }
      if (method !== 'OBSERVE' && !isPromise(result)) {
        return Promise.reject(new Error(`Source for ${path} didn't return Promise`))
      }
      return result
    }
    catch (error) {
      return method === 'OBSERVE' ?
        _throw(error) :
        Promise.reject(error)
    }
  }

  // Temp object representing observable url.
  // Can be consumed as observable or promise.
  function LazyIO(request) {
    this.request = request
  }

  // Allow use as observable.
  LazyIO.prototype.subscribe = function() {
    const o = safeSource(this.request)
    return o.subscribe.apply(o, arguments)
  }

  // Allow interop using symbol-observable.
  LazyIO.prototype[$$observable] = function() { return this }

  // Allow use with Rx5 operators.
  LazyIO.prototype.lift = Observable.prototype.lift

  // Allow use as promise.
  LazyIO.prototype.then = function() {
    const p = safeSource({
      ...this.request,
      // Allow sources to avoid watching.
      single: true
    })::take(1)::toPromise()
    return p.then.apply(p, arguments)
  }

  // Accept request object like sources or [path, method, params] which
  // should be easier for consumers to work with.
  function io(requestOrPath, methodOrParams, params) {
    const request = ioRequest(requestOrPath, methodOrParams, params)

    const finalRequest = {
      ...request,
      io,
      originalPath: request.path
    }

    // Observe requests return a lazy object that can be reused.
    if (request.method === 'OBSERVE') {
      return new LazyIO(finalRequest)
    }
    // All other requests send the request immediately and return a promise.
    else {
      return safeSource(finalRequest)
    }
  }

  return io
}
