import {throwError} from 'rxjs'
import isString from 'lodash/isString'
import {isObserveRequest} from './request'

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
