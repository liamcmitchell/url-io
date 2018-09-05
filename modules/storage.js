import {routes} from './routes'
import {merge, of, fromEventPattern, Subject} from 'rxjs'
import {filter, map} from 'rxjs/operators'

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

  return routes({
    '/:key': {
      OBSERVE: ({key}) => {
        return merge(
          of(Storage.getItem(key)),
          updates$.pipe(
            filter((u) => u.key === key),
            map(({newValue}) => newValue)
          )
        ).pipe(map(safeParse))
      },
      SET: ({key, params: {value}}) => {
        value = JSON.stringify(value === undefined ? null : value)

        Storage.setItem(key, value)
        localUpdates$.next({key, newValue: value})
      },
    },
  })
}
