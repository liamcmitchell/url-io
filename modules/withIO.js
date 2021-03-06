import isObjectLike from 'lodash/isObjectLike'
import {isFunction, isObservable} from './util'
import values from 'lodash/values'
import mapValues from 'lodash/mapValues'
import zipObject from 'lodash/zipObject'
import {combineLatest} from 'rxjs'
import {switchMap, take} from 'rxjs/operators'
import {createSafeSource} from './source'
import {isObserveRequest} from './request'

export const withIO = (urls) => (source) => {
  source = createSafeSource(source)

  return createSafeSource((request) => {
    const {io} = request

    const urlsMap = isFunction(urls) ? urls(request) : urls

    if (!isObjectLike(urlsMap)) {
      throw new Error('withIO requires a map of io objects/requests')
    }

    // Turn urls into observables if they aren't already.
    const ioRequests = mapValues(urlsMap, (url) => {
      const observable = isObservable(url) ? url : io(url)

      return isObserveRequest(request)
        ? observable
        : observable.pipe(take(1)).toPromise()
    })

    const continueRequestWithValues = (values) =>
      source(
        Object.assign(
          {},
          request,
          // Resolved values overwrite request values.
          zipObject(Object.keys(ioRequests), values)
        )
      )

    return isObserveRequest(request)
      ? combineLatest(values(ioRequests)).pipe(
          switchMap(continueRequestWithValues)
        )
      : Promise.all(values(ioRequests)).then(continueRequestWithValues)
  })
}
