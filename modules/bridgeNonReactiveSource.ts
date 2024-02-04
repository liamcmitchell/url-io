import {Subject, of, merge, Observable} from 'rxjs'
import {switchMap, filter} from 'rxjs/operators'
import {Source, createSafeSource} from './source'
import {Request, isObserveRequest} from './request'

const defaultObserveToReadRequest = (request: Request) => {
  return {
    ...request,
    method: 'GET',
  }
}

const defaultRequestCacheKey = ({path, params}: Request) => {
  return path + JSON.stringify(params)
}

const defaultRequestCacheTime = ({method}: Request) => {
  if (method === 'GET') return 10 * 60 * 1000
}

const defaultRequestCacheInvalidationIterator = ({path, method}: Request) => {
  if (method !== 'GET') {
    return (key: string) => key.startsWith(path)
  }
}

interface CacheEntry {
  expireTimeoutId?: ReturnType<typeof setTimeout>
  promise?: Promise<unknown>
  observable?: Observable<unknown>
}

interface Options {
  cache?: Record<string, CacheEntry>
  observeToReadRequest?(request: Request): Request
  requestCacheTime?(request: Request): number | undefined
  requestCacheKey?(request: Request): string
  requestCacheInvalidationIterator?(
    request: Request
  ): undefined | ((key: string) => boolean)
}

// Converts observes to gets and manages cache.
export const bridgeNonReactiveSource =
  ({
    cache = {},
    observeToReadRequest = defaultObserveToReadRequest,
    requestCacheTime = defaultRequestCacheTime,
    requestCacheKey = defaultRequestCacheKey,
    requestCacheInvalidationIterator = defaultRequestCacheInvalidationIterator,
  }: Options = {}) =>
  (source: Source) => {
    source = createSafeSource(source)

    const invalidatedKeys$ = new Subject()

    const remove = (key: string) => {
      clearTimeout(cache[key].expireTimeoutId)
      delete cache[key]
    }

    const invalidate = (key: string) => {
      remove(key)
      invalidatedKeys$.next(key)
    }

    const doRequest = (
      request: Request,
      canReturnSyncObservable?: boolean
    ): Promise<unknown> | Observable<unknown> => {
      const expires = requestCacheTime(request)
      const key = requestCacheKey(request)
      const cacheInvalidationIterator =
        requestCacheInvalidationIterator(request)
      const canCache = expires && !cacheInvalidationIterator

      // istanbul ignore next
      if (expires && cacheInvalidationIterator) {
        console.warn(
          'Requests that mutate/invalidate cache cannot be cached',
          request
        )
      }

      if (canCache) {
        if (!Object.prototype.hasOwnProperty.call(cache, key)) {
          // Create cache object.
          const cacheEntry: CacheEntry = (cache[key] = {})

          // Invalidate on expiry.
          cacheEntry.expireTimeoutId = setTimeout(() => {
            // istanbul ignore else
            if (cache[key] === cacheEntry) invalidate(key)
          }, expires)

          // Do request.
          cacheEntry.promise = (source(request) as Promise<unknown>).then(
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

        return cacheEntry.promise as Promise<unknown>
      }

      const promise = source(request) as Promise<unknown>

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
