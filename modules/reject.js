import {_throw} from 'rxjs/observable/throw'

export default function reject(request, error) {
  const {method} = request

  if (!error) {
    throw new Error('reject requires error')
  }

  if (typeof error === 'string') {
    error = new Error(error)
  }

  error.request = request

  return method === 'OBSERVE' ?
    _throw(error) :
    Promise.reject(error)
}
