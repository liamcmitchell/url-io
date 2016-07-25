import methods from './methods'
import {pathToArray} from './url'
import {merge} from 'rxjs/observable/merge'
import {of} from 'rxjs/observable/of'
import {Subject} from 'rxjs/Subject'
import {filter} from 'rxjs/operator/filter'
import {pluck} from 'rxjs/operator/pluck'
import {map} from 'rxjs/operator/map'
import {get, set} from './nested'
import {empty} from 'rxjs/observable/empty'

// Requires storage interface.
// https://developer.mozilla.org/en-US/docs/Web/API/Storage
export default function storage(Storage) {
  if (!Storage || !Storage.getItem || !Storage.setItem) {
    throw new Error('Storage interface required (localStorage/sessionStorage)')
  }

  const updates$ = new Subject()

  // TODO: Cleanup? Do we really need to clean up one listener?
  window.addEventListener('storage', ({storageArea, key, newValue}) => {
    if (storageArea === Storage) {
      updates$.next({
        key,
        value: newValue
      })
    }
  })

  return methods({
    OBSERVE: function({path}) {
      const [key, ...objectPath] = pathToArray(path)

      if (!key) {
        throw new Error('Key required for Storage')
      }

      return merge(
        of(JSON.parse(Storage.getItem(key))),
        updates$
          ::filter(u => u.key === key)
          ::pluck('value')
      )
        // Allow getting nested values.
        ::map(v => get(v, objectPath))
    },
    SET: function({path, params: {value}}) {
      const [key, ...objectPath] = pathToArray(path)

      if (!key) {
        throw new Error('Key required for Storage')
      }

      // Allow setting nested values.
      value = set(JSON.parse(Storage.getItem(key)), objectPath, value)

      Storage.setItem(key, JSON.stringify(value === undefined ? null : value))
      updates$.next({key, value})
      return empty()
    }
  })
}
