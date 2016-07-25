import isPlainObject from 'lodash/isPlainObject'
import {switchMap} from 'rxjs/operator/switchMap'
import combineLatestMap from './combineLatestMap'
import keys from 'lodash/keys'
import mapValues from 'lodash/mapValues'
import {_throw} from 'rxjs/observable/throw'

export default function withIO(urls, source) {
  if (!isPlainObject(urls)) {
    throw new Error('withIO requires a map of io urls')
  }

  return function mergeIOintoRequest(request) {
    const {io, single = false} = request

    // Throw error if url property name clashes with request property.
    if (keys(urls).some(k => request.hasOwnProperty(k))) {
      const key = keys(urls).find(k => request.hasOwnProperty(k))
      return _throw(new Error(`withIO property name ${key} clashes with request property`))
    }

    // Pass on single flag from current request.
    return combineLatestMap(mapValues(urls, url => {
      url = typeof url === 'string' ? {path: url} : url
      return io({...url, single})
    }))
      ::switchMap(values => source(Object.assign(values, request)))
  }
}