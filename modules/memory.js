import methods from './methods'
import {BehaviorSubject} from 'rxjs/BehaviorSubject'
import {map} from 'rxjs/operator/map'
import {get, set} from './nested'
import {empty} from 'rxjs/observable/empty'

// Store value using BehaviorSubject.
// Allow deep get and set via path.
export default function memory(initialValue) {
  const subject = new BehaviorSubject(initialValue)

  return methods({
    OBSERVE: ({path}) =>
      subject::map(v => get(v, path)),
    SET: ({path, params: {value}}) => {
      subject.next(set(subject.getValue(), path, value))
      return empty()
    }
  })
}
