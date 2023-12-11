import {throwError} from 'rxjs'
import {isObserveRequest} from './request'
import {isString} from './util'

export const reject = (request, error) => {
  if (!error) {
    throw new Error('reject requires error')
  }

  // Deprecated.
  if (isString(error)) {
    error = new Error(error)
  }

  error.request = request

  return isObserveRequest(request) ? throwError(error) : Promise.reject(error)
}
