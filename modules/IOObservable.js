import {Observable, Subscription} from 'rxjs'
import {cacheKey} from './request'
import {noop} from './util'

export class IOObservable extends Observable {
  constructor(source, request, cache) {
    super()
    this._source = source
    this._request = request
    this._cache = cache
  }

  _subscribe(subscriber) {
    const key = cacheKey(this._request)

    if (!this._cache[key]) {
      const cacheEntry = {
        hasValue: false,
        value: undefined,
        hasError: false,
        error: undefined,
        subscribers: new Set(),
      }
      cacheEntry.subscription = this._source(this._request).subscribe({
        next(value) {
          if (cacheEntry.hasValue && cacheEntry.value === value) return
          cacheEntry.hasValue = true
          cacheEntry.value = value
          for (const subscriber of cacheEntry.subscribers) {
            subscriber.next(value)
          }
        },
        error(error) {
          cacheEntry.hasError = true
          cacheEntry.error = error
          for (const subscriber of cacheEntry.subscribers) {
            subscriber.error(error)
          }
        },
        complete: noop,
      })
      this._cache[key] = cacheEntry
    }

    const cacheEntry = this._cache[key]

    cacheEntry.subscribers.add(subscriber)

    if (cacheEntry.hasError) {
      subscriber.error(cacheEntry.error)
    } else if (cacheEntry.hasValue) {
      subscriber.next(cacheEntry.value)
    }

    return new Subscription(() => {
      cacheEntry.subscribers.delete(subscriber)
      if (cacheEntry.subscribers.size === 0) {
        cacheEntry.subscription.unsubscribe()
        delete this._cache[key]
      }
    })
  }

  // When used as a promise, we only want the first value.
  toPromise() {
    return new Promise((resolve, reject) => {
      let subscribed = false
      let resolved = false
      const subscription = this.subscribe({
        next: (value) => {
          if (subscribed) {
            subscription.unsubscribe()
          }
          resolved = true
          resolve(value)
        },
        error: reject,
        complete: noop,
      })
      subscribed = true
      if (resolved) {
        subscription.unsubscribe()
      }
    })
  }

  // Allow use as promise.
  then(onFulfilled, onRejected) {
    return this.toPromise().then(onFulfilled, onRejected)
  }

  // Allow use as promise.
  catch(onRejected) {
    return this.toPromise().catch(onRejected)
  }
}
