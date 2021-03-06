import {never} from 'rxjs'
import {
  finalize,
  merge,
  publishReplay,
  distinctUntilChanged,
} from 'rxjs/operators'
import {markSafeSource, createSafeSource} from './source'
import {isObserveRequest} from './request'

// Deprecated. To remove in next major version.
export const cache = (cache = {}) => (source) => {
  source = createSafeSource(source)

  return markSafeSource((request) => {
    const {path, params} = request

    if (!isObserveRequest(request)) {
      return source(request)
    }

    const key = path + JSON.stringify(params)

    // If there is nothing in the cache, add it.
    if (!cache[key]) {
      // Get observable from wrapped source.
      cache[key] = source(request)
        .pipe(
          // Only emit changes.
          distinctUntilChanged(),
          // Ignore complete by merging never.
          // We only want to remove from cache on unsubscribe.
          merge(never()),
          // Remove from cache on unsubscribe or error.
          finalize(() => {
            delete cache[key]
          }),
          // Share single copy of original observable.
          publishReplay(1)
        )
        .refCount()
    }

    return cache[key]
  })
}
