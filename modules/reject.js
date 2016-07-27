import {_throw} from 'rxjs/observable/throw'

export default function reject({method}, error) {
  return method === 'OBSERVE' ?
    _throw(error) :
    Promise.reject(error)
}
