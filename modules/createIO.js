import {toRequest, isObserveRequest, cacheKey} from './request'
import {IOObservable} from './IOObservable'
import {createSafeSource} from './source'
import debounce from 'lodash/debounce'
import keys from 'lodash/keys'

// Return consumer friendly API.
export const createIO = (source) => {
  source = createSafeSource(source)

  const cache = {}

  const cleanCache = debounce(() => {
    keys(cache).forEach((key) => {
      const observable = cache[key]
      if (observable._refCount <= 0) {
        delete cache[key]
        delete observable.cleanCache
        observable.disconnect()
      }
    })
  })

  // Accept request object like sources or [path, method, params] which
  // should be easier for consumers to work with.
  return function io(requestOrPath, methodOrParams, params) {
    const request = toRequest(requestOrPath, methodOrParams, params)

    // Add io to request to allow recursion.
    request.io = io

    if (!isObserveRequest(request)) {
      return source(request)
    }

    const key = cacheKey(request)

    // If there is nothing in the cache, add it.
    if (!cache.hasOwnProperty(key)) {
      cache[key] = new IOObservable(source(request), cleanCache)
      // And call clean just in case it is requested but never used.
      cleanCache()
    }

    return cache[key]
  }
}
