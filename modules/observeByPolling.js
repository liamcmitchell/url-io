import {Subject} from 'rxjs/Subject'
import {switchMap} from 'rxjs/operator/switchMap'
import {filter} from 'rxjs/operator/filter'
import {of} from 'rxjs/observable/of'
import {merge} from 'rxjs/observable/merge'
import {fromPromise} from 'rxjs/observable/fromPromise'

// Observe by polling.
// Values are cached independently of observable lifecycle.
// Any non-observe request should trigger an update.
export default function observeByPolling(options = {}) {
  const {pollMethod = 'GET', cacheExpiry = 10 * 60 * 1000} = options

  const cache = {}
  const expiredKeys$ = new Subject()

  const add = (key, value) => {
    cache[key] = {
      value,
      // Set timeout to remove itself on expiry.
      expireTimeoutId: setTimeout(() => remove(key), cacheExpiry)
    }
  }

  const remove = key => {
    clearTimeout(cache[key].expireTimeoutId)
    delete cache[key]
    expiredKeys$.next(key)
  }

  const clear = path => {
    for (const key in cache) {
      // Delete all keys that start with path, not just exact key.
      // Avoids having to deal with params.
      if (key.startsWith(path)) {
        remove(key)
      }
    }
  }

  return function observeByPolling(request, source) {
    const {path, method, params} = request

    const key = path + JSON.stringify(params)

    if (method === 'OBSERVE') {
      const poll = () => fromPromise(
        source({
          ...request,
          method: pollMethod
        })
          .then(result => {
            add(key, result)
            return result
          })
      )

      return merge(
        cache.hasOwnProperty(key) ?
          // Get from cache if available.
          of(cache[key].value) :
          // Or poll immediately.
          poll(),
        // And poll if expired.
        expiredKeys$
          ::filter(k => k === key)
          ::switchMap(poll)
      )
    }
    else if (method === 'POLL' || method === 'CLEAR_CACHE') {
      clear(path)
      return Promise.resolve()
    }
    else if (method === pollMethod) {
      return source(request)
    }
    // Anything else is considered a mutation so clear cache on resolve/error.
    else {
      const result = source(request)
      result.catch(() => {}).then(() => clear(path))
      return result
    }
  }
}
