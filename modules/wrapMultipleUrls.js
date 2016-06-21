import isString from 'lodash/isString'
import isArray from 'lodash/isArray'
import isObject from 'lodash/isObject'
import zipObject from 'lodash/zipObject'
import keys from 'lodash/keys'
import map from 'lodash/map'

import {combineLatest} from 'rxjs/observable/combineLatest'
import {map as map$} from 'rxjs/operator/map'

import isObservable from './isObservable'
import isPromise from './isPromise'

// Allow URLs in multiple shapes:
// '/user'
// ['/user', '/user/login']
// {user: '/user', userLogin: '/user/login'}
export default function wrapMultipleUrls(source) {
  return function multipleUrls(request) {
    const urls = request.url

    if (isString(urls)) {
      // url -> val
      return source(request)
    }

    else if (isArray(urls)) {
      // [url, url] -> [val, val]
      const results = urls.map(url => source(Object.assign({}, request, {url})))
      return request.method === 'OBSERVE' ?
        combineLatest(results) :
        Promise.all(results)
    }

    else if (isObject(urls) && !isPromise(urls) && !isObservable(urls)) {
      // {k1: url, k2: url} -> {k1: val, k2: val}
      const ks = keys(urls)
      const results = map(urls, url => source(Object.assign({}, request, {url})))
      const combine = values => zipObject(ks, values)
      return request.method === 'OBSERVE' ?
        combineLatest(results)::map$(combine) :
        Promise.all(results).then(combine)
    }

    else {
      // url -> val
      return source(request)
    }
  }
}
