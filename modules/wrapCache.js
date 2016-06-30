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
  const {url} = request

  return Observable.create(observer => {
    // If there is nothing in the cache, add it.
    if (!cache[url]) {
      // Get observable from wrapped source.
      cache[url] = {
        observable: source(request)
          // Update lastValue.
          ::_do(v => {cache[url].lastValue = v})
          // Ignore complete by merging never.
          // We only want to remove from cache on unsubscribe.
          ::merge(never())
          // Remove from cache.
          ::_finally(() => { delete cache[url] })
          // Share single copy of original observable.
          ::share()
      }
    }

    // Start with last value if possible.
    if (cache[url].hasOwnProperty('lastValue')) {
      return cache[url].observable
        ::startWith(cache[url].lastValue)
        .subscribe(observer)
    }
    else {
      return cache[url].observable
        .subscribe(observer)
    }
  })
}

export default function wrapCache(source) {
  const c = {}

  return function cache(request) {
    if (request.method === 'OBSERVE') {
      // The request isn't completed until subscription.
      return createCacheableObservable(source, c, request)
    }
    else {
      return source(request)
    }
  }
}
