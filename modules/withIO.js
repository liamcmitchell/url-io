import isPlainObject from 'lodash/isPlainObject'
import {switchMap} from 'rxjs/operator/switchMap'
import keys from 'lodash/keys'
import values from 'lodash/values'
import mapValues from 'lodash/mapValues'
import zipObject from 'lodash/zipObject'
import {combineLatest} from 'rxjs/observable/combineLatest'
import reject from './reject'

export default function withIO(urls) {
  if (!isPlainObject(urls)) {
    throw new Error('withIO requires a map of io urls')
  }

  return function mergeIOintoRequest(request, source) {
    const {io, method, single = false} = request

    // Throw error if url property name clashes with request property.
    if (keys(urls).some(k => request.hasOwnProperty(k))) {
      const key = keys(urls).find(k => request.hasOwnProperty(k))
      return reject(request, `withIO property name ${key} clashes with request property`)
    }

    const ioRequests = mapValues(urls, url => {
      url = typeof url === 'string' ? {path: url} : url
      return io({
        ...url,
        // Only allow observe.
        method: 'OBSERVE',
        // Single read if it's not observable or if single flag is set.
        single: single || method !== 'OBSERVE'
      })
    })

    const continueRequestWithValues = values =>
      source({
        ...zipObject(keys(ioRequests), values),
        ...request
      })

    return method === 'OBSERVE' ?
      combineLatest(values(ioRequests))
        ::switchMap(continueRequestWithValues) :
      Promise.all(values(ioRequests))
        .then(continueRequestWithValues)
  }
}