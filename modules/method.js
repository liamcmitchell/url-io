import {isObservable} from './isObservable'
import {rejectNotFound} from './rejectNotFound'
import isString from 'lodash/isString'
import isFunction from 'lodash/isFunction'

const isMethod = (method) => isString(method) && /^[A-Z_]+$/.test(method)

const ensureMethod = (method) => {
  if (!isMethod(method))
    throw new Error('Method must upper case with underscores')
}

export const branchMethods = (methods) => (source) => {
  const sources = {}
  for (const method in methods) {
    ensureMethod(method)

    let methodSource = methods[method]

    // Allow shorthand for defining observables.
    if (method === 'OBSERVE' && isObservable(methodSource)) {
      methodSource = () => methods[method]
    }

    if (!isFunction(methodSource))
      throw new Error(`Method source must be a function (${method})`)

    sources[method] = methodSource
  }

  return (request) => {
    const {method} = request

    const methodSource = sources.hasOwnProperty(method)
      ? sources[method]
      : source

    return methodSource(request)
  }
}

export const methods = (methods) => {
  let defaultSource = rejectNotFound

  if (methods.hasOwnProperty('default')) {
    defaultSource = methods.default
    methods = Object.assign({}, methods)
    delete methods.default
  }

  return branchMethods(methods)(defaultSource)
}
