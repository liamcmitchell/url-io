import {never} from 'rxjs/observable/never'
import {finalize} from 'rxjs/operators/finalize'
import {merge} from 'rxjs/operators/merge'
import {publishReplay} from 'rxjs/operators/publishReplay'
import {distinctUntilChanged} from 'rxjs/operators/distinctUntilChanged'

export function cache(cache = {}) {
  return (source) => (request) => {
    const {path, method, params} = request

    if (method !== 'OBSERVE') {
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
  }
}
