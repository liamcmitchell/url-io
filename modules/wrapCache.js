import {Observable} from 'rxjs/Observable'
import {never} from 'rxjs/observable/never'
import {_do} from 'rxjs/operator/do'
import {_finally} from 'rxjs/operator/finally'
import {share} from 'rxjs/operator/share'
import {startWith} from 'rxjs/operator/startWith'
import {merge} from 'rxjs/operator/merge'

// A cacheable observable needs to add itself to the cache on subscription
// and remove itself on unsubscribe.
function createCacheableObservable(source, cache, request) {
  const {path, params} = request
  const key = path + JSON.stringify(params)

  return Observable.create(observer => {
    // If there is nothing in the cache, add it.
    if (!cache[key]) {
      // Get observable from wrapped source.
      cache[key] = {
        observable: source(request)
          // Update lastValue.
          ::_do(v => { cache[key].lastValue = v })
          // Ignore complete by merging never.
          // We only want to remove from cache on unsubscribe.
          ::merge(never())
          // Remove from cache.
          ::_finally(() => { delete cache[key] })
          // Share single copy of original observable.
          ::share()
      }
    }

    // Start with last value if possible.
    if (cache[key].hasOwnProperty('lastValue')) {
      return cache[key].observable
        ::startWith(cache[key].lastValue)
        .subscribe(observer)
    }
    else {
      return cache[key].observable
        .subscribe(observer)
    }
  })
}

export default function wrapCache(source) {
  const c = {}

  return function cache(request) {
    const {method} = request

    if (method === 'OBSERVE') {
      // The request isn't completed until subscription.
      return createCacheableObservable(source, c, request)
    }
    else {
      return source(request)
    }
  }
}
