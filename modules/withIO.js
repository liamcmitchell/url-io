import isObservable from './isObservable'
import isPlainObject from 'lodash/isPlainObject'
import isFunction from 'lodash/isFunction'
import keys from 'lodash/keys'
import values from 'lodash/values'
import mapValues from 'lodash/mapValues'
import zipObject from 'lodash/zipObject'
import {combineLatest} from 'rxjs/observable/combineLatest'
import {switchMap} from 'rxjs/operators/switchMap'
import {take} from 'rxjs/operators/take'

export default function withIO(urls) {
  return (source) => (request) => {
    const {io, method} = request

    const urlsMap = isFunction(urls) ? urls(request) : urls

    if (!isPlainObject(urlsMap)) {
      throw new Error('withIO requires a map of io objects/requests')
    }

    // Turn urls into observables if they aren't already.
    const ioRequests = mapValues(urlsMap, (url) => {
      const observable = isObservable(url) ? url : io(url)

      return method === 'OBSERVE'
        ? observable
        : observable.pipe(take(1)).toPromise()
    })

    const continueRequestWithValues = (values) =>
      source({
        ...request,
        // Resolved values overwrite request values.
        ...zipObject(keys(ioRequests), values),
      })

    return method === 'OBSERVE'
      ? combineLatest(values(ioRequests)).pipe(
          switchMap(continueRequestWithValues)
        )
      : Promise.all(values(ioRequests)).then(continueRequestWithValues)
  }
}
