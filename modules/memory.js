import methods from './methods'
import {BehaviorSubject} from 'rxjs/BehaviorSubject'
import {map} from 'rxjs/operator/map'
import {get, set} from './nested'

// Store value using BehaviorSubject.
// Allow deep get and set via url.
export default function memory(initialValue) {
  const subject = new BehaviorSubject(initialValue)

  return methods({
    OBSERVE: ({url}) =>
      subject::map(v => get(v, url)),
    SET: ({url, value}) => {
      subject.next(set(subject.getValue(), url, value))
      return Promise.resolve()
    }
  })
}
