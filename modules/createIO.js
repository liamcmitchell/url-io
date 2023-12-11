import {toRequest, isObserveRequest} from './request'
import {IOObservable} from './IOObservable'
import {createSafeSource} from './source'

// Return consumer friendly API.
export const createIO = (source) => {
  source = createSafeSource(source)

  const cache = {}

  // Accept request object like sources or [path, method, params] which
  // should be easier for consumers to work with.
  return function io(requestOrPath, methodOrParams, params) {
    const request = toRequest(requestOrPath, methodOrParams, params)

    // Add io to request to allow recursion.
    request.io = io

    if (!isObserveRequest(request)) {
      return source(request)
    }

    return new IOObservable(source, request, cache)
  }
}
