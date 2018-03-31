import {Subject} from 'rxjs/Subject'
import {switchMap} from 'rxjs/operators/switchMap'
import {filter} from 'rxjs/operators/filter'
import {of} from 'rxjs/observable/of'
import {merge} from 'rxjs/observable/merge'
import {createSafeSource} from './source'

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
export const bridgeNonReactiveSource = (options = {}) => {
  const {
    cache = {},
    // request -> request
    observeToReadRequest = defaultObserveToReadRequest,
    // request -> falsy/int
    requestCacheTime = defaultRequestCacheTime,
    // request -> string
    requestCacheKey = defaultRequestCacheKey,
    // request -> fn(string -> bool)
    requestCacheInvalidationIterator = defaultRequestCacheInvalidationIterator,
  } = options

  const expiredKeys$ = new Subject()

  const add = (key, value, expiry) => {
    // May already have been added, remove older value.
    if (cache[key]) {
      clearTimeout(cache[key].expireTimeoutId)
    }
    cache[key] = {
      value,
      // Set timeout to remove itself on expiry.
      expireTimeoutId: setTimeout(() => remove(key), expiry),
    }
  }

  const remove = (key) => {
    clearTimeout(cache[key].expireTimeoutId)
    delete cache[key]
    expiredKeys$.next(key)
  }

  const clear = (iterator) => {
    Object.keys(cache)
      .filter(iterator)
      .forEach((key) => remove(key))
  }

  return (source) => {
    source = createSafeSource(source)

    const doRequest = (request) => {
      const cacheTime = requestCacheTime(request)
      const cacheKey = requestCacheKey(request)
      const cacheInvalidationIterator = requestCacheInvalidationIterator(
        request
      )
      const canCache = cacheTime && !cacheInvalidationIterator

      if (cacheTime && cacheInvalidationIterator) {
        console.warn(
          'Requests that mutate/invalidate cache cannot be cached',
          request
        )
      }

      // Return from cache if possible.
      if (canCache && cache.hasOwnProperty(cacheKey)) {
        return Promise.resolve(cache[cacheKey].value)
      }

      const result = source(request)

      // Add to cache if possible.
      if (canCache) {
        result.then((value) => add(cacheKey, value, cacheTime))
      }

      // Invalidate cache if required.
      if (cacheInvalidationIterator) {
        result
          // Ignore error, clearing cache is conservative option.
          .catch(() => {})
          .then(() => clear(cacheInvalidationIterator))
      }

      return result
    }

    return createSafeSource((request) => {
      const {method} = request

      if (method === 'OBSERVE') {
        const key = requestCacheKey(request)

        const read = () =>
          cache.hasOwnProperty(key)
            ? // Get directly from cache if available.
              of(cache[key].value)
            : // Or read immediately.
              doRequest(observeToReadRequest(request), source)

        return merge(
          read(),
          expiredKeys$.pipe(filter((k) => k === key), switchMap(read))
        )
      } else {
        return doRequest(request, source)
      }
    })
  }
}
