import reject from './reject'
import {_throw} from 'rxjs/observable/throw'
import isObservable from './isObservable'
import isPromise from './isPromise'

export default function tryCatch(request, source) {
  const {method, path} = request
  try {
    const result = source(request)
    if (method === 'OBSERVE' && !isObservable(result)) {
      return _throw(new Error(`Source for ${path} didn't return Observable`))
    }
    if (method !== 'OBSERVE' && !isPromise(result)) {
      return Promise.reject(new Error(`Source for ${path} didn't return Promise`))
    }
    return result
  }
  catch (error) {
    return reject(request, error)
  }
}
