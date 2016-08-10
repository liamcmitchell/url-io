import {never} from 'rxjs/observable/never'
import {_finally} from 'rxjs/operator/finally'
import {merge} from 'rxjs/operator/merge'
import {publishReplay} from 'rxjs/operator/publishReplay'
import {distinctUntilChanged} from 'rxjs/operator/distinctUntilChanged'

export default function cache(cache = {}) {
  return function cacheRequest(request, source) {
    const {path, method, params} = request

    if (method !== 'OBSERVE') {
      return source(request)
    }

    const key = path + JSON.stringify(params)

    // If there is nothing in the cache, add it.
    if (!cache[key]) {
      // Get observable from wrapped source.
      cache[key] = source(request)
        // Only emit changes.
        ::distinctUntilChanged()
        // Ignore complete by merging never.
        // We only want to remove from cache on unsubscribe.
        ::merge(never())
        // Remove from cache on unsubscribe or error.
        ::_finally(() => { delete cache[key] })
        // Share single copy of original observable.
        ::publishReplay(1).refCount()
    }

    return cache[key]
  }
}
