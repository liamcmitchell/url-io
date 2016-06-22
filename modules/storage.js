import methods from './methods'
import {urlToArray} from './url'
import {merge} from 'rxjs/observable/merge'
import {of} from 'rxjs/observable/of'
import {Subject} from 'rxjs/Subject'
import {filter} from 'rxjs/operator/filter'
import {pluck} from 'rxjs/operator/pluck'

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
    OBSERVE: function({url}) {
      const [key, next] = urlToArray(url)

      if (!key) {
        throw new Error('Key required for Storage')
      }

      if (next) {
        throw new Error('Deep linking not supported')
      }

      return merge(
        of(JSON.parse(Storage.getItem(key))),
        updates$
          ::filter(u => u.key === key)
          ::pluck('value')
      )
    },
    SET: function({url, value}) {
      const [key, next] = urlToArray(url)

      if (!key) {
        throw new Error('Key required for Storage')
      }

      if (next) {
        throw new Error('Deep linking not supported')
      }

      Storage.setItem(key, JSON.stringify(value))
      updates$.next({key, value})
      return Promise.resolve()
    }
  })
}
