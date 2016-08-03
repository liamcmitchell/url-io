import methods from './methods'
import {BehaviorSubject} from 'rxjs/BehaviorSubject'
import {map} from 'rxjs/operator/map'
import nestedGet from './nestedGet'
import nestedSet from './nestedSet'

// Store value using BehaviorSubject.
// Allow deep get and set via path.
export default function memory(initialValue) {
  const subject = new BehaviorSubject(initialValue)

  return methods({
    OBSERVE: ({path}) =>
      subject::map(v => nestedGet(v, path)),
    SET: ({path, params: {value}}) => {
      subject.next(nestedSet(subject.getValue(), path, value))
      return Promise.resolve()
    }
  })
}
