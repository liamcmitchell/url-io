import isPlainObject from 'lodash/isPlainObject'
import {switchMap} from 'rxjs/operator/switchMap'
import keys from 'lodash/keys'
import values from 'lodash/values'
import mapValues from 'lodash/mapValues'
import zipObject from 'lodash/zipObject'
import {combineLatest} from 'rxjs/observable/combineLatest'

export default function withIO(urls) {
  return source => request => {
    const {io, method} = request

    const urlsMap = typeof urls === 'function' ?
      urls(request) :
      urls

    if (!isPlainObject(urlsMap)) {
      throw new Error('withIO requires a map of io objects/requests')
    }

    // Turn urls into observables if they aren't already.
    const ioRequests = mapValues(urlsMap, url =>
      typeof url.subscribe === 'function' ?
        url :
        io(url)
    )

    const continueRequestWithValues = values =>
      source({
        ...request,
        // Resolved values overwrite request values.
        ...zipObject(keys(ioRequests), values),
      })

    return method === 'OBSERVE' ?
      combineLatest(values(ioRequests))
        ::switchMap(continueRequestWithValues) :
      Promise.all(values(ioRequests))
        .then(continueRequestWithValues)
  }
}