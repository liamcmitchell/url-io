import $$observable from 'symbol-observable'
import {Observable} from 'rxjs/Observable'
import {toPromise} from 'rxjs/operator/toPromise'
import {take} from 'rxjs/operator/take'
import {_throw} from 'rxjs/observable/throw'
import isObservable from './isObservable'
import {ioRequest} from './url'

// Return consumer friendly API.
export default function createIO(source) {
  if (typeof source !== 'function') {
    throw new Error('Source must be a function')
  }

  const safeSource = request => {
    try {
      const result = source(request)
      if (!isObservable(result)) {
        return _throw(new Error(`Source for ${request.path} didn't return observable`))
      }
      return result
    }
    catch (error) {
      return _throw(error)
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
    // All other requests send the request immediately and return an
    // object representing the result.
    else {
      const result = safeSource(finalRequest)
        // Should only emit one value.
        ::take(1)

      // Allow consuming as promise.
      if (typeof result.then !== 'function') {
        const promise = result::toPromise()
        result.then = ::promise.then
        result.catch = ::promise.catch
      }

      return result
    }
  }

  return io
}
