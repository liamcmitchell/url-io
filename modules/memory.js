import methods from './methods'
import {BehaviorSubject} from 'rxjs/BehaviorSubject'

// Store value using BehaviorSubject.
// Allow deep get and set via path.
export default function memory(initialValue) {
  const subject$ = new BehaviorSubject(initialValue)

  return methods({
    OBSERVE: () => subject$,
    SET: ({params: {value}}) => {
      subject$.next(value)
      return Promise.resolve()
    },
  })
}
