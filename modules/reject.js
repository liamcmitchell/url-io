import {_throw} from 'rxjs/observable/throw'
import isString from 'lodash/isString'

export const reject = (request, error) => {
  const {method} = request

  if (!error) {
    throw new Error('reject requires error')
  }

  if (isString(error)) {
    error = new Error(error)
  }

  error.request = request

  return method === 'OBSERVE' ? _throw(error) : Promise.reject(error)
}
