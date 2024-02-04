import {toRequest, isObserveRequest, Request, Params} from './request'
import {IOObservable} from './IOObservable'
import {Source, createSafeSource} from './source'

export interface IO {
  (path: string, params?: Params): IOObservable
  (path: string, method: string, params?: Params): Promise<unknown>
  (
    requestOrPath: Request | string,
    methodOrParams?: string | Params,
    params?: Params
  ): IOObservable | Promise<unknown>
}

// Return consumer friendly API.
export const createIO = (source: Source) => {
  source = createSafeSource(source)

  const cache = {}

  // Accept request object like sources or [path, method, params] which
  // should be easier for consumers to work with.
  return function io(
    requestOrPath: Request | string,
    methodOrParams?: string | Params,
    params?: Params
  ) {
    const request = toRequest(requestOrPath, methodOrParams, params)

    // Add io to request to allow recursion.
    request.io = io as IO

    if (!isObserveRequest(request)) {
      return source(request)
    }

    return new IOObservable(source, request, cache)
  } as IO
}
