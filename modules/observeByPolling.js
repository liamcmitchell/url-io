import {Subject} from 'rxjs/Subject'
import {interval} from 'rxjs/observable/interval'
import {switchMap} from 'rxjs/operator/switchMap'
import {filter} from 'rxjs/operator/filter'
import {startWith} from 'rxjs/operator/startWith'

// Observes by repeated polling.
// Any non-observe request will trigger an update.
export default function observeByPolling(options = {}) {
  const {pollMethod = 'GET', pollInterval = 10 * 60 * 1000} = options

  // Used to trigger updates.
  const trigger$ = new Subject()

  return function observeByPolling(request, source) {
    const {path, method} = request

    if (method === 'OBSERVE') {
      // Triggers
      return trigger$
        ::filter(p => p === path)
        // Send trigger immediately
        ::startWith(null)
        // Turn into an interval
        ::switchMap(() =>
          interval(pollInterval)
            // And make sure we are still starting immediately.
            ::startWith(null)
        )
        // Turn into request
        ::switchMap(() =>
          source({
            ...request,
            method: pollMethod
          })
        )
    }
    else if (method === 'POLL') {
      trigger$.next(path)
      return Promise.resolve()
    }
    // Anything else is considered a mutation and observable should update.
    else {
      const result = source(request)
      result.catch(() => {}).then(() => trigger$.next(path))
      return result
    }
  }
}
