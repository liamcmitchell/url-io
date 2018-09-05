import {routes} from './routes'
import {BehaviorSubject} from 'rxjs'

// Store value using BehaviorSubject.
// Allow deep get and set via path.
export const memory = (initialValue) => {
  const subject$ = new BehaviorSubject(initialValue)

  return routes({
    OBSERVE: () => subject$,
    SET: ({params: {value}}) => {
      subject$.next(value)
    },
  })
}
