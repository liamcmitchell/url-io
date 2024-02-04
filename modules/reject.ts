import {throwError} from 'rxjs'
import {Request, isObserveRequest} from './request'
import {isString} from './util'

export const reject = (request: Request, error: unknown) => {
  if (!error) {
    throw new Error('reject requires error')
  }

  // Deprecated.
  if (isString(error)) {
    error = new Error(error)
  }

  ;(error as Record<string, unknown>).request = request

  return isObserveRequest(request) ? throwError(error) : Promise.reject(error)
}
