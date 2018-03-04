import reject from './reject'
import isObservable from './isObservable'
import isPromise from './isPromise'

export default function tryCatch() {
  return (source) => (request) => {
    const {method, path} = request
    try {
      const result = source(request)
      if (method === 'OBSERVE' && !isObservable(result)) {
        return reject(request, `Source for ${path} didn't return Observable`)
      }
      if (method !== 'OBSERVE' && !isPromise(result)) {
        return reject(request, `Source for ${path} didn't return Promise`)
      }
      return result
    } catch (error) {
      return reject(request, error)
    }
  }
}
