import {methods} from './method'
import {paths} from './path'
import {merge} from 'rxjs/observable/merge'
import {of} from 'rxjs/observable/of'
import {_throw} from 'rxjs/observable/throw'
import {fromEventPattern} from 'rxjs/observable/fromEventPattern'
import {Subject} from 'rxjs/Subject'
import {filter} from 'rxjs/operators/filter'
import {map} from 'rxjs/operators/map'

// Safe parse. Returning null should be safe, same result when key does not exist.
const safeParse = (string) => {
  try {
    return JSON.parse(string)
  } catch (e) {
    return null
  }
}

// Requires storage interface.
// https://developer.mozilla.org/en-US/docs/Web/API/Storage
export const storage = (Storage) => {
  if (!Storage || !Storage.getItem || !Storage.setItem) {
    throw new Error('Storage interface required (localStorage/sessionStorage)')
  }

  const localUpdates$ = new Subject()

  const updates$ = merge(
    localUpdates$,
    fromEventPattern(
      (handler) => window.addEventListener('storage', handler),
      (handler) => window.removeEventListener('storage', handler)
    ).pipe(filter(({storageArea}) => storageArea === Storage))
  )

  return paths({
    '/:key': methods({
      OBSERVE: ({key}) => {
        if (!key) {
          return _throw(new Error('Key required for Storage'))
        }

        return merge(
          of(Storage.getItem(key)),
          updates$.pipe(
            filter((u) => u.key === key),
            map(({newValue}) => newValue)
          )
        ).pipe(map(safeParse))
      },
      SET: ({key, params: {value}}) => {
        if (!key) {
          return Promise.reject(new Error('Key required for Storage'))
        }

        value = JSON.stringify(value === undefined ? null : value)

        Storage.setItem(key, value)
        localUpdates$.next({key, newValue: value})
      },
    }),
  })
}
