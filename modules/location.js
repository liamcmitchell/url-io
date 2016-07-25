import methods from './methods'
import {Observable} from 'rxjs/Observable'
import {map} from 'rxjs/operator/map'
import {publishReplay} from 'rxjs/operator/publishReplay'
import pick from 'lodash/pick'
import {get} from './nested'
import {empty} from 'rxjs/observable/empty'

const locationProperties = [
  'pathname',
  'search',
  'state',
  'action',
  'key'
]

export default function location(history) {
  if (!history || !history.listen || !history.push || !history.getCurrentLocation) {
    throw new Error('History 3 required e.g. https://github.com/ReactJSTraining/history')
  }

  const location$ = Observable.create(observer => {
    observer.next(history.getCurrentLocation())
    return history.listen(::observer.next)
  })
    ::publishReplay(1).refCount()

  return methods({
    // Allow nested gets.
    OBSERVE: ({path}) =>
      location$::map(l => get(l, path)),
    PUSH: ({params}) => {
      history.push(pick(params, locationProperties))
      return empty()
    }
  })
}
