import {routes} from './routes'
import {merge, of, fromEventPattern, Subject} from 'rxjs'
import {filter, map} from 'rxjs/operators'

// Safe parse. Returning null should be safe, same result when key does not exist.
const safeParse = (string: unknown) => {
  try {
    return JSON.parse(string as string)
  } catch (e) {
    return null
  }
}

interface StorageEvent {
  key: string
  newValue: string
  storageArea?: Storage
}

// Requires storage interface.
// https://developer.mozilla.org/en-US/docs/Web/API/Storage
export const storage = (Storage: Storage) => {
  if (!Storage || !Storage.getItem || !Storage.setItem) {
    throw new Error('Storage interface required (localStorage/sessionStorage)')
  }

  const localUpdates$ = new Subject<StorageEvent>()

  const updates$ = merge(
    localUpdates$,
    fromEventPattern<StorageEvent>(
      (handler) => window.addEventListener('storage', handler),
      (handler) => window.removeEventListener('storage', handler)
    ).pipe(filter(({storageArea}) => storageArea === Storage))
  )

  return routes({
    '/:key': {
      OBSERVE: ({key}) => {
        return merge(
          of(Storage.getItem(key as string)),
          updates$.pipe(
            filter((u) => u.key === key),
            map(({newValue}) => newValue)
          )
        ).pipe(map(safeParse))
      },
      SET: ({key, params: {value}}) => {
        // Undefined can not be stringified, save as empty string instead.
        // This will be read back as null in safeParse.
        const newValue = value === undefined ? '' : JSON.stringify(value)

        Storage.setItem(key as string, newValue)
        localUpdates$.next({key: key as string, newValue})
      },
    },
  })
}
