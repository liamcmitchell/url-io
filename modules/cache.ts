import {markSafeSource, createSafeSource, Source} from './source'
import {isObserveRequest} from './request'
import {IOObservable} from './IOObservable'

/** @deprecated */
export const cache =
  (cache = {}) =>
  (source: Source) => {
    source = createSafeSource(source)

    return markSafeSource((request) => {
      if (!isObserveRequest(request)) {
        return source(request)
      }

      return new IOObservable(source, request, cache)
    })
  }
