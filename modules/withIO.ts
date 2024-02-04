import {isFunction, isObject, isObservable, toPromise} from './util'
import {Observable, combineLatest} from 'rxjs'
import {switchMap} from 'rxjs/operators'
import {Source, createSafeSource} from './source'
import {isObserveRequest} from './request'

export const withIO =
  (urls: Record<string, string | Observable<unknown>>) => (_source: Source) => {
    const source = createSafeSource(_source)

    return createSafeSource((request) => {
      const {io} = request

      const urlsMap = isFunction(urls) ? urls(request) : urls

      if (!isObject(urlsMap)) {
        throw new Error('withIO requires a map of io objects/requests')
      }

      const keys = Object.keys(urlsMap)

      // Turn urls into observables if they aren't already.
      const ioRequests = Object.values(urlsMap).map((url) => {
        const observable = isObservable(url) ? url : io(url)

        return isObserveRequest(request) ? observable : toPromise(observable)
      })

      const continueRequestWithValues = (values: unknown[]) =>
        source({
          ...request,
          // Resolved values overwrite request values.
          ...Object.fromEntries(keys.map((key, i) => [key, values[i]])),
        })

      return isObserveRequest(request)
        ? combineLatest(ioRequests).pipe(switchMap(continueRequestWithValues))
        : Promise.all(ioRequests).then(continueRequestWithValues)
    })
  }
