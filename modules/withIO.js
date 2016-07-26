import isPlainObject from 'lodash/isPlainObject'
import {switchMap} from 'rxjs/operator/switchMap'
import keys from 'lodash/keys'
import values from 'lodash/values'
import mapValues from 'lodash/mapValues'
import zipObject from 'lodash/zipObject'
import {_throw} from 'rxjs/observable/throw'
import {combineLatest} from 'rxjs/observable/combineLatest'

export default function withIO(urls, source) {
  if (!isPlainObject(urls)) {
    throw new Error('withIO requires a map of io urls')
  }

  return function mergeIOintoRequest(request) {
    const {io, method, single = false} = request

    // Throw error if url property name clashes with request property.
    if (keys(urls).some(k => request.hasOwnProperty(k))) {
      const key = keys(urls).find(k => request.hasOwnProperty(k))
      const error = new Error(`withIO property name ${key} clashes with request property`)
      return method === 'OBSERVE' ?
        _throw(error) :
        Promise.reject(error)
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