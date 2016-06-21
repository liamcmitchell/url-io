import isString from 'lodash/isString'
import isArray from 'lodash/isArray'
import filter from 'lodash/filter'

export function isUrl(url) {
  return isStringUrl(url) || isArrayUrl(url)
}

export function isStringUrl(url) {
  return isString(url) && url[0] === '/'
}

export function isArrayUrl(url) {
  return isArray(url) && url.every(isString)
}

export function urlToString(url) {
  return isString(url) ?
    url :
    '/' + url.join('/')
}

export function urlToArray(url) {
  return isArray(url) ?
    url :
    filter(url.split('/'))
}
