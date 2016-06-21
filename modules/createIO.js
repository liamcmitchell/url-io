import {toPromise} from 'rxjs/operator/toPromise'
import {take} from 'rxjs/operator/take'

// Return URL first API.
export default function createIO(source, methods = {}) {
  if (typeof source !== 'function') {
    throw new Error('Source must be a function')
  }

  // The temp object to chain methods off.
  function ioURL(url) {
    this.url = url
  }

  // Add methods to prototype.
  ioURL.prototype = Object.assign(methods, {
    // Make request to source.
    // Method OBSERVE returns observable, all others return promise.
    request: function(request) {
      return source(Object.assign({}, request, {
        url: this.url,
        // Pass this interface so sources can recurse.
        io
      }))
    },

    // Allows use as observable.
    subscribe: function() {
      const o = this.request({method: 'OBSERVE'})
      return o.subscribe.apply(o, arguments)
    },

    // Allows use as promise.
    next: function() {
      // We send an observer instead of a promise because we don't want to
      // support two different read methods and we will always prefer
      // observe. The single bool is there for read once optimizations.
      const p = this.request({
        method: 'OBSERVE',
        // Allow sources to avoid watching.
        single: true
      })::take(1)::toPromise()
      return p.next.apply(p, arguments)
    }
  })

  function io(url) {
    if (!url) {
      throw new Error('Url required e.g. io(url)')
    }
    return new ioURL(url)
  }

  return io
}
