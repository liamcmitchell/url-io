import {Observable, Subscriber, Subscription} from 'rxjs'
import {Request, cacheKey} from './request'
import {noop, toPromise} from './util'
import {Source} from './source'

interface CacheEntry {
  hasValue: boolean
  value: unknown
  hasError: boolean
  error: unknown
  subscribers: Set<Subscriber<unknown>>
  subscription?: Subscription
}
type Cache = Record<string, CacheEntry>

export class IOObservable<T = unknown> extends Observable<T> {
  constructor(
    private _source: Source,
    private _request: Request,
    private _cache: Cache
  ) {
    super()
  }

  _subscribe(subscriber: Subscriber<unknown>) {
    const key = cacheKey(this._request)

    if (!this._cache[key]) {
      const cacheEntry: CacheEntry = {
        hasValue: false,
        value: undefined,
        hasError: false,
        error: undefined,
        subscribers: new Set(),
      }
      cacheEntry.subscription = (
        this._source(this._request) as Observable<unknown>
      ).subscribe({
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
        cacheEntry.subscription?.unsubscribe()
        delete this._cache[key]
      }
    })
  }

  // Override.
  toPromise(): Promise<T | undefined> {
    return toPromise(this) as Promise<T | undefined>
  }

  // Allow use as promise.
  then<TResult1 = T, TResult2 = never>(
    onfulfilled?:
      | ((value: T) => TResult1 | PromiseLike<TResult1>)
      | undefined
      | null,
    onrejected?:
      | ((reason: unknown) => TResult2 | PromiseLike<TResult2>)
      | undefined
      | null
  ): Promise<TResult1 | TResult2>
  then(
    onFulfilled: (value: unknown) => unknown,
    onRejected: (reason: unknown) => unknown
  ) {
    return this.toPromise().then(onFulfilled, onRejected)
  }

  // Allow use as promise.
  catch<TResult = never>(
    onrejected?:
      | ((reason: unknown) => TResult | PromiseLike<TResult>)
      | undefined
      | null
  ): Promise<T | TResult>
  catch(onRejected: (reason: unknown) => unknown) {
    return this.toPromise().catch(onRejected)
  }
}
