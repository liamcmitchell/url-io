import {methods} from './method'
import {paths} from './path'
import {merge} from 'rxjs/observable/merge'
import {of} from 'rxjs/observable/of'
import {_throw} from 'rxjs/observable/throw'
import {Subject} from 'rxjs/Subject'
import {filter} from 'rxjs/operators/filter'
import {pluck} from 'rxjs/operators/pluck'

// Safe parse. Returning null should be safe, same result when key does not exist.
const parse = (string) => {
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

  const updates$ = new Subject()

  // TODO: Cleanup? Do we really need to clean up one listener?
  window.addEventListener('storage', ({storageArea, key, newValue}) => {
    if (storageArea === Storage) {
      updates$.next({
        key,
        value: parse(newValue),
      })
    }
  })

  return paths({
    '/:key': methods({
      OBSERVE: function({key}) {
        if (!key) {
          return _throw(new Error('Key required for Storage'))
        }

        return merge(
          of(parse(Storage.getItem(key))),
          updates$.pipe(filter((u) => u.key === key), pluck('value'))
        )
      },
      SET: function({key, params: {value}}) {
        if (!key) {
          return Promise.reject(new Error('Key required for Storage'))
        }

        Storage.setItem(key, JSON.stringify(value === undefined ? null : value))
        updates$.next({key, value})
        return Promise.resolve()
      },
    }),
  })
}
