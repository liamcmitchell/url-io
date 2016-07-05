import isPlainObject from 'lodash/isPlainObject'
import {switchMap} from 'rxjs/operator/switchMap'

export default function withIO(urls, source) {
  if (!isPlainObject(urls)) {
    throw new Error('withIO requires a map of io urls')
  }

  if (typeof source !== 'function') {
    throw new Error('withIO requires a source function')
  }

  return function withIO(request) {
    const {method, io} = request

    // TODO: Warn on overwriting keys?
    const withValues = values =>
      source(Object.assign(values, request))

    if (method === 'OBSERVE') {
      return io(urls)::switchMap(withValues)
    }
    else {
      return io(urls).then(withValues)
    }
  }
}