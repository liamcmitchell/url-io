import {_throw} from 'rxjs/observable/throw'
import isString from 'lodash/isString'
import {isObserveRequest} from './request'

export const reject = (request, error) => {
  if (!error) {
    throw new Error('reject requires error')
  }

  if (isString(error)) {
    error = new Error(error)
  }

  error.request = request

  return isObserveRequest(request) ? _throw(error) : Promise.reject(error)
}
