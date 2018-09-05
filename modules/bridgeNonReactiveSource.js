import {Subject, of, merge} from 'rxjs'
import {switchMap, filter} from 'rxjs/operators'
import {createSafeSource} from './source'
import {isObserveRequest} from './request'

const defaultObserveToReadRequest = (request) => {
  return Object.assign({}, request, {
    method: 'GET',
  })
}

const defaultRequestCacheKey = ({path, params}) => {
  return path + JSON.stringify(params)
}

const defaultRequestCacheTime = ({method}) => {
  if (method === 'GET') return 10 * 60 * 1000
}

const defaultRequestCacheInvalidationIterator = ({path, method}) => {
  if (method !== 'GET') {
    return (key) => key.startsWith(path)
  }
}

// Converts observes to gets and manages cache.
export const bridgeNonReactiveSource = ({
  cache = {},
  // request -> request
  observeToReadRequest = defaultObserveToReadRequest,
  // request -> falsy/int
  requestCacheTime = defaultRequestCacheTime,
  // request -> string
  requestCacheKey = defaultRequestCacheKey,
  // request -> fn(string -> bool)
  requestCacheInvalidationIterator = defaultRequestCacheInvalidationIterator,
} = {}) => (source) => {
  source = createSafeSource(source)

  const invalidatedKeys$ = new Subject()

  const remove = (key) => {
    clearTimeout(cache[key].expireTimeoutId)
    delete cache[key]
  }

  const invalidate = (key) => {
    remove(key)
    invalidatedKeys$.next(key)
  }

  const doRequest = (request, canReturnSyncObservable) => {
    const expires = requestCacheTime(request)
    const key = requestCacheKey(request)
    const cacheInvalidationIterator = requestCacheInvalidationIterator(request)
    const canCache = expires && !cacheInvalidationIterator

    // istanbul ignore next
    if (expires && cacheInvalidationIterator) {
      console.warn(
        'Requests that mutate/invalidate cache cannot be cached',
        request
      )
    }

    if (canCache) {
      if (!cache.hasOwnProperty(key)) {
        // Create cache object.
        const cacheEntry = (cache[key] = {})

        // Invalidate on expiry.
        cacheEntry.expireTimeoutId = setTimeout(() => {
          // istanbul ignore else
          if (cache[key] === cacheEntry) invalidate(key)
        }, expires)

        // Do request.
        cacheEntry.promise = source(request).then(
          // Save observable value so we can return it synchronously.
          (value) => {
            cacheEntry.observable = of(value)
            return value
          },
          // Remove self on error.
          (error) => {
            // istanbul ignore else
            if (cache[key] === cacheEntry) remove(key)
            throw error
          }
        )
      }

      const cacheEntry = cache[key]

      if (canReturnSyncObservable && cacheEntry.observable)
        return cacheEntry.observable

      return cacheEntry.promise
    }

    const promise = source(request)

    // Invalidate cache if required.
    if (cacheInvalidationIterator) {
      const invalidateCache = () => {
        Object.keys(cache)
          .filter(cacheInvalidationIterator)
          .forEach(invalidate)
      }
      return promise.then(
        (value) => {
          invalidateCache()
          return value
        },
        (error) => {
          invalidateCache()
          throw error
        }
      )
    }

    return promise
  }

  return createSafeSource((request) => {
    if (!isObserveRequest(request)) {
      return doRequest(request)
    }

    const key = requestCacheKey(request)

    return merge(
      of(true),
      invalidatedKeys$.pipe(filter((k) => k === key))
    ).pipe(switchMap(() => doRequest(observeToReadRequest(request), true)))
  })
}
