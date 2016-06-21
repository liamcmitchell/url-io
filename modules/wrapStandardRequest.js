import {isStringUrl} from './url'
import isObservable from './isObservable'
import isPromise from './isPromise'

// Enforce standard request format for all sources.
export default function wrapStandardRequest(source) {
  return function standardRequest(request) {
    const {url} = request

    // For simplicity we want all urls to be a string.
    if (!isStringUrl(url)) {
      throw new Error('Url must be string starting with forward slash (/): ' + url)
    }

    if (!request.method || typeof request.method !== 'string') {
      throw new Error('Method must be a string')
    }

    const result = source(request)

    if (request.method === 'OBSERVE') {
      if (!isObservable(result)) {
        throw new Error('Source must return observable for OBSERVE method: ' + url)
      }
    }
    else {
      if (!isPromise(result)) {
        throw new Error('Source must return promise for non-OBSERVE methods: ' + url)
      }
    }

    return result
  }
}
