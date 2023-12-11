import {isFunction, isObject, isObservable} from './util'
import {combineLatest} from 'rxjs'
import {switchMap, take} from 'rxjs/operators'
import {createSafeSource} from './source'
import {isObserveRequest} from './request'

export const withIO = (urls) => (source) => {
  source = createSafeSource(source)

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

      return isObserveRequest(request)
        ? observable
        : observable.pipe(take(1)).toPromise()
    })

    const continueRequestWithValues = (values) =>
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
