import {Observable} from 'rxjs'

export const isString = (o: unknown): o is string => typeof o === 'string'

export const isObject = (o: unknown): o is object =>
  Boolean(o && typeof o === 'object')

// eslint-disable-next-line @typescript-eslint/ban-types
export const isFunction = (o: unknown): o is Function => typeof o === 'function'

export const isObservable = (o: unknown): o is Observable<unknown> =>
  Boolean(o && isFunction((o as Observable<unknown>).subscribe))

export const isPromise = (o: unknown): o is Promise<unknown> =>
  Boolean(o && isFunction((o as Promise<unknown>).then))

export const noop = () => {}

// When used as a promise, we only want the first value.
export const toPromise = (o: Observable<unknown>): Promise<unknown> =>
  new Promise<unknown>((resolve, reject) => {
    let subscribed = false
    let resolved = false
    const subscription = o.subscribe({
      next: (value) => {
        if (subscribed) {
          subscription.unsubscribe()
        }
        resolve(value)
        resolved = true
      },
      error: reject,
      complete: noop,
    })
    subscribed = true
    if (resolved) {
      subscription.unsubscribe()
    }
  })
