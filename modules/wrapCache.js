import {Observable} from 'rxjs/Observable'
import {_do} from 'rxjs/operator/do'
import {_finally} from 'rxjs/operator/finally'
import {share} from 'rxjs/operator/share'
import {startWith} from 'rxjs/operator/startwith'

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
          ::_do(v => {cache[url].lastValue = v})
          ::_finally(() => {delete cache[url]})
          ::share()
      }
    }

    // Start with last value if possible.
    if (cache[url].hasOwnProperty('lastValue')) {
      return startWith(cache[url].observable, cache[url].lastValue)
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
